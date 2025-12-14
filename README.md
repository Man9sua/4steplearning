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

## Supabase (optional)
- Set `SUPABASE_URL` and `SUPABASE_ANON_KEY` in `script.js` to enable login/signup, roles, and profiles.
- Security: the anon key is public by design—use Row Level Security and least-privilege policies. If you must hide keys, route calls through a backend/serverless proxy (GitHub Pages alone cannot hide secrets).
- Profiles: create `profiles(id uuid references auth.users, role text, email text, last_material text, created_at timestamptz)` and enable RLS with owner read/write.

## i18n
- Keys live in `i18n` inside `script.js`. Add/extend translations there; `applyTranslations()` updates all static UI.

## OCR / samples
- Scan/upload buttons are intentionally disabled until the flow is finalized. Samples modal lets you insert predefined materials with visible selection outline.

## Deployment
- Static hosting works (GitHub Pages, Netlify, Vercel static).  
- With Supabase: static hosting is fine, but secrets stay public. To truly hide keys, put Supabase calls behind a protected backend/proxy (e.g., Vercel serverless) and keep secrets there.

## Known notes
- Matching and letter-build are labeled “in progress” in UI, but logic runs.
- “Results” counts unanswered as wrong.

## License
No license specified. Add one if you plan to distribute/open-source.

## Name ideas (short & memorable)
- **StepWise**
- **QuadLearn**
- **StepFlow**
