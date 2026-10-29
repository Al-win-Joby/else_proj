# Classroom Voting App: Plan

## Goal
A teacher teaches students how voting works in a democracy. The teacher picks two students as candidates and gives each a name and a symbol. The other students vote one at a time, and each vote plays a beep. When the teacher ends the voting, the app shows the winner.

## Recommended tech: plain HTML + CSS + JavaScript (no framework, no backend)

| Need | Why this fits |
|---|---|
| Runs on Windows (and Mac/Linux) | It runs in any browser (Edge/Chrome come with Windows). Double-click `index.html`. No install. |
| Simple for a classroom | One shared screen (teacher laptop or projector). Students come up and click, or the teacher passes the device. No accounts, no internet, no server. |
| Beep on vote | The browser's built-in Web Audio API makes a beep with no audio file. |
| Easy to maintain | About 3 small files. Nothing to build or update. |
| Future-proof | If a real installer is wanted later, wrap the same files with Electron or Tauri to get a Windows `.exe`. No rewrite needed. |

**Not chosen:** React/Vue need Node and a build step, which is overkill for 3 screens. Python (Tkinter/PyQt) gives a weaker UI and is harder to package on Windows. A client-server app is unnecessary, since voting happens on one device.

## Screens

1. **Setup (teacher)**
   - Inputs for Candidate 1 and Candidate 2 names.
   - Symbol picker for each, with big emoji/icons (🌟 🍎 🚀 🐯 🌳 ⚽ and so on). The two symbols must differ.
   - "Start Voting" button.
2. **Voting (students)**
   - Two large, colourful candidate cards. Each shows the symbol, the name, and a big "VOTE" button.
   - Click, then a short beep, a "✔ Your vote is recorded!" message and a brief animation. Then the screen resets for the next student.
   - A live "Votes cast: N" counter. It shows only the total, not each candidate's count, so the vote stays secret.
   - A small, discreet "End Voting" button for the teacher, with a confirm dialog ("Are you sure? Everyone has voted?").
3. **Result**
   - Winner announcement with big symbol, name, confetti and a fanfare sound.
   - Vote counts and a simple bar chart for both candidates.
   - **Tie handling:** show "It's a tie!" and offer a re-vote.
   - "New Election" button that resets everything.

## UI/UX principles (for students)
- Large fonts, bright high-contrast colours, one clear action per screen.
- Symbols alongside names, as on real ballots. Students learn ballots use symbols.
- Friendly short text, with teachable captions such as "Every vote counts" and "The candidate with the most votes wins."
- Responsive layout, so it works on a projector, laptop or tablet.
- Secret ballot: results stay hidden until the teacher ends the vote.

## Protecting vote integrity
- Votes are kept in memory, with a `localStorage` backup so an accidental refresh does not lose them.
- The End Voting button needs confirmation.
- Optional: a short lock (about 1.5 seconds) after each vote to prevent double-clicks.

## File structure
```
elsa/
├── PLAN.md
├── index.html   # the 3 screens
├── style.css    # theme, cards, animations
└── app.js       # state, voting logic, beep, winner calc, confetti
```

## Build steps
1. Create the HTML skeleton with the 3 screens, showing and hiding them via JS state.
2. Build the setup screen: names, symbol picker, validation (both names filled, symbols different).
3. Build the voting screen: candidate cards, vote handler, counter, confirmation feedback.
4. Add the beep with Web Audio (a short ~880 Hz sine tone, about 0.2 s). Audio only starts after a user click, so the first Start/Vote click unlocks it.
5. Build the result screen: tally, winner or tie, bar chart, confetti, fanfare.
6. Polish the styling, animations and responsive layout.
7. Test on Chrome and Edge, then on a Windows machine, checking sound, full-screen (F11) and the projector.

## Future options
- A Windows installer or `.exe`, via Electron or Tauri.
- More than 2 candidates.
- Multi-device voting (each student on their own phone). This would need a small server, such as Node and WebSockets.
- Teacher-set vote time limit, multiple rounds, and a printable results sheet.

## Open questions
- Does one shared device work (students come up one by one)? The plan assumes yes.
- Is the language English only?
