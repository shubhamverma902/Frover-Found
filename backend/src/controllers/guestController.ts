import { Response, NextFunction } from 'express';
import Guest from '../models/Guest';
import ApiError from '../utils/ApiError';
import { sendSuccess } from '../utils/ApiResponse';
import { AuthRequest } from '../types';
import logActivity from '../utils/logActivity';
import { serializeGuest } from '../helpers/serializers';
import { ownerId } from '../helpers/authHelpers';
import { sanitize } from '../utils/sanitize';
import { parsePage } from '../utils/parsePage';

// ── CSV helpers ───────────────────────────────────────────────────────────────

function splitCsvRow(line: string): string[] {
  const fields: string[] = [];
  let i = 0;
  while (i <= line.length) {
    if (i === line.length) { fields.push(''); break; }
    if (line[i] === '"') {
      let field = '';
      i++;
      while (i < line.length) {
        if (line[i] === '"' && line[i + 1] === '"') { field += '"'; i += 2; }
        else if (line[i] === '"') { i++; break; }
        else { field += line[i++]; }
      }
      fields.push(field);
      if (line[i] === ',') i++;
    } else {
      const end = line.indexOf(',', i);
      if (end === -1) { fields.push(line.slice(i)); break; }
      fields.push(line.slice(i, end));
      i = end + 1;
    }
  }
  return fields;
}

function parseCsv(text: string): Record<string, string>[] {
  const lines = text.replace(/\r\n/g, '\n').replace(/\r/g, '\n').split('\n').filter(l => l.trim());
  if (lines.length < 2) return [];
  const headers = splitCsvRow(lines[0]).map(h => h.trim().toLowerCase());
  const result: Record<string, string>[] = [];
  for (let i = 1; i < lines.length; i++) {
    const values = splitCsvRow(lines[i]);
    const row: Record<string, string> = {};
    headers.forEach((h, j) => { row[h] = (values[j] ?? '').trim(); });
    if (Object.values(row).some(v => v)) result.push(row);
  }
  return result;
}

// Formula-injection guard: Excel/Sheets treat cells starting with =+-@ as formulas.
// Prefixing with a tab neutralises them — the tab is invisible in spreadsheet view
// but breaks formula parsing, and is valid inside a quoted CSV field (RFC 4180).
const FORMULA_PREFIX_RE = /^[=+\-@]/;

function csvEscape(v: string): string {
  const safe = FORMULA_PREFIX_RE.test(v) ? `\t${v}` : v;
  return `"${safe.replace(/"/g, '""')}"`;
}

// GET /api/v1/guests?page=1&limit=10&q=alice
export const getGuests = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const uid   = ownerId(req);
    // maxLimit=1000: seating chart fetches all guests in one request
    const { page, limit, skip } = parsePage(req.query, 10, 1000);

    const raw = typeof req.query.q === 'string' ? req.query.q.trim() : '';
    // Escape regex metacharacters to prevent injection and unintended matching
    const escaped = raw.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const searchFilter = escaped
      ? { $or: [
          { name:     { $regex: escaped, $options: 'i' } },
          { relation: { $regex: escaped, $options: 'i' } },
          { phone:    { $regex: escaped, $options: 'i' } },
        ] }
      : {};
    const filter    = { userId: uid, ...searchFilter };
    const baseFilter = { userId: uid };

    const [guests, total, grandTotal, confirmedCount, pendingCount, declinedCount] = await Promise.all([
      Guest.find(filter).sort({ createdAt: 1 }).skip(skip).limit(limit),
      Guest.countDocuments(filter),
      Guest.countDocuments(baseFilter),
      Guest.countDocuments({ ...baseFilter, rsvp: 'confirmed' }),
      Guest.countDocuments({ ...baseFilter, rsvp: 'pending' }),
      Guest.countDocuments({ ...baseFilter, rsvp: 'declined' }),
    ]);

    sendSuccess(res, {
      guests:     guests.map(serializeGuest),
      total,
      page,
      totalPages: Math.ceil(total / limit),
      grandTotal,
      confirmed:  confirmedCount,
      pending:    pendingCount,
      declined:   declinedCount,
    });
  } catch (err) {
    next(err);
  }
};

// POST /api/v1/guests
export const createGuest = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { name, relation, phone, rsvp, meal, plusOne } = req.body;
    if (!name?.trim()) return next(new ApiError(422, 'Guest name is required'));
    const uid = ownerId(req);

    const guest = await Guest.create({
      userId: uid,
      name:     sanitize(name),
      relation: sanitize(relation),
      phone:    sanitize(phone),
      rsvp:     rsvp    ?? 'pending',
      meal:     meal    ?? 'Veg',
      plusOne:  Boolean(plusOne),
    });

    logActivity(uid, '👤', `Guest added: ${guest.name}`);
    sendSuccess(res, { guest: serializeGuest(guest) }, 'Guest added', 201);
  } catch (err) {
    next(err);
  }
};

