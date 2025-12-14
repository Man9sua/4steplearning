# 4 Step Learning

Interactive, mobile-friendly web app that turns plain text into a four-step learning flow: flashcards → quiz (MCQ) → matching → letter-build. Runs fully in the browser; Supabase powers optional auth and profiles.

## What it does
- Paste material as `Question: Answer` (numbering optional) and start learning.
- Module picker (all on by default), always-available “Results” button in learning flow, hidden on results page.
- Flashcards with flip + knew/didn’t-know scoring.
- Quiz with context-aware distractors to make guessing harder.
- Matching uses all facts; correct pairs move up with green highlight.
- Letter-build: assemble answers from shuffled characters.
- Results: total score, accuracy, per-section breakdown.
- i18n: Kazakh, Russian, English for all static UI; choice persists.
- UI/UX: welcome modal (one-time), themed modals above header, custom checkboxes, toast notifications (replaces alerts), disabled WIP buttons (scan/upload).
- Responsive header/buttons for phones; redesigned back/home and finish button placement.

## Quick start
1) Open `index.html` in a modern browser (no build or server needed).  
2) Paste material, e.g.  
```
1. Event question: Event answer
2. Territory question: Territory answer
```
3) Click “Оқытуды бастау”, select modules, learn, and view results.

## File map
- `index.html` — layout, modals (auth, account, module picker, FAQ, samples, welcome), toast container.
- `styles.css` — theming, responsive header, modals, buttons, custom checkboxes/toasts.
- `script.js` — parsing, module flow, scoring, i18n, Supabase auth/profile glue, toasts, welcome-modal logic, smarter quiz distractors.
- `toimprove.rmd` — requirements/changelog source.
- `functions/` — serverless helpers (e.g., `check-email`).
- `db_setup.js` — sample Supabase table setup helper.

## Authentication Methods

### Option 1: Supabase (Recommended)
- Set `SUPABASE_URL` and `SUPABASE_ANON_KEY` in `script.js`
- Set `AUTH_METHOD = 'supabase'` in the code
- Secure: passwords are hashed, email verification required
- Profiles: create `profiles(id uuid references auth.users, role text, email text, last_material text, created_at timestamptz)` and enable RLS

### Option 2: Google Sheets (Simple but Insecure)
- Set `AUTH_METHOD = 'sheets'` in `script.js`
- ⚠️ **WARNING**: Passwords stored in plain text in Google Sheets!
- Only use for testing/demo purposes
- Create sheet with tabs: `Sheet1` (learning data), `users` (user database), `logs` (activity logs)
- Users sheet format: Column A = email, Column B = password, Column C = role

## i18n
- Keys live in `i18n` inside `script.js`. Add/extend translations there; `applyTranslations()` updates all static UI.

## OCR / samples
- Scan/upload buttons are intentionally disabled until the flow is finalized. Samples modal lets you insert predefined materials with visible selection outline.

## Deployment
- Static hosting works (GitHub Pages, Netlify, Vercel static).
- **GitHub Pages**: Works out of the box with fallback data. Upload all files to your repository and enable Pages in settings. The app will use local data if Google Sheets API is unavailable.
- With Supabase: static hosting is fine, but secrets stay public. To truly hide keys, put Supabase calls behind a protected backend/proxy (e.g., Vercel serverless) and keep secrets there.

## Google Sheets API Setup
To enable data loading from Google Sheets:
1. Create a new Google Sheet with tabs: "Sheet1" (learning data), "users" (user database), "logs" (activity logs)
2. In "Sheet1", add your Q&A data in columns A and B (question in A, answer in B)
3. In "users" tab, add user data: Column A = email, Column B = password, Column C = role
4. Go to Extensions → Apps Script
5. Replace the default code with the code from `google-apps-script.js`
6. Replace `'ТВОЙ_SHEET_ID'` with your actual Google Sheet ID (from the URL)
7. Deploy as web app: Publish → Deploy as web app
8. Set "Execute as: Me", "Who has access: Anyone"
9. Copy the deployment URL and update `SHEETS_API_URL` in `script.js`
10. Set `AUTH_METHOD = 'sheets'` in `script.js` for Google Sheets authentication

## Known notes
- Matching and letter-build are labeled “in progress” in UI, but logic runs.
- “Results” counts unanswered as wrong.

## License
No license specified. Add one if you plan to distribute/open-source.

## Name ideas (short & memorable)
- **StepWise**
- **QuadLearn**
- **StepFlow**
