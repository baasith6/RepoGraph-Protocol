# Recording a demo GIF for the README

The README uses [`demo.gif`](demo.gif) (generated from [`demo-flow.svg`](demo-flow.svg)). Replace it with a short terminal recording (15–30 seconds) for a stronger landing page.

## Suggested flow to record

```bash
npm install -g @repographprotocol/cli@0.3.0
cd examples/clean-architecture-csharp-angular
repograph scan
repograph check
repograph list violations
repograph export --format cursor
```

## Tools (Windows)

- [ScreenToGif](https://www.screentogif.com/) — export as `docs/assets/demo.gif`
- Or terminal: [asciinema](https://asciinema.org/) + [agg](https://github.com/asciinema/agg) for terminal-only demos

## After recording

1. Save as `docs/assets/demo.gif` (keep under ~5 MB if possible).
2. Replace `docs/assets/demo.gif` and commit (README already points at the GIF).
