# 4 Step Learning (English)

Interactive web app that turns historical text into a 4-step learning flow: flashcards, quiz, matching, and letter-based fill. Runs fully in the browser—no backend or build step needed.

## Features
- **Simple input:** each line `Question: Answer` (numbering optional).
- **Module picker:** choose which steps to include (all enabled by default).
- **Flashcards:** flippable card, knew/didn’t-know scoring, adaptive size.
- **Quiz:** 4-option MCQ with correct/incorrect states.
- **Matching:** uses all facts; correct pairs move to the top with green block.
- **Letter build:** assemble the answer from shuffled characters, check, and auto-advance.
- **Results:** total score, accuracy, per-section breakdown.
- **Localization:** UI in Kazakh.
- **Mobile-friendly:** responsive layout for phones/tablets.

## How to Run
1. Open `index.html` directly in your browser (no server needed).
2. Paste material in the format:
   ```
   1. Event question: Event answer
   2. Territory question: Territory answer
   ```
3. Click “Оқытуды бастау” (Start), select modules.
4. Complete modules and view the results screen.
or
use the tool with link: (link)

## Files
- `index.html` — page structure + module selection modal.
- `styles.css` — styling, responsiveness, button states.
- `script.js` — logic, module init, scoring, results.

## Configuration
- Default modules: edit `enabledModules` in `script.js`.
- Colors/sizing: adjust gradients and sizes in `styles.css`.
- Example data: update `exampleText` in `script.js`.

## Known Notes
- Matching and letter-build are labeled “in progress” in UI, but logic is active.
- “Нәтиже” button jumps to results anytime; unanswered items are counted as wrong.

## Future Ideas
- Add Google Analytics or Plausible in `<head>`.
- Persist/save state via `localStorage`.
- Add full multilingual UI.

## License
No license specified.
