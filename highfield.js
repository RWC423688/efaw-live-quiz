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

export async function buildLasPdf({ templateB64, templatePaperCode, paperCode, passMark = 11, fields, answers, key, signaturePngB64 = null, learnerSignaturePngB64 = null, editable = true }){
  const { PDFDocument, StandardFonts, rgb } = window.PDFLib;
  const bytes = Uint8Array.from(atob(templateB64), c => c.charCodeAt(0));
  const doc = await PDFDocument.load(bytes);
  const [p1, p2] = doc.getPages();
  const font = await doc.embedFont(StandardFonts.Helvetica);
  const bold = await doc.embedFont(StandardFonts.HelveticaBold);
  const pencil = rgb(0.17, 0.17, 0.19);
  const shade = rgb(0.5, 0.5, 0.5);
  const white = rgb(1, 1, 1);
  const form = doc.getForm();

  const MAP = { "Ł":"L", "ł":"l", "Ø":"O", "ø":"o", "Đ":"D", "đ":"d", "Ħ":"H", "ħ":"h", "ı":"i", "Œ":"OE", "œ":"oe", "ß":"ss" };
  const safe = (t, f) => [...String(t)].map(ch => {
    for (const c of [ch, ch.normalize("NFD").replace(/[̀-ͯ]/g, ""), MAP[ch]]){ if (!c) continue; try { f.encodeText(c); return c; } catch(e){} }
    return "?"; }).join("");
  const fit = (t, f, size, width) => { let s = size; while (s > 6 && f.widthOfTextAtSize(t, s) > width) s -= 0.5; return s; };
  // Fillable text box: [x, top, right, bottom] in top-left page coordinates. Value is pre-filled; anyone can edit it in a PDF reader.
  const field = (page, name, text, [x, top, right, bottom], { size = 10, f = font, multiline = false, align = 0 } = {}) => {
    const t = text == null ? "" : safe(String(text), f);
    if (!editable){
      if (!t) return;
      const s = fit(t, f, size, right - x - 2);
      const tx = align === 2 ? right - 2 - f.widthOfTextAtSize(t, s) : align === 1 ? (x + right) / 2 - f.widthOfTextAtSize(t, s) / 2 : x + 2;
      page.drawText(t, { x: tx, y: H - (top + bottom) / 2 - s * 0.35, size: s, font: f, color: pencil });
      return;
    }
    const tf = form.createTextField(name);
    if (multiline) tf.enableMultiline();
    tf.setText(t);
    tf.setAlignment(align);
    tf.addToPage(page, { x, y: H - bottom, width: right - x, height: bottom - top, font: f, textColor: pencil, borderWidth: 0 });
    tf.setFontSize(multiline ? size : fit(t, f, size, right - x - 4));
    tf.updateAppearances(f);
  };
  const tick = (page, [x0, top, x1, bottom]) => {
    const yb = H - bottom, w = x1 - x0, h = bottom - top;
    page.drawLine({ start: { x: x0 + w * 0.18, y: yb + h * 0.52 }, end: { x: x0 + w * 0.42, y: yb + h * 0.22 }, thickness: 1.6, color: pencil });
    page.drawLine({ start: { x: x0 + w * 0.42, y: yb + h * 0.22 }, end: { x: x0 + w * 0.86, y: yb + h * 0.86 }, thickness: 1.6, color: pencil });
  };
  const checkbox = (page, name, on, box) => {
    if (!editable){ if (on) tick(page, box); return; }
    const [x0, top, x1, bottom] = box, pad = 3;
    const cb = form.createCheckBox(name);
    cb.addToPage(page, { x: x0 + pad, y: H - bottom + pad, width: x1 - x0 - pad * 2, height: bottom - top - pad * 2, textColor: pencil, borderWidth: 0 });
    if (on) cb.check();
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
  for (const [k, [x, top, limit]] of Object.entries(FIELDS1)) field(p1, k, up(fields[k]), [x, top - 3.5, limit, top + 15]);

  // Answers: shade the chosen bubble; tick Pass or Refer. These are the learner's submitted answers, so they stay fixed.
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
  field(p2, "learnerName2", up(fields.learnerName), [FIELDS2.learnerName[0], 79, FIELDS2.learnerName[2], 99]);
  field(p2, "courseId2", up(fields.courseId), [FIELDS2.courseId[0], 79, FIELDS2.courseId[2], 99]);
  if (learnerSignaturePngB64){
    // The learner signed on their device when they submitted the paper.
    const ls = await doc.embedPng(Uint8Array.from(atob(learnerSignaturePngB64), c => c.charCodeAt(0)));
    const bw = 166, bh = 21, k = Math.min(bw / ls.width, bh / ls.height), w = ls.width * k, h = ls.height * k;
    p2.drawImage(ls, { x: 400, y: H - 138.5 + (bh - h) / 2, width: w, height: h });
  } else field(p2, "learnerSignature", "", [398, 117, 568, 139]);

  let commentsBottom = 257;
  if (signaturePngB64){
    // Tutor signature sits in the bottom-right of the Tutor Comments area (the sheet has no separate tutor signature box).
    const png = await doc.embedPng(Uint8Array.from(atob(signaturePngB64), c => c.charCodeAt(0)));
    const maxW = 150, maxH = 30, sc = Math.min(maxW / png.width, maxH / png.height);
    const w = png.width * sc, h = png.height * sc, right = 566, bottom = 257;
    p2.drawImage(png, { x: right - w, y: H - bottom, width: w, height: h });
    const label = "Tutor signature:";
    p2.drawText(label, { x: right - maxW - 6 - bold.widthOfTextAtSize(label, 9), y: H - bottom + 4, size: 9, font: bold, color: rgb(0, 0, 0) });
    p2.drawLine({ start: { x: right - maxW - 2, y: H - bottom + 1.5 }, end: { x: right, y: H - bottom + 1.5 }, thickness: 0.5, color: rgb(0.6, 0.6, 0.6) });
    commentsBottom = bottom - maxH - 4;
  }
  if (editable) field(p2, "tutorComments", "", [26, 177, 568, commentsBottom], { multiline: true, size: 10 });

  const mcq = String(mark);
  field(p2, "mcqMark", mcq, [98, 356.3, 181.3, 375.8], { size: 11, f: bold, align: 1 });
  field(p2, "furtherMarks", "", [466.8, 356.3, 553.3, 375.8], { size: 11, f: bold, align: 1 });
  const passed = mark >= passMark;
  checkbox(p2, "summaryPass", passed, [326, 387.8, 347.9, 407.3]);
  checkbox(p2, "summaryRefer", !passed, [393.7, 387.8, 415.6, 407.3]);
  field(p2, "totalMarks", mcq, [499.7, 387.8, 538, 407.3], { size: 11, f: bold, align: 2 });

  doc.setTitle(`Learner Answer Sheet - ${fields.learnerName || ""} - ${paperCode || ""}`);
  return new Blob([await doc.save()], { type: "application/pdf" });
}

export const fmtUK = iso => { if (!iso) return ""; const [y, m, d] = String(iso).split("-"); return d && m && y ? `${d}/${m}/${y}` : String(iso); };
