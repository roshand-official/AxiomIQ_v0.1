# Contributing to AxiomIQ

Thank you for your interest in contributing to **AxiomIQ**! As an enterprise-grade subscription and recurring billing operations platform, we hold our codebase, architecture, and developer workflows to high standards of excellence.

Please take a few moments to review these guidelines before submitting code.

---

## Table of Contents
- [Code of Conduct](#code-of-conduct)
- [Getting Started & Local Setup](#getting-started--local-setup)
- [Git Workflow & Branching Strategy](#git-workflow--branching-strategy)
- [Conventional Commits Specification](#conventional-commits-specification)
- [Advanced Git Workflows for Contributors](#advanced-git-workflows-for-contributors)
  - [Interactive Rebasing](#1-interactive-rebasing)
  - [Git Worktrees for Multi-Tasking](#2-git-worktrees-for-multi-tasking)
  - [Git Bisect for Bug Hunting](#3-git-bisect-for-bug-hunting)
- [Code Style & Verification Standards](#code-style--verification-standards)
- [Submitting a Pull Request](#submitting-a-pull-request)

---

## Code of Conduct

All contributors and maintainers are expected to adhere to our [Code of Conduct](./CODE_OF_CONDUCT.md). Please report unacceptable behavior to `community@axiomiq.io`.

---

## Getting Started & Local Setup

### Prerequisites
- **Node.js**: `v18.x` or `v20.x` LTS
- **PostgreSQL**: `v15+` or `v16+` running on `localhost:5432`
- **Git**: `v2.30+`

### 1. Clone the Repository
```bash
git clone https://github.com/roshand-official/AxiomIQ_v0.1.git
cd AxiomIQ_v0.1
```

### 2. Configure Backend & Database
```bash
cd backend
npm install

# Copy environment variables
cp .env.example .env

# Push schema to PostgreSQL and seed initial demo entities
npm run prisma:push
npm run prisma:seed

# Start backend dev server (Port 5000)
npm run dev
```

### 3. Configure Frontend
```bash
cd ../frontend
npm install

# Start Vite dev server (Port 5173)
npm run dev
```

---

## Git Workflow & Branching Strategy

We follow a structured Git feature branch model. All feature development begins from `main`.

### Branch Naming Conventions
- `feat/<short-description>`: New features or UI components (e.g., `feat/razorpay-webhook-integration`)
- `fix/<short-description>`: Bug fixes and patches (e.g., `fix/pagination-nan-bounds`)
- `refactor/<short-description>`: Code restructuring without functional change
- `perf/<short-description>`: Performance optimization
- `docs/<short-description>`: Documentation changes or updates
- `ci/<short-description>`: CI/CD workflow updates

```bash
# Create and switch to your feature branch
git checkout -b feat/dynamic-tax-rule-engine
```

---

## Conventional Commits Specification

AxiomIQ strictly enforces [Conventional Commits](https://www.conventionalcommits.org/en/v1.0.0/). Our CI validates commit messages and PR titles automatically.

### Format
```text
<type>(<optional scope>): <description>

[optional body]

[optional footer(s)]
```

### Types
| Type | Purpose | Example |
|---|---|---|
| `feat` | New feature or capability | `feat(billing): support quarterly recurring cycles` |
| `fix` | Bug fix or patch | `fix(frontend): guard totalCount against NaN in Pagination` |
| `docs` | Documentation only | `docs(readme): add PostgreSQL schema architecture diagram` |
| `style` | Formatting, missing semi-colons, whitespace | `style(ui): align table padding with design tokens` |
| `refactor` | Code restructuring without feature or bug fix | `refactor(backend): decouple invoice repository methods` |
| `perf` | Code change that improves performance | `perf(database): add composite index to subscriptionId` |
| `test` | Adding missing tests or correcting existing tests | `test(api): add auth token header integration test` |
| `chore` | Build process, dependency updates, tooling | `chore(deps): update @prisma/client to 5.22.0` |

---

## Advanced Git Workflows for Contributors

### 1. Interactive Rebasing
Before opening a PR, clean up your branch history by squashing exploratory commits and polishing messages:

```bash
# Fetch latest main
git fetch origin main

# Rebase feature branch on top of main
git rebase -i origin/main
```

In the interactive editor:
- Use `pick` for your primary milestone commits.
- Use `squash` or `fixup` for "wip" or "fix typo" commits.
- Use `reword` to refine commit messages to follow Conventional Commits.

If you have already pushed to your remote fork:
```bash
git push --force-with-lease origin feat/your-branch
```

### 2. Git Worktrees for Multi-Tasking
Work on hotfixes or review PRs without interrupting your uncommitted local changes:

```bash
# Add a new worktree for an urgent hotfix
git worktree add -b fix/urgent-tax-calc ../axiomiq-hotfix origin/main

# When finished and merged:
git worktree remove ../axiomiq-hotfix
git worktree prune
```

### 3. Git Bisect for Bug Hunting
If a regression appears, use binary search to locate the exact introducing commit:

```bash
git bisect start
git bisect bad HEAD
git bisect good v0.1.0

# Mark tested commits until Git reports the culprit:
git bisect run npm run test
git bisect reset
```

---

## Code Style & Verification Standards

Before pushing your changes, ensure all quality gates pass locally:

### 1. Frontend Verification
```bash
cd frontend
# Check linting
npm run lint

# Build production bundle
npm run build
```

### 2. Backend Verification
```bash
cd backend
# Validate Prisma schema
npx prisma validate

# Syntax check
node -c src/server.js
```

---

## Submitting a Pull Request

1. **Push your feature branch** to your fork or origin.
2. **Open a PR** against `main`.
3. **Fill out the PR Template**: Ensure the type of change, description, and test evidence are provided.
4. **CI Checks**: Ensure all GitHub Actions checks (CI/CD, CodeQL, PR Hygiene) pass.
5. **Code Review**: Address feedback constructively using GitHub review threads. Once approved, maintainers will squash and merge.
