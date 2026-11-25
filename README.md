# EFAW Live Quiz – DM Learning

A trainer-led live quiz for Emergency First Aid at Work courses.

- **Candidates** join on their phones by scanning a QR code or typing a short code, plus their name. No account or app needed.
- **The trainer** pushes a question to everyone at once, watches answers arrive, reveals the answer with a chart of how the room answered, and sends **catch-up questions** to anyone who got one wrong. Each catch-up is a different question on the same topic.
- **Results** are saved automatically. The **Results** tab is the admin panel: every session, every candidate, per-candidate PDF records, "Download all PDFs" (zip) and a CSV export.
- 113 questions across the 10 EFAW topics. A question is never asked twice in the same session.

## What's in the folder

| File | What it is |
|---|---|
| `index.html` | Candidate page (phones) |
| `trainer.html` | Trainer page: live session + Results admin panel |
| `config.js` | **You paste your Firebase settings here** |
| `questions.js` | The question bank (edit here to change questions) |
| `slides.js`, `slides.css` | The training presentation slides |
| `firestore.rules` | Database security rules (pasted into Firebase) |
| `highfield.js` | Fills in the Highfield Learner Answer Sheet (the papers themselves are NOT in this repository) |

---

## One-off setup (about 15–20 minutes)

You need a free **Firebase** project (Google) to store results, and somewhere to host the pages (GitHub Pages is free).

### 1. Create the Firebase project
1. Go to **console.firebase.google.com** and sign in with a Google account (ideally a DM Learning one).
2. **Create a project**, e.g. `dm-learning-efaw`. Google Analytics isn't needed.
3. The free **Spark** plan is plenty for this.

### 2. Turn on the database
1. Left menu: **Build › Firestore Database › Create database**.
2. Choose location **europe-west2 (London)**. This keeps candidate data in the UK.
3. Start in **production mode**.
4. Open the **Rules** tab. Delete what's there, paste in everything from `firestore.rules`, and click **Publish**.

### 3. Turn on sign-in
1. **Build › Authentication › Get started**.
2. **Sign-in method** tab:
   - Enable **Anonymous** (this is how candidates join with no account).
   - Enable **Email/Password**.
3. **Users** tab › **Add user**: enter the trainer's email and a strong password. Repeat for each trainer.
4. Copy each trainer's **User UID** from the Users list.

### 4. Mark the trainer accounts as trainers
1. Go to **Firestore Database › Data › Start collection**.
2. Collection ID: `trainers`.
3. Document ID: paste the trainer's **User UID**. Add one field, for example `name` (string) = `Rick`, then **Save**.
4. Repeat for each trainer: one document per UID.

(If a trainer signs in before this is done, the trainer page shows their UID to copy.)

### 5. Connect the app to Firebase
1. In Firebase: ⚙️ **Project settings › General › Your apps › Web (</>)**. Register an app called `EFAW Live Quiz`. You don't need Firebase Hosting.
2. Copy the `firebaseConfig` values into `config.js`, replacing the `PASTE_…` placeholders.

### 6. Put it online with GitHub Pages
1. In GitHub, create a new repository, e.g. `efaw-live-quiz`. It can be public: the security rules protect the data, not the code.
2. Upload all the files from this package (they all sit together in one folder).
3. Go to **Settings › Pages**, set Source to **Deploy from a branch**, choose branch `main` and folder `/ (root)`, then **Save**.
4. After a minute your app is at:
   - Trainer: `https://<your-github-name>.github.io/efaw-live-quiz/trainer.html`
   - Candidates: `https://<your-github-name>.github.io/efaw-live-quiz/` (the trainer screen shows this link and a QR code)
5. In Firebase, go to **Authentication › Settings › Authorized domains**, click **Add domain** and add `<your-github-name>.github.io`.

---

## Running a session

