import { BudgetCategory } from '../models/Budget';
import ChecklistCategory from '../models/Checklist';
import Event from '../models/Event';
import Guest from '../models/Guest';
import Vendor from '../models/Vendor';
import { fmtDateISO, fmtDateShort } from './dateHelpers';

export const serializeBudgetCategory = (cat: InstanceType<typeof BudgetCategory>) => ({
  _id:       String(cat._id),
  icon:      cat.icon,
  category:  cat.category,
  allocated: cat.allocated,
  spent:     cat.expenses.reduce((s, e) => s + e.amount, 0),
  expenses:  cat.expenses.map(e => ({
    _id:    String(e._id),
    amount: e.amount,
    note:   e.note,
    date:   fmtDateShort(e.date),
  })),
});

export const serializeChecklistCategory = (cat: InstanceType<typeof ChecklistCategory>) => ({
  _id:      String(cat._id),
  icon:     cat.icon,
  category: cat.category,
  tasks:    cat.tasks.map(t => ({
    _id:   String(t._id),
    label: t.label,
    due:   t.due,
    done:  t.done,
  })),
});

export const serializeEvent = (e: InstanceType<typeof Event>) => ({
  _id:    String(e._id),
  name:   e.name,
  date:   fmtDateISO(e.date),
  time:   e.time,
  venue:  e.venue,
  guests: e.guests,
  status: e.status,
  desc:   e.desc,
  attachments: (e.attachments ?? []).map(a => ({
    _id:          String(a._id),
    filename:     a.filename,
    originalName: a.originalName,
    url:          a.url,
    mimetype:     a.mimetype,
    size:         a.size,
    uploadedAt:   a.uploadedAt.toISOString(),
  })),
});

export const serializeGuest = (g: InstanceType<typeof Guest>) => ({
  _id:      String(g._id),
  name:     g.name,
  relation: g.relation,
  phone:    g.phone,
  rsvp:     g.rsvp,
  meal:     g.meal,
  plusOne:  g.plusOne,
});

export const serializeVendor = (v: InstanceType<typeof Vendor>) => ({
  _id:      String(v._id),
  icon:     v.icon,
  category: v.category,
  name:     v.name,
  contact:  v.contact,
  location: v.location,
  status:   v.status,
  rating:   v.rating,
  notes:    v.notes,
  attachments: (v.attachments ?? []).map(a => ({
    _id:          String(a._id),
    filename:     a.filename,
    originalName: a.originalName,
    url:          a.url,
    mimetype:     a.mimetype,
    size:         a.size,
    uploadedAt:   a.uploadedAt.toISOString(),
  })),
});
