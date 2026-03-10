# Dependency Audit Plan

## Context

Branch: `dependency-audit`

Completed phases are documented in `progress.txt`.

## Completed Phases

- **Phase 0** ✅ Remove dead dependencies, move build tools to devDependencies
- **Phase 1** ✅ Safe minor/patch updates and @types bumps
- **Phase 2** ✅ TypeScript 4.9 → 5, tsconfig target → es2022

## Remaining Tasks (priority order)

### Phase 3a — Fix multer security vulnerability (HIGH) ✅
- Upgraded `multer` from `1.4.4-lts.1` to `^2.1.1`
- Upgraded `@types/multer` from `^1.4.11` to `^2.1.0`
- multer v2 fixes the high-severity `dicer` crash vulnerability (GHSA-wm7h-9275-46v2)
- API in `controllers.ts` is fully compatible; no code changes needed
- Type-check and all 12 tests pass

### Phase 3b — Fix mocha serialize-javascript vulnerability (HIGH) ✅
- Upgraded `mocha` from `^10.3.0` to `^11.7.5`
- Added npm `overrides` to force `serialize-javascript: ^7.0.3` and `diff: ^8.0.3`
- npm audit now reports 0 vulnerabilities
- All 12 tests pass

### Phase 4 — @types/express 4.x → 5.x (MEDIUM) ✅
- Upgraded `@types/express` from `^4.17.21` to `^5.0.6`
- TypeScript type-check: clean. All 12 tests pass.

### Phase 5 — Other major version upgrades (LOW)
- `uuid` 9 → 10 ✅ (v11+ is ESM-only, incompatible with module:commonjs)
- `dotenv` 16 → 17 ✅
- `mongoose` 8 → 9 ✅ (removed deprecated connection options)
- `tailwindcss` 3 → 4 ✅
- `express` 4 → 5 ✅
- Evaluate each separately