1. Open `trainer.html` on the laptop connected to the projector and sign in.
2. Choose **15, 30 or 45 questions** and click **Create session**. The join screen shows a QR code and a 5-character code. Candidates scan it and type their name. You'll see names appear (12 is no problem).
3. Teach a section from the presentation. At its "Quick questions" slide, switch to the quiz tab:
   - Leave the topic on **Balanced mix** to spread questions evenly across all 10 topics, or pick the section you've just taught (e.g. *CPR & AED*). Then click **Ask first question / Next question**. The screen shows *Question 7 of 30*.
   - Watch answers arrive. Names turn green as people answer.
   - Click **Reveal answer**. The projector shows the correct answer, the explanation and how many chose each option. Phones show each candidate whether they were right.
   - Click **Send catch-up questions** to send everyone who got a question wrong a *different* question on the same topic, on their own phone. Click **Finish catch-up** when they're done.
4. After the last question, a **Finish quiz** button appears (you can still send catch-ups first). Or click **End session** at any time. Each candidate sees a **Quiz completed** page and can download their own PDF.
5. Go to **Results**, open the session and click **Download all PDFs**. Save the zip into the **DM Learning OneDrive** folder. **Export CSV** gives a spreadsheet of everyone's scores by topic.

**Tips**
- If a candidate's phone locks or they close the page, they reopen the same link and are put straight back in.
- **Show join code** brings the QR code back full screen for latecomers.
- If you reload the trainer page mid-session, it returns to the live session.

## Presenting the training slides
The EFAW training presentation (62 slides, or 70 with the 3-day FAW slides) is built into the trainer page. It follows Highfield's Unit 1 example session plan, modules 1–8.
- **During a live session:** use the **Slides / Quiz** switch at the top. In the lobby, click **Start presentation**.
- **Moving through slides:** use **Next / Prev**, the arrow keys, Page Up/Down (most presentation clickers), or click the slide. Press **F** or click **Full screen** for the projector, and **Esc** to exit. The section menu jumps straight to any section. **Speaker notes** shows the notes under the slide (keep it off while projecting, or use a second screen).
- **Quick questions slides:** each press reveals the next answer. The **▶ Ask live question: <topic>** button (shortcut **Q**) switches to the quiz and sends a question on that section to every phone. After **Reveal answer**, click **Next question** for another on the same topic, or **Back to slides** to carry on where you left off.
- **3-day FAW slides:** 8 optional slides cover Unit 2 content from Highfield's plan (head-to-toe survey, SAMPLE history, anaphylaxis and auto-injectors, eye injuries, burn severity and types). They're marked "3-day FAW" and hidden by default. Use the **3-day FAW slides: Hidden / Shown** button under the slides to switch. The setting is remembered on that computer.
- **Highfield paper at the end:** in a live session that includes the Highfield paper, the presentation ends with a **Theory paper** slide. Press **Start Highfield paper** under it when everyone's ready. The 25-minute clock starts then, and the screen switches to the paper monitor. (You can still start it from the Quiz view too.)
- **Without a session:** the **Presentation** tab shows the same slides on their own.
- **Demonstration video slides:** the link opens the video in a new tab. Close it to return to the slides.

## Highfield qualification and theory paper
For candidates taking the **Highfield Level 3 Award in Emergency First Aid at Work (RQF)**, the app can deliver a Highfield theory paper at the end of the course and produce a completed **Learner Answer Sheet (LAS)** for each of them.

**Where the papers live.** The questions for papers EFAW22309 and EFAW22310 are stored in your Firebase database, readable only by trainer accounts. They are **not** in this public repository. Candidates only receive a paper's questions while it's running, and never the answers.

**One-off set-up**
1. Make sure the updated `firestore.rules` is published in Firebase (Firestore Database › Rules).
2. In the trainer page, open the **Highfield** tab. For each paper:
   - Click **Check answer key**, compare every answer with **Highfield's official marking key**, correct any that differ, and click **Confirm answer key**. Answer sheets can't be produced until a paper's key is confirmed.
   - Click **Upload answer sheet PDF** and choose the blank Highfield Learner Answer Sheet for that paper. If a paper has no sheet of its own, the other paper's sheet is used with the paper code changed.
   - Under **Your tutor signature**, click **Upload signature** (PNG or JPG). It's added as a *Tutor signature* in the Tutor Comments area of page 2 on the answer sheets you download. Each trainer account has its own.
