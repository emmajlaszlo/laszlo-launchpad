# Weekly Laszlo Launchpad scan (Saturday Cursor Automation)

## Candidate profile
- Laszlo Launchpad owner
- UMSI MSI — UX Research & Design
- Target start: summer / fall 2027 (graduating ~May 2027)
- Target locations: SF Bay, San Diego, Los Angeles, Remote CA
- Target roles: UX research, human factors, usability, associate/product management, closely related design research

## Part A — Refresh the Company Atlas (every Saturday)

Keep `src/data/companies.ts` current — not just job posts.

1. Read the existing company list (ids, names, careersUrl, locations, focus, priority).
2. **Fix broken links:** If a `careersUrl` or `website` 404s or redirects to a dead page, update it to the working careers board.
3. **Enrich notes:** Add short notes when you learn something useful (hiring freeze, new CA office, strong HF team, new-grad programs, etc.).
4. **Add new companies** (aim for 3–10 net-new when you find strong fits):
   - Medtech / healthtech / digital health orgs hiring (or likely to hire) UXR, HF, usability, or early PM in CA or remote-CA
   - Startups from accelerators, funding news, or LinkedIn that fit the profile
   - Do **not** duplicate existing names; reuse the same `id` prefix style (`c-shortname`)
   - For each new company set: id, name, website, careersUrl, locations, size (`startup` | `growth` | `enterprise`), focus, priority (`1` | `2` | `3`), notes, contacts `''`, stage `watching`, lastChecked null — following the `company({...})` helper pattern in the file
5. Update `src/data/atlas-meta.json`:
   - `lastAtlasUpdateAt`: ISO timestamp now
   - `updateNotes`: short summary (N added, N careers URLs fixed, notable finds)
   - `companiesChecked`: approximate count you successfully opened
6. When you successfully open a company's careers page, you may also set that company's `lastChecked` conceptually via atlas notes; prefer recording checks in `atlas-meta.json` and job scan notes.

## Part B — Scan for job openings (every Saturday)

1. For each company in `src/data/companies.ts`, open/fetch the careers page (and linked job board search if needed).
2. Find openings that match the profile — prefer entry-level / associate / junior / new grad; still include mid-level UXR/HF if clearly relevant for networking toward 2027.
3. Skip pure software engineering, sales, nursing clinical, and unrelated ops roles.
4. Update `src/data/discovered-jobs.json`:
   - Set `lastScanAt` to ISO timestamp now
   - Set `scanNotes` to a short summary (N new roles, broken careers pages, blockers)
   - Merge into `jobs` (do not wipe history). Stable ids: `scan-YYYYMMDD-<companyId>-<short-slug>`
   - Each job: id, companyId, companyName, title, roleFocus (`ux-research` | `human-factors` | `product` | `design` | `other`), location (`SF Bay` | `San Diego` | `Los Angeles` | `Remote CA` | `Other CA`), url, status (`new`), postedAt (ISO or null), foundAt (ISO), notes, salaryRange, whyFit (1 sentence)
5. If a matching opening is at a company **not** yet in the atlas, **add the company first** (Part A), then log the job.

## Part C — Ship it

Commit on branch `weekly-scan-YYYY-MM-DD` and open a PR titled `Weekly job scan — YYYY-MM-DD` with bullets covering:
- Company atlas: added / updated / fixed URLs
- Openings: new matches with links

## Role keyword hints
UX research, user researcher, design research, human factors, HFE, usability, product manager, associate product manager, APM, product designer (research-leaning), patient experience research, clinical UX.
