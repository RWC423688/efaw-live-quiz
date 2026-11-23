// Highfield Learner Answer Sheet (LAS) generator.
// Fills the ORIGINAL Highfield LAS PDF (imported privately into Firebase, never stored in this repo)
// with the candidate's details, shaded answer bubbles, Pass/Refer ticks and the MCQ mark.
// Needs pdf-lib loaded as window.PDFLib.

const H = 842.04;   // A4 page height in points (the LAS template)

// Measured from the LAS template (pdf points, top-left origin): bubbles A–D per question 1–15.
const BUBBLES = [
  [[157.1,460.2,179.9,474.4],[192.8,460.2,215.8,474.4],[229.1,460.2,251.9,474.4],[265.3,460.2,288.1,474.4]],
  [[157.1,480.3,180.0,494.4],[192.8,480.3,215.8,494.4],[229.1,480.3,252.0,494.4],[265.3,480.3,288.2,494.4]],
  [[157.1,501.5,179.9,515.6],[192.8,501.5,215.8,515.6],[229.1,501.5,251.9,515.6],[265.3,501.5,288.1,515.6]],
  [[157.1,522.3,179.9,536.5],[192.8,522.3,215.8,536.5],[229.1,522.3,251.9,536.5],[265.3,522.3,288.1,536.5]],
  [[157.1,543.9,179.9,558.1],[192.8,543.9,215.8,558.1],[229.1,543.9,251.9,558.1],[265.3,543.9,288.1,558.1]],
  [[158.6,565.1,181.4,579.3],[194.3,565.1,217.2,579.3],[230.6,565.1,253.4,579.3],[266.8,565.1,289.6,579.3]],
  [[158.6,586.7,181.4,600.9],[194.3,586.7,217.2,600.9],[230.6,586.7,253.4,600.9],[266.8,586.7,289.6,600.9]],
  [[158.6,608.0,181.4,622.1],[194.3,608.0,217.2,622.1],[230.6,608.0,253.4,622.1],[266.8,608.0,289.6,622.1]],
  [[158.6,630.3,181.4,644.5],[194.3,630.3,217.2,644.5],[230.6,630.3,253.4,644.5],[266.8,630.3,289.6,644.5]],
  [[158.6,653.4,181.4,667.6],[194.3,653.4,217.2,667.6],[230.6,653.4,253.4,667.6],[266.8,653.4,289.6,667.6]],
  [[158.6,676.2,181.4,690.3],[194.3,676.2,217.2,690.3],[230.6,676.2,253.4,690.3],[266.8,676.2,289.6,690.3]],
  [[158.6,698.5,181.4,712.7],[194.3,698.5,217.2,712.7],[230.6,698.5,253.4,712.7],[266.8,698.5,289.6,712.7]],
  [[158.6,720.9,181.4,735.0],[194.3,720.9,217.2,735.0],[230.6,720.9,253.4,735.0],[266.8,720.9,289.6,735.0]],
  [[157.9,743.3,180.8,757.5],[193.9,742.2,216.8,756.3],[230.6,741.4,253.4,755.6],[266.1,740.8,288.9,754.9]],
  [[158.4,763.3,181.3,777.5],[193.8,761.9,216.7,776.1],[230.5,762.5,253.4,776.6],[267.0,763.4,289.9,776.2]]
];
// Pass / Refer tick boxes per question.
const BOXES = [
  [[409.0,458.3,420.9,470.2],[472.5,458.3,484.4,470.2]],
  [[409.1,478.3,421.0,490.2],[472.6,478.3,484.5,490.2]],
  [[409.1,499.2,421.0,511.1],[472.6,499.2,484.5,511.1]],
  [[409.4,521.6,421.3,533.5],[472.4,521.6,484.3,533.5]],
  [[409.8,543.6,421.7,555.5],[473.4,543.6,485.3,555.5]],
  [[410.6,565.7,422.5,577.6],[473.6,565.7,485.5,577.6]],
  [[409.8,587.3,421.7,599.2],[472.8,587.3,484.7,599.2]],
  [[409.8,607.4,421.7,619.3],[473.4,607.4,485.3,619.3]],
  [[409.8,627.9,421.7,639.8],[473.4,627.9,485.3,639.8]],
  [[410.6,649.2,422.5,661.1],[474.1,649.2,486.0,661.1]],
  [[409.8,672.2,421.7,684.1],[473.4,672.2,485.3,684.1]],
  [[409.8,696.6,421.7,708.5],[473.4,696.6,485.3,708.5]],
  [[409.8,720.4,421.7,732.3],[472.8,720.4,484.7,732.3]],
  [[410.6,741.0,422.5,752.9],[473.6,741.0,485.5,752.9]],
  [[409.8,762.6,421.7,774.5],[473.4,762.6,485.3,774.5]]
];
// Header fields on page 1: [x after label, top, x limit] (text baseline sits ~9pt below top).
const FIELDS1 = {
  courseId:     [265, 170.6, 337],
  assessDate:   [463, 170.6, 563],
  centreName:   [107, 199.7, 337],
  centreNumber: [440, 199.7, 563],
  tutorName:    [100, 228.8, 337],
  tutorNumber:  [433, 228.8, 563],
  learnerName:  [113, 258.0, 337],
  dob:          [425, 258.0, 563]
};
const FIELDS2 = { learnerName: [116, 84.3, 352], courseId: [420, 84.3, 556] };
const LETTERS = ["A", "B", "C", "D"];

