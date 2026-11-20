// Shared helpers: DOM, scoring, PDF records, QR codes, downloads.
import { TOPICS, BANK, byId } from "./questions.js";
import { ORG_NAME } from "./config.js";

export const $ = s => document.querySelector(s);
export const esc = s => String(s ?? "").replace(/[&<>"']/g, c => ({ "&":"&amp;", "<":"&lt;", ">":"&gt;", '"':"&quot;", "'":"&#39;" }[c]));
export const shuffle = a => { a = a.slice(); for (let i = a.length - 1; i > 0; i--){ const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; };
export const LETTERS = "ABCD";

export function toast(msg){
  let t = document.getElementById("toast");
  if (!t){ t = document.createElement("div"); t.id = "toast"; t.className = "toast"; document.body.appendChild(t); }
  t.textContent = msg; t.classList.add("show");
  clearTimeout(t._h); t._h = setTimeout(() => t.classList.remove("show"), 2200);
}

export function confirmBox(title, body, yesLabel = "Yes"){
  return new Promise(res => {
    const m = document.createElement("div");
    m.className = "modal show";
    m.innerHTML = `<div class="card"><h2>${esc(title)}</h2><p class="lead">${esc(body)}</p><div class="actions"><button class="btn ghost" data-a="0" type="button">Cancel</button><button class="btn" data-a="1" type="button">${esc(yesLabel)}</button></div></div>`;
    m.onclick = e => { const b = e.target.closest("button"); if (!b) return; m.remove(); res(b.dataset.a === "1"); };
    document.body.appendChild(m);
  });
}

export const fmtDate = ms => {
  const d = new Date(ms);
  return d.toLocaleDateString("en-GB", { day:"numeric", month:"long", year:"numeric" }) + " at " + d.toLocaleTimeString("en-GB", { hour:"2-digit", minute:"2-digit" });
};
export const isoDate = ms => { const d = new Date(ms); return d.getFullYear() + "-" + String(d.getMonth() + 1).padStart(2, "0") + "-" + String(d.getDate()).padStart(2, "0"); };

// Choice is stored as the ORIGINAL option index: 0 is always the correct answer.
export function scoreAnswers(list){
  const answers = list.filter(a => byId[a.qid]).sort((x, y) => (x.at || 0) - (y.at || 0));
  const byT = {};
  answers.forEach(a => {
    const t = byId[a.qid][1];
    byT[t] = byT[t] || { n:0, c:0 };
    byT[t].n++; if (a.choice === 0) byT[t].c++;
  });
  const main = answers.filter(a => !a.retest), catchup = answers.filter(a => a.retest);
  const c = answers.filter(a => a.choice === 0).length;
  return {
    answers, byT, n: answers.length, c,
    pct: answers.length ? Math.round(c / answers.length * 100) : 0,
    main: { n: main.length, c: main.filter(a => a.choice === 0).length },
    catchup: { n: catchup.length, c: catchup.filter(a => a.choice === 0).length },
    missed: answers.filter(a => a.choice !== 0)
  };
}

export const safeName = n => (String(n || "Candidate").replace(/[\u2013\u2014]/g, "-").replace(/[^\p{L}\p{N} .,()'&-]+/gu, "").replace(/\s+/g, " ").trim() || "Candidate");
export const pdfFileName = (name, ms) => `EFAW Quiz - ${safeName(name)} - ${isoDate(ms)}.pdf`;

// A4 completion record (needs jsPDF loaded as window.jspdf)
export function buildRecordPdf({ name, sessionTitle, completedAt, answers }){
  const r = scoreAnswers(answers);
  const { jsPDF } = window.jspdf;
  const doc = new jsPDF({ unit:"mm", format:"a4" });
  const W = 210, M = 18, CW = W - M * 2;
  const green = [11,122,75], ink = [27,36,48], mut = [93,107,122], red = [198,40,40];
  let y = 0;
  const need = h => { if (y + h > 280){ doc.addPage(); y = 20; } };
  const text = (t, size, color, style) => {
    doc.setFont("helvetica", style || "normal"); doc.setFontSize(size); doc.setTextColor(...color);
    const lines = doc.splitTextToSize(String(t), CW);
    const h = lines.length * size * 0.3528 * 1.35;
    need(h); doc.text(lines, M, y + size * 0.3528); y += h;
  };
  doc.setFillColor(...green); doc.rect(0, 0, W, 30, "F");
  doc.setTextColor(255,255,255); doc.setFont("helvetica","bold"); doc.setFontSize(18);
  doc.text("EFAW Quiz - Completion record", M, 14);
  doc.setFont("helvetica","normal"); doc.setFontSize(11);
  doc.text(`${ORG_NAME}  |  Emergency First Aid at Work`, M, 22);
  y = 42;
  const rows = [
    ["Candidate", name],
    ["Session", sessionTitle || "-"],
    ["Completed", fmtDate(completedAt)],
    ["Status", "Completed"],
    ["Score", `${r.c} of ${r.n} correct (${r.pct}%)`],
    ["Main questions", `${r.main.c} of ${r.main.n} correct`],
    ["Catch-up questions", r.catchup.n ? `${r.catchup.c} of ${r.catchup.n} correct` : "None"]
  ];
  rows.forEach(([k, v]) => {
    doc.setDrawColor(223,229,234); doc.line(M, y + 7.5, W - M, y + 7.5);
    doc.setFont("helvetica","bold"); doc.setFontSize(11); doc.setTextColor(...mut); doc.text(k, M, y + 5);
    doc.setFont("helvetica", k === "Candidate" ? "bold" : "normal"); doc.setTextColor(...ink);
    doc.text(doc.splitTextToSize(String(v), CW - 52)[0], M + 50, y + 5);
    y += 9;
  });
  y += 6;
  text("Score by topic", 13, ink, "bold"); y += 2;
  Object.keys(TOPICS).filter(t => r.byT[t]).forEach(t => {
    need(8);
    const p = Math.round(r.byT[t].c / r.byT[t].n * 100);
    doc.setFont("helvetica","normal"); doc.setFontSize(10.5); doc.setTextColor(...ink);
    doc.text(TOPICS[t], M, y + 4);
    doc.text(`${r.byT[t].c}/${r.byT[t].n}`, M + 118, y + 4, { align:"right" });
    doc.setFillColor(230,235,239); doc.rect(M + 124, y + 1.2, 50, 3.4, "F");
    doc.setFillColor(...(p >= 80 ? green : p >= 60 ? [208,138,0] : red)); doc.rect(M + 124, y + 1.2, 50 * p / 100, 3.4, "F");
    y += 7;
  });
  if (!r.n){ text("No questions were answered.", 11, mut); }
  y += 6;
  if (r.missed.length){
    text(`Questions to review (${r.missed.length})`, 13, ink, "bold"); y += 2;
    r.missed.forEach((a, i) => {
      const q = byId[a.qid];
      need(24);
      text(`${i + 1}. ${q[2]}${a.retest ? " (catch-up)" : ""}`, 10.5, ink, "bold");
      text(`Answer given: ${q[3][a.choice] ?? "-"}`, 10, red);
      text(`Correct answer: ${q[3][0]}`, 10, green, "bold");
      y += 3;
    });
  } else if (r.n){
    text("All questions answered correctly.", 11, green, "bold");
  }
  const pages = doc.getNumberOfPages();
  for (let p = 1; p <= pages; p++){
    doc.setPage(p); doc.setFont("helvetica","normal"); doc.setFontSize(8.5); doc.setTextColor(...mut);
    doc.text("Practice quiz only. Not a qualification or assessment result.", M, 290);
    doc.text(`Page ${p} of ${pages}`, W - M, 290, { align:"right" });
  }
  return doc.output("blob");
}

export function downloadBlob(blob, filename){
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url; a.download = filename; document.body.appendChild(a); a.click(); a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 4000);
}

export function qrSvg(text, cell = 6){
  if (!window.qrcode) return "";
  const qr = window.qrcode(0, "M"); qr.addData(text); qr.make();
  return qr.createSvgTag({ cellSize: cell, margin: 2, scalable: true });
}

export function joinUrl(code){
  return new URL("index.html?s=" + encodeURIComponent(code), location.href).href;
}

export function setupNotice(){
  return `<div class="card"><h2>Setup needed</h2><p class="lead">This app isn't connected to its database yet. Paste your Firebase settings into <b>js/config.js</b> (see the setup guide in README.md).</p></div>`;
}

export { TOPICS, BANK, byId };
