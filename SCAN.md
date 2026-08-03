# Weekly job scan instructions (for the Saturday Cursor Automation)

## Candidate profile
- Name context: Laszlo Launchpad owner
- UMSI MSI — UX Research & Design
- Target start: summer / fall 2027
- Target locations: SF Bay, San Diego, Los Angeles, Remote CA
- Target roles: UX research, human factors, usability, associate/product management, closely related design research

## What to do each Saturday
1. Read the company list from `src/data/companies.ts` (ids, names, careersUrl, locations).
2. For each company, open/fetch the careers page (and linked job board search if needed).
3. Find openings that plausibly match the profile above — prefer entry-level / associate / junior / new grad when labeled; still include mid-level UXR/HF if clearly relevant for networking timing.
4. Skip pure software engineering, sales, nursing clinical, and unrelated ops roles.
5. Update `src/data/discovered-jobs.json`:
   - Set `lastScanAt` to ISO timestamp now
   - Set `scanNotes` to a short summary (N new roles, N companies with no careers page, blockers)
   - Merge into `jobs` array (do not wipe manually curated history). Use stable ids like `scan-YYYYMMDD-<companyId>-<short-slug>`.
   - Each job needs: id, companyId, companyName, title, roleFocus (`ux-research` | `human-factors` | `product` | `design` | `other`), location (`SF Bay` | `San Diego` | `Los Angeles` | `Remote CA` | `Other CA`), url, status (`new`), postedAt (ISO or null), foundAt (ISO), notes, salaryRange, whyFit (1 sentence)
6. Mark companies you successfully checked by leaving a note in scanNotes; if a careers URL is broken, note it.
7. Commit changes on a branch and open a PR titled `Weekly job scan — YYYY-MM-DD` with a short bullet summary of new matches.

## Role keyword hints
UX research, user researcher, design research, human factors, HFE, usability, product manager, associate product manager, APM, product designer (only if research-leaning), patient experience research, clinical UX.
