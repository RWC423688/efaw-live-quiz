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
| `firestore.rules` | Database security rules (pasted into Firebase) |

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
2. **Create session**. The join screen shows a QR code and a 5-character code. Candidates scan it and type their name. You'll see names appear (12 is no problem).
3. Teach a section from the presentation. At its "Quick questions" slide, switch to the quiz tab:
   - Choose the section's topic (e.g. *CPR & AED*) and click **Ask first question / Next question**.
   - Watch answers arrive. Names turn green as people answer.
   - Click **Reveal answer**. The projector shows the correct answer, the explanation and how many chose each option. Phones show each candidate whether they were right.
   - Click **Send catch-up questions** to send everyone who got a question wrong a *different* question on the same topic, on their own phone. Click **Finish catch-up** when they're done.
4. At the end, click **End session**. Each candidate sees a **Quiz completed** page and can download their own PDF.
5. Go to **Results**, open the session and click **Download all PDFs**. Save the zip into the **DM Learning OneDrive** folder. **Export CSV** gives a spreadsheet of everyone's scores by topic.

**Tips**
- If a candidate's phone locks or they close the page, they reopen the same link and are put straight back in.
- **Show join code** brings the QR code back full screen for latecomers.
- If you reload the trainer page mid-session, it returns to the live session.

## Good to know
- **Data held:** candidate names, their answers and timestamps, in your Firebase project in London. Delete old sessions from the Results tab (this is permanent, so export first). Add the quiz to your privacy notice for learners.
- **Not an assessment:** this is a practice and knowledge-check tool. The PDFs say so.
- **Answers are visible in the page code.** A determined person could find them in the page source. That's fine for a practice quiz, but don't use it as a formal assessment.
- **Changing questions:** edit `questions.js`. Each entry is `[id, topic, question, [correct, wrong, wrong, wrong], explanation]`, with the correct answer always first. The app shuffles the order. Keep ids unique.
