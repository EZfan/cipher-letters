# Contributing to The Cipher Letters

Thanks for your interest in the project. 🎉

There are many ways to contribute:

- **Authoring a case.** Every case lives as a TypeScript file under
  `packages/shared/src/cases/` plus a Markdown file with its surface
  text under `packages/shared/src/cases/text/`. See
  [docs/authoring-a-case.md](./docs/authoring-a-case.md) for the full
  template and the Fair Play contract.
- **Improving the UI.** The web app is plain React + Tailwind + Motion.
  See [docs/architecture.md](./docs/architecture.md).
- **Improving the orchestrator.** The prompt templates live in
  `packages/shared/src/prompts.ts`. They are deliberately short — feel
  free to extend them, but please read
  [docs/prompt-design.md](./docs/prompt-design.md) first.
- **Writing tests.** The validator utilities are tested in
  `packages/shared/src/clue-validator.test.ts`. Add cases there.
- **Triaging issues, reviewing PRs, writing docs.** All welcome.

## Code of Conduct

By participating, you agree to abide by our
[Code of Conduct](./CODE_OF_CONDUCT.md).

## Development setup

```bash
# 1. Fork and clone
git clone https://github.com/<your-username>/cipher-letters.git
cd cipher-letters

# 2. Install (requires Node 20+ and pnpm 10+)
pnpm install

# 3. Build everything once
pnpm build

# 4. In one terminal: start the server (will log to stdout)
pnpm --filter @cipher/server dev

# 5. In another terminal: start the web app
pnpm --filter @cipher/web dev
```

Open <http://localhost:5173>. The Vite dev server proxies `/api/*`
to the server on port 4317.

## Pull requests

1. Fork and create a branch named `feat/<thing>` or `fix/<thing>`.
2. Make your change. Keep commits small and focused; use
   [Conventional Commits](https://www.conventionalcommits.org/) for
   commit messages (`feat:`, `fix:`, `docs:`, `test:`, `refactor:`, …).
3. Before pushing, run:

   ```bash
   pnpm lint typecheck test
   ```

4. Open the PR. Use the [PR template](./.github/PULL_REQUEST_TEMPLATE.md).
   The CI will run lint, typecheck, and tests against Node 20 / 22 on
   Linux, macOS, and Windows.

## Reporting bugs

Please use the [bug report template](./.github/ISSUE_TEMPLATE/bug.yml).
A minimal reproduction is enormously helpful — even a curl script
that hits the server in a way that triggers the bug is enough.

## Security

If you have found a security vulnerability, please **do not** open a
public issue. See [SECURITY.md](./SECURITY.md) for the private
reporting channel.

## License

By contributing, you agree your contributions will be licensed under
the project's [MIT License](./LICENSE).
