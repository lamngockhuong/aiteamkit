# A verdict table after the second read

Text around the table is ignored.

| Document | Line | Claim | Type | Verdict | Evidence | Settled by | Owner | Second read |
|----------|------|-------|------|---------|----------|------------|-------|-------------|
| docs/a.md | 3 | Login returns 200 | BEHAVIOUR | CORRECT | src/a.js:10 | - | - | CORRECT holds |
| docs/a.md | 5 | The limit is five | BEHAVIOUR | CORRECT | "export const MAX = 5" | - | - | CORRECT holds |
| docs/a.md | 7 | Logout returns 204 | BEHAVIOUR | WRONG | src/a.js:20 returns 200 | - | - | CORRECT overturned |
| docs/a.md | 9 | Status goes OPEN then DONE | BEHAVIOUR | WRONG | src/a.js:30 goes OPEN, REVIEW, DONE | - | - | WRONG holds |
| docs/a.md | 11 | Retries stop at three \| or four | BEHAVIOUR | UNVERIFIABLE | the retry count comes from a setting outside the repository | the deployment settings | Tran Minh | WRONG cannot tell |
| docs/a.md | 13-14 | Finance asked for the cut-off | INTENT | UNVERIFIABLE | no requirement source given | the requirement note of the cut-off | Requirement owner | - |
| docs/a.md | 15 | The export was asked for by sales | INTENT | CORRECT | plans/x.md:4 | - | - | - |
| docs/b.md | 2 | The table has an id column | BEHAVIOUR | CORRECT | src/b.js:1 | - | - | CORRECT holds |
| docs/b.md | 4 | Nothing deletes on discard | BEHAVIOUR | CORRECT | searched a delete call in src/b.js and src/c.js: none | - | - | CORRECT holds |
