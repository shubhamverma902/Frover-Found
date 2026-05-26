import type { Guest } from '@/types/guest';
import type { ChecklistCategory } from '@/types/checklist';

type RGB = [number, number, number];

const GOLD:  RGB = [228, 188, 98];
const DARK:  RGB = [35,  41,  46];
const CREAM: RGB = [252, 251, 248];
const MUTED: RGB = [140, 140, 135];

const GREEN:  RGB = [34,  139, 34];
const AMBER:  RGB = [190, 130, 0];
const RED:    RGB = [192, 57,  43];

const PAGE_W  = 210;
const MARGIN  = 14;
const BODY_W  = PAGE_W - MARGIN * 2; // 182 mm

const fmtDate = (iso: string) =>
  new Date(iso + 'T00:00:00').toLocaleDateString('en-US', {
    month: 'short', day: 'numeric', year: 'numeric',
  });

function paintHeader(doc: any, subtitle: string) {
  doc.setFillColor(...GOLD);
  doc.rect(0, 0, PAGE_W, 20, 'F');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(14);
  doc.setTextColor(...DARK);
  doc.text('Forever Found', MARGIN, 13);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.text(subtitle, PAGE_W - MARGIN, 13, { align: 'right' });

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7);
  doc.setTextColor(...MUTED);
  doc.text(
    `Generated ${new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}`,
    MARGIN,
    27,
  );
}

function paintFooter(doc: any, label: string) {
  const count = (doc as any).internal.getNumberOfPages();
  for (let i = 1; i <= count; i++) {
    doc.setPage(i);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7);
    doc.setTextColor(...MUTED);
    doc.text(`Forever Found — ${label}`, MARGIN, 290);
    doc.text(`Page ${i} of ${count}`, PAGE_W - MARGIN, 290, { align: 'right' });
  }
}

// ── Guest List ────────────────────────────────────────────────────────────────

export async function exportGuestListPDF(stats: {
  total: number;
  confirmed: number;
  pending:   number;
  declined:  number;
}) {
  const [{ default: jsPDF }, { default: autoTable }, { fetchGuestsApi }] = await Promise.all([
    import('jspdf'),
    import('jspdf-autotable'),
    import('@/api/guests.api'),
  ]);

  // Fetch every guest in one shot (no pagination)
  const { guests } = await fetchGuestsApi(1, 9999);

  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
  paintHeader(doc, 'Guest List');

  // Stats row
  const statsY = 34;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  const bands: { label: string; color: RGB }[] = [
    { label: `Total: ${stats.total}`,         color: DARK  },
    { label: `Confirmed: ${stats.confirmed}`, color: GREEN },
    { label: `Pending: ${stats.pending}`,     color: AMBER },
    { label: `Declined: ${stats.declined}`,   color: RED   },
  ];
  let x = MARGIN;
  for (const b of bands) {
    doc.setTextColor(...b.color);
    doc.text(b.label, x, statsY);
    x += doc.getTextWidth(b.label) + 10;
  }

  // Sort: confirmed → pending → declined
  const order: Record<string, number> = { confirmed: 0, pending: 1, declined: 2 };
  const sorted = [...guests].sort((a, b) => order[a.rsvp] - order[b.rsvp]);

  autoTable(doc, {
    startY: 40,
    head: [['Name', 'Relation', 'Phone', 'RSVP', 'Meal', '+1']],
    body: sorted.map(g => [
      g.name,
      g.relation || '—',
      g.phone    || '—',
      g.rsvp.charAt(0).toUpperCase() + g.rsvp.slice(1),
      g.meal     || '—',
      g.plusOne  ? 'Yes' : 'No',
    ]),
    headStyles: {
      fillColor: GOLD,
      textColor: DARK,
      fontStyle: 'bold',
      fontSize:  8,
    },
    bodyStyles:          { fontSize: 8, textColor: DARK },
    alternateRowStyles:  { fillColor: CREAM },
    columnStyles: {
      0: { cellWidth: 42 },
      1: { cellWidth: 30 },
      2: { cellWidth: 34 },
      3: { cellWidth: 26 },
      4: { cellWidth: 26 },
      5: { cellWidth: 14 },
    },
    margin: { left: MARGIN, right: MARGIN },
    didParseCell: data => {
      if (data.section === 'body' && data.column.index === 3) {
        const v = data.cell.raw as string;
        if      (v === 'Confirmed') data.cell.styles.textColor = GREEN;
        else if (v === 'Pending')   data.cell.styles.textColor = AMBER;
        else if (v === 'Declined')  data.cell.styles.textColor = RED;
      }
    },
  });

  paintFooter(doc, 'Guest List');
  doc.save(`guest-list-${new Date().toISOString().slice(0, 10)}.pdf`);
}

// ── Checklist ─────────────────────────────────────────────────────────────────

export async function exportChecklistPDF(
  categories: ChecklistCategory[],
  doneCount:   number,
  totalCount:  number,
) {
  const [{ default: jsPDF }, { default: autoTable }] = await Promise.all([
    import('jspdf'),
    import('jspdf-autotable'),
  ]);

  const doc      = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
  const progress = totalCount > 0 ? Math.round((doneCount / totalCount) * 100) : 0;

  paintHeader(doc, 'Wedding Checklist');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(...DARK);
  doc.text(
    `${doneCount} of ${totalCount} tasks complete — ${progress}% done`,
    MARGIN,
    34,
  );

  let curY = 40;

  for (const cat of categories) {
    if (curY > 252) {
      doc.addPage();
      curY = 20;
    }

    // Category header band
    doc.setFillColor(...DARK);
    doc.rect(MARGIN, curY, BODY_W, 9, 'F');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8.5);
    doc.setTextColor(...GOLD);
    doc.text(cat.category, MARGIN + 5, curY + 6);

    // done/total count — right-aligned inside the band
    const doneCat  = cat.tasks.filter(t => t.done).length;
    const totalCat = cat.tasks.length;
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7.5);
    doc.setTextColor(180, 150, 50);
    doc.text(`${doneCat}/${totalCat}`, PAGE_W - MARGIN - 5, curY + 6, { align: 'right' });

    curY += 9;

    if (cat.tasks.length === 0) {
      curY += 4;
      continue;
    }

    autoTable(doc, {
      startY:   curY,
      showHead: 'never',
      body: cat.tasks.map(t => [
        t.done ? '[x]' : '[ ]',
        t.label,
        t.due ? fmtDate(t.due) : '—',
      ]),
      bodyStyles:         { fontSize: 8, textColor: DARK },
      alternateRowStyles: { fillColor: CREAM },
      columnStyles: {
        0: { cellWidth: 12, halign: 'center', fontStyle: 'bold' },
        1: { cellWidth: 'auto' as unknown as number },
        2: { cellWidth: 35, halign: 'right' },
      },
      margin: { left: MARGIN, right: MARGIN },
      styles: { lineColor: [210, 210, 205], lineWidth: 0.1 },
      didParseCell: data => {
        if (data.section !== 'body') return;
        const isDone = (data.row.raw as string[])[0] === '[x]';
        if (data.column.index === 0) {
          data.cell.styles.textColor = isDone ? GREEN : MUTED;
        }
        if (data.column.index === 1 && isDone) {
          data.cell.styles.textColor = MUTED;
        }
      },
    });

    curY = (doc as any).lastAutoTable.finalY + 6;
  }

  paintFooter(doc, 'Wedding Checklist');
  doc.save(`checklist-${new Date().toISOString().slice(0, 10)}.pdf`);
}