// PATCH /api/v1/guests/:id/rsvp
export const patchGuestRsvp = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { rsvp } = req.body;
    if (!['confirmed', 'pending', 'declined'].includes(rsvp))
      return next(new ApiError(422, 'Invalid RSVP value'));
    const uid = ownerId(req);

    const guest = await Guest.findOneAndUpdate(
      { _id: req.params.id, userId: uid },
      { rsvp },
      { new: true }
    );
    if (!guest) return next(new ApiError(404, 'Guest not found'));
    if (rsvp === 'confirmed') logActivity(uid, '✉', `${guest.name} confirmed attendance`);
    if (rsvp === 'declined')  logActivity(uid, '✉', `${guest.name} declined invitation`);
    sendSuccess(res, { guest: serializeGuest(guest) });
  } catch (err) {
    next(err);
  }
};

// POST /api/v1/guests/import
export const importGuests = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    if (!req.file) return next(new ApiError(400, 'CSV file is required'));
    const uid  = ownerId(req);
    const text = req.file.buffer.toString('utf8');
    const rows = parseCsv(text);
    if (rows.length === 0)   return next(new ApiError(422, 'CSV has no valid data rows'));
    if (rows.length > 500)   return next(new ApiError(422, 'CSV must not exceed 500 rows'));

    const VALID_RSVP = new Set(['confirmed', 'pending', 'declined']);
    const VALID_MEAL = new Set(['Veg', 'Non-veg', 'Jain']);
    const docs: object[]    = [];
    const docRows: number[] = []; // parallel: docRows[i] = CSV row number of docs[i]
    const errors: string[]  = [];

    for (let i = 0; i < rows.length; i++) {
      const row  = rows[i];
      const name = sanitize(row['name'] ?? '').trim();
      if (!name) { errors.push(`Row ${i + 2}: name is required`); continue; }
      docRows.push(i + 2);
      docs.push({
        userId:   uid,
        name,
        relation: sanitize(row['relation'] ?? ''),
        phone:    sanitize(row['phone']    ?? ''),
        rsvp:     VALID_RSVP.has(row['rsvp']) ? row['rsvp'] : 'pending',
        meal:     VALID_MEAL.has(row['meal']) ? row['meal'] : 'Veg',
        plusOne:  ['true', '1', 'yes'].includes((row['plusone'] ?? '').toLowerCase()),
      });
    }

    let insertedCount = 0;
    try {
      const inserted = await Guest.insertMany(docs, { ordered: false });
      insertedCount = inserted.length;
    } catch (bulkErr: unknown) {
      // ordered:false throws MongoBulkWriteError when some docs fail but still
      // inserts the valid ones. Surface each failure as a row-level error and
      // continue to the success response with partial results.
      // Any other error (network, auth) re-throws to the outer catch → next(err).
      if (
        bulkErr instanceof Error &&
        'writeErrors' in bulkErr &&
        Array.isArray((bulkErr as Record<string, unknown>).writeErrors)
      ) {
        const bwe = bulkErr as unknown as { result: { insertedCount: number }; writeErrors: Array<{ index: number; errmsg?: string }> };
        insertedCount = bwe.result?.insertedCount ?? 0;
        for (const we of bwe.writeErrors) {
          const row = docRows[we.index] ?? (we.index + 2);
          errors.push(`Row ${row}: ${we.errmsg ?? 'Insert failed'}`);
        }
      } else {
        throw bulkErr;
      }
    }

    logActivity(uid, '👥', `Imported ${insertedCount} guests via CSV`);
    sendSuccess(res, { imported: insertedCount, skipped: errors.length, errors }, 'Guests imported', 201);
  } catch (err) {
    next(err);
  }
};

// GET /api/v1/guests/export
export const exportGuests = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const guests = await Guest.find({ userId: ownerId(req) }).sort({ createdAt: 1 }).lean();
    const header = 'name,relation,phone,rsvp,meal,plusOne\n';
    const body   = guests.map(g =>
      [g.name, g.relation, g.phone, g.rsvp, g.meal, String(g.plusOne)]
        .map(v => csvEscape(String(v ?? '')))
        .join(',')
    ).join('\n');
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename="guests.csv"');
    res.send(header + body);
  } catch (err) {
    next(err);
  }
};

// PUT /api/v1/guests/:id
export const updateGuest = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { name, relation, phone, rsvp, meal, plusOne } = req.body;
    const uid = ownerId(req);

    const guest = await Guest.findOneAndUpdate(
      { _id: req.params.id, userId: uid },
      {
        name:     sanitize(name),
        relation: sanitize(relation ?? ''),
        phone:    sanitize(phone    ?? ''),
        rsvp:     rsvp   ?? 'pending',
        meal:     meal   ?? 'Veg',
        plusOne:  Boolean(plusOne),
      },
      { new: true, runValidators: true }
    );
    if (!guest) return next(new ApiError(404, 'Guest not found'));

    logActivity(uid, '👤', `Guest updated: ${guest.name}`);
    sendSuccess(res, { guest: serializeGuest(guest) });
  } catch (err) {
    next(err);
  }
};

// DELETE /api/v1/guests/:id
export const deleteGuest = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const guest = await Guest.findOneAndDelete({ _id: req.params.id, userId: ownerId(req) });
    if (!guest) return next(new ApiError(404, 'Guest not found'));
    sendSuccess(res, null, 'Guest removed');
  } catch (err) {
    next(err);
  }
};