3. Use **Test answer sheet** to check the output prints correctly.

**Running it**
- A course is either a **DM Learning course** or a **Highfield course**, never mixed. When creating a session, choose **Course type: Highfield course**, choose the paper, and fill in Course ID, Centre name and number, and Tutor name and number. Centre and tutor details are remembered.
- On a Highfield course every candidate is a Highfield candidate. When they join they enter their date of birth (for the LAS) and their filming consent. They show with an **H** on your screen. On a DM Learning course, candidates just give filming consent.
- At the end of the presentation, the **Theory paper** slide has a **Start Highfield paper** button (it's also in the Quiz view). Every candidate gets the 15-question paper on their phone. They can change answers until they submit, and they never see the answers or their mark. Your screen shows a timer (minimum 25 minutes) and who has submitted.
- Click **End paper** to close it. Saved answers from anyone who hasn't submitted are kept as they are. Then carry on or **End session**.
- In **Results**, Highfield candidates show their MCQ mark and PASS/REFER (11/15 to pass). **Answer sheet** downloads the completed LAS: header details in capitals, the chosen answer shaded for each question, Pass or Refer ticked per question, MCQ mark, total and PASS/REFER on page 2. **Download all PDFs** includes a *Highfield answer sheets* folder, and the CSV includes each candidate's answers and mark.
- **Filming consent (GDPR):** every candidate, DM Learning and Highfield, reads a short privacy notice when they join and choose whether they agree to their practical assessment being filmed. Anyone who declines shows a red **No filming** tag in the lobby, so assess them in person. Results and the CSV show each candidate's choice and when they made it. Requests to withdraw consent go to Danny@DMLearning.co.uk: delete that candidate's recordings when one comes in.
- Learners sign on their phone before they submit the paper (they can't submit without signing). Their signature goes in the Learner Signature box on page 2. Tutor comments are left for you to complete, including any further questioning for referred learners.
- Highfield candidates also take the course quiz. If they pass it (80%), they get the DM Learning certificate as well, alongside their Highfield paper.

## Certificates (80% pass mark)
- A candidate **passes** with 80% or more on the main questions (the 15, 30 or 45). Catch-up questions aren't counted.
- When the trainer ends the session, each candidate sees **Quiz completed**, then taps **Finish and see my results**. This opens their results page: score, pass or not, score by topic, and every question with their answer, the correct answer and the explanation (filter by All / Incorrect / Correct). Passers can download a **Certificate of Achievement** (A4 landscape PDF) with their name, score, date, session and a certificate number.
- In **Results**, each candidate shows Pass / Not passed. Passers have a **Certificate** link. **Download all PDFs** gives a zip with a *Results* folder and a *Certificates* folder. The CSV includes the result and certificate number.
- The certificate says it records a practice knowledge quiz and is **not** a regulated qualification or first aid certificate.
- To change the pass mark, edit `PASS_MARK` near the top of `common.js`.

## Good to know
- **Data held:** candidate names, their answers and timestamps, in your Firebase project in London. Delete old sessions from the Results tab (this is permanent, so export first). Add the quiz to your privacy notice for learners.
- **Not an assessment:** this is a practice and knowledge-check tool. The PDFs say so.
- **Answers are visible in the page code.** A determined person could find them in the page source. That's fine for a practice quiz, but don't use it as a formal assessment.
- **Changing questions:** edit `questions.js`. Each entry is `[id, topic, question, [correct, wrong, wrong, wrong], explanation]`, with the correct answer always first. The app shuffles the order. Keep ids unique.

### Editing an answer sheet after download
Downloaded answer sheets are fillable PDFs. The header details, Tutor Comments, Learner Signature, MCQ mark, further questioning marks, PASS/REFER and total marks can all be changed in any PDF reader (Adobe Reader, Edge, Chrome, Preview). The learner's shaded answers and the per-question Pass/Refer ticks are fixed, because they're the record of what the learner submitted.
