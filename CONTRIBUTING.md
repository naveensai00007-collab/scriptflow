# Contributing to ScriptFlow

Thank you for your interest in contributing to **ScriptFlow**, created by **Naveen Sai**! We welcome bug fixes, performance improvements, and screenwriting workflow enhancements from writers and engineers worldwide.

## Code of Conduct

All contributors are expected to uphold our [Code of Conduct](CODE_OF_CONDUCT.md) to ensure an inclusive, respectful environment.

## Design Philosophy

Before submitting a feature or UI PR, ensure your contribution respects our **Anti-AI-Slop** design principles:
1. **No generic fonts**: Space Grotesk (headings), Fraunces (serif), and Courier Prime (screenplay) are our active typefaces. Never introduce Inter, Roboto, or Arial.
2. **Local-first guarantee**: Writers must never lose words due to offline states or server disconnects. All features must work completely offline with Dexie.js / IndexedDB.
3. **No formulaic narrative tools**: AI features must serve craft and subtext, not churn out repetitive clichés.

## Development Setup

1. Fork and clone the repository.
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the Vite dev server:
   ```bash
   npm run dev
   ```
4. Run unit tests before submitting:
   ```bash
   npm test
   npx tsc --noEmit
   npm run build
   ```

## Pull Request Guidelines

1. Create a feature branch: `git checkout -b feature/your-feature-name`.
2. Commit your changes with clear, descriptive commit messages.
3. Verify that all 30+ tests in `npm test` pass.
4. Submit a Pull Request targeting the `main` branch.