export function markPaper(answers, key){
  // answers: {1:"B", ...}; key: ["B", ...] (15). Returns per-question results and the MCQ mark.
  const rows = key.map((k, i) => { const a = answers?.[i + 1] || answers?.[String(i + 1)] || ""; return { n: i + 1, answer: a, correct: !!a && a === k }; });
  const mark = rows.filter(r => r.correct).length;
  return { rows, mark, total: key.length };
}

export async function buildLasPdf({ templateB64, templatePaperCode, paperCode, passMark = 11, fields, answers, key }){
  const { PDFDocument, StandardFonts, rgb } = window.PDFLib;
  const bytes = Uint8Array.from(atob(templateB64), c => c.charCodeAt(0));
  const doc = await PDFDocument.load(bytes);
  const [p1, p2] = doc.getPages();
  const font = await doc.embedFont(StandardFonts.Helvetica);
  const bold = await doc.embedFont(StandardFonts.HelveticaBold);
  const pencil = rgb(0.17, 0.17, 0.19);
  const shade = rgb(0.5, 0.5, 0.5);
  const white = rgb(1, 1, 1);

  const MAP = { "Ł":"L", "ł":"l", "Ø":"O", "ø":"o", "Đ":"D", "đ":"d", "Ħ":"H", "ħ":"h", "ı":"i", "Œ":"OE", "œ":"oe", "ß":"ss" };
  const safe = (t, f) => [...String(t)].map(ch => {
    for (const c of [ch, ch.normalize("NFD").replace(/[\u0300-\u036f]/g, ""), MAP[ch]]){ if (!c) continue; try { f.encodeText(c); return c; } catch(e){} }
    return "?"; }).join("");
  const write = (page, text, [x, top, limit], size = 10, f = font) => {
    if (!text) return;
    let s = size; const t = safe(String(text), f);
    while (s > 6 && f.widthOfTextAtSize(t, s) > limit - x) s -= 0.5;
    page.drawText(t, { x, y: H - top - 9.2, size: s, font: f, color: pencil });
  };
  const tick = (page, [x0, top, x1, bottom]) => {
    const yb = H - bottom, w = x1 - x0, h = bottom - top;
    page.drawLine({ start: { x: x0 + w * 0.18, y: yb + h * 0.52 }, end: { x: x0 + w * 0.42, y: yb + h * 0.22 }, thickness: 1.6, color: pencil });
    page.drawLine({ start: { x: x0 + w * 0.42, y: yb + h * 0.22 }, end: { x: x0 + w * 0.86, y: yb + h * 0.86 }, thickness: 1.6, color: pencil });
  };

  // Paper code: the template carries its own code; if a different paper was sat, show that paper's code instead.
  if (paperCode && templatePaperCode && paperCode !== templatePaperCode){
    p1.drawRectangle({ x: 98.5, y: H - 182.2, width: 66, height: 12.2, color: white });
    p1.drawText(paperCode, { x: 99.1, y: H - 179.9, size: 11, font: bold, color: rgb(0, 0, 0) });
    for (const p of [p1, p2]){
      p.drawRectangle({ x: 300.5, y: H - 824.2, width: 40.5, height: 8, color: white });
      p.drawText(paperCode, { x: 301, y: H - 822.3, size: 7, font, color: rgb(0, 0, 0) });
    }
  }

  // Page 1 header details (CAPITAL letters, as the form asks)
  const up = v => (v == null ? "" : String(v).toUpperCase());
  for (const [k, pos] of Object.entries(FIELDS1)) write(p1, up(fields[k]), pos);

  // Answers: shade the chosen bubble; tick Pass or Refer
  const { rows, mark } = markPaper(answers, key);
  rows.forEach((r, i) => {
    const li = LETTERS.indexOf(r.answer);
    if (li >= 0){
      const [x0, top, x1, bottom] = BUBBLES[i][li];
      p1.drawEllipse({ x: (x0 + x1) / 2, y: H - (top + bottom) / 2, xScale: (x1 - x0) / 2 - 0.9, yScale: (bottom - top) / 2 - 0.9, color: shade });
    }
    tick(p1, BOXES[i][r.correct ? 0 : 1]);
  });

  // Page 2
  write(p2, up(fields.learnerName), FIELDS2.learnerName);
  write(p2, up(fields.courseId), FIELDS2.courseId);
  const mcq = String(mark), mw = bold.widthOfTextAtSize(mcq, 11);
  p2.drawText(mcq, { x: (98 + 181.3) / 2 - mw / 2, y: H - 369.6, size: 11, font: bold, color: pencil });
  tick(p2, mark >= passMark ? [329.5, 390.5, 344.5, 405] : [397.2, 390.5, 412.2, 405]);
  const tw = bold.widthOfTextAtSize(mcq, 11);
  p2.drawText(mcq, { x: 536 - tw, y: H - 400.6, size: 11, font: bold, color: pencil });

  doc.setTitle(`Learner Answer Sheet - ${fields.learnerName || ""} - ${paperCode || ""}`);
  return new Blob([await doc.save()], { type: "application/pdf" });
}

export const fmtUK = iso => { if (!iso) return ""; const [y, m, d] = String(iso).split("-"); return d && m && y ? `${d}/${m}/${y}` : String(iso); };
