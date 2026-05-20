# Recording a demo GIF for the README

The README uses [`demo-flow.svg`](demo-flow.svg) as a static preview. For promotion, replace it with a short GIF (15–30 seconds).

## Suggested flow to record

```bash
npm install -g @repographprotocol/cli@0.2.1
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
2. Update root `README.md` demo section to reference the GIF instead of (or in addition to) the SVG.
