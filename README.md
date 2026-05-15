# CCAF Practice Mock Test

> Free, browser-based practice drill for the **Community College of the Air Force (CCAF)** exam — no login, no install, no cost.

**[Launch the app →](https://madathingalafsal.github.io/CCAFEXAMMOCK/)**

---

## What is this?

A lightweight study tool built for airmen preparing for the CCAF general education requirements. Pick an answer, get instant feedback, and keep practicing until you hit the 72% passing threshold — just like the real exam.

No ads. No account. No fluff.

---

## Features

- **Instant feedback** — wrong answers are marked immediately so you learn as you go
- **Retry until correct** — questions stay open until you find the right answer
- **Question palette** — jump to any question at a glance, see which ones you've answered
- **Live timer** — start, pause, and resume the clock; auto-starts when you interact
- **Score report** — finish and get a full breakdown: correct, wrong attempts, time elapsed, pass/fail at 72%
- **Works offline** — once loaded, no internet needed
- **Mobile friendly** — works on phone, tablet, and desktop

---

## Live Demo

[https://madathingalafsal.github.io/CCAFEXAMMOCK/](https://madathingalafsal.github.io/CCAFEXAMMOCK/)

---

## How to use

1. Open the link above in any browser
2. Hit **Start Test** or just click an answer to begin
3. Select the answer you think is correct — if wrong, it highlights and you try again
4. Use the **Question Palette** on the right to jump between questions
5. Click **Finish & score** when done to see your result

---

## Run locally

```bash
git clone https://github.com/madathingalafsal/CCAFEXAMMOCK.git
cd CCAFEXAMMOCK
npm install
npm run dev
```

Open [http://localhost:4173](http://localhost:4173)

---

## Tech stack

- [React 18](https://react.dev/)
- [Vite](https://vitejs.dev/)
- Deployed on [GitHub Pages](https://pages.github.com/) via GitHub Actions

---

## Contributing

Questions wrong or outdated? Want to add more? PRs are welcome.

1. Fork the repo
2. Edit `questions.json` — each question follows this shape:
```json
{
  "text": "Question text here?",
  "options": [
    { "letter": "A", "text": "Option A", "correct": false, "explain": "" },
    { "letter": "B", "text": "Option B", "correct": true, "explain": "Why B is correct." }
  ]
}
```
3. Open a pull request

---

## Keywords

`CCAF` `Community College of the Air Force` `CCAF exam prep` `CCAF practice test` `CCAF mock test` `Air Force education` `CCAF study guide` `military education exam` `CCAF general education` `free CCAF practice`

---

## License

MIT — free to use, share, and modify.

---

*Built for airmen, by someone who needed this to exist.*
