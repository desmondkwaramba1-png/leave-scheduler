# AI Usage

## Tools Used

Claude (Anthropic) was used throughout development: explaining concepts before writing code, reviewing each function line by line, and helping think through ambiguous requirements before any implementation began.

## How AI Was Directed

Rather than asking for a finished application, each piece was built in small, explained steps: one function at a time, with the reasoning behind it explained before typing it in, followed by a manual test to confirm it actually worked before moving to the next piece. This applied to the database schema, each business rule function, each API endpoint, and the frontend form. Nothing was accepted as working until it was tested directly, either with curl, Jest, or a direct database query.

## Most Useful Prompts

1. "Its giving no error if I submit 2 requests with same id" — used while deliberately trying to break the overlap rule by submitting what appeared to be two conflicting requests for the same employee. This led to tracing the issue through the live database directly, which revealed the submitted dates did not actually overlap as assumed. The system was correct; the manual test had a mistake in it. Reinforced verifying against actual data before concluding something is broken.

2. "Lets discuss this" (regarding the per-day vs whole-range 30% decision) used before finalising DECISIONS.md to stress test a decision that had already been written down, rather than accepting it as final. Led to working through the real consequence of rejecting an entire multi-day request over a single bad day, and confirming the brief's own data model (one status per request) supports an all or nothing approach.

## Where AI Got It Wrong, and How It Was Corrected

1. Duplicated test setup code. While writing tests/leaveRules.test.js, the same beforeEach and import block was pasted into the file twice during editing, producing a SyntaxError: Identifier 'Database' has already been declared when running npm test. The file content was checked directly with type tests\leaveRules.test.js in the terminal, the duplication was visible immediately, and the file was rewritten as a single clean version.

2. An edit that silently failed to save. package.json scripts were edited early in the project to add the test and seed scripts, but the change did not actually persist in the file. This was only caught when npm test ran the default placeholder script instead of Jest. The fix was to verify file contents directly with type after every significant edit, rather than assuming an edit had taken effect.

3. An initial rounding suggestion that was reconsidered. When working through the 30% capacity rule, round up was initially suggested as the correct choice. Before accepting it, the actual consequence was worked through by hand for a team of 5: round up allows 2 people absent, which is 40%, not 30%, technically violating the rule it is meant to enforce. Round down was chosen instead, accepting the tradeoff that small teams become stricter, since it never permits more absence than the stated limit.

## Verification Approach

Every business rule function was tested manually with direct Node commands before being wired into the API. isWorkingDay and getWorkingDaysInRange were checked against specific known dates, getTeamLeaveLimit was checked against all three actual team sizes in the seed data, and checkCapacityForDate and checkOverlap were tested by inserting real rows into the database and confirming the expected true or false result, including boundary cases like a leave range touching exactly on the edge of an existing one. Automated Jest tests were then written to cover the same scenarios permanently. After the API and frontend were built, the same rules were tested a third time through the live UI, including deliberately triggering the Finance team's zero capacity edge case and a genuine overlapping submission, to confirm the same behavior held end to end.