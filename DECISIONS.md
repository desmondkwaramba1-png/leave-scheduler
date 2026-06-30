# Design Decisions

This document covers the three most significant design decisions made in implementing the business rules, the alternatives considered, and the reasoning behind each choice. Two additional smaller decisions, covering weekend handling and public holidays, are noted briefly at the end.

## 1. 30% Rounding for Non-Whole Numbers

**Decision:** Round down using `Math.floor()`.

**The problem:** 30% of a team size is rarely a whole number. A team of 5 gives 1.5, a team of 7 gives 2.1, a team of 3 gives 0.9.

**Alternatives considered:**
- Round up (Math.ceil) — allows more people on leave, but can exceed the literal 30% threshold. A team of 5 rounding up allows 2 people absent, which is 40%, not 30%.
- Round to nearest — produces the same result as round down in most of these cases, with extra complexity for no real benefit.

**Reasoning:** Rounding down guarantees the system never permits more absence than the stated 30% limit. Rounding up would silently violate the business rule it is meant to enforce. The known tradeoff is that small teams become very strict. A team of 3, like Finance in our seed data, rounds down to a limit of 0, meaning no one on that team can ever be approved for leave under this rule. This is documented and intentional, not an oversight.

## 2. Per-Day vs Whole-Range 30% Check

**Decision:** Check the 30% rule against each individual working day in a multi-day request.

**Alternatives considered:**
- Whole-range check — attempting to apply the rule to an entire date range as a single calculation. This has no clear or consistent definition: averaging absence across days produces a number that does not map to any real staffing constraint.

**Reasoning:** The rule explicitly says "no more than 30% of any team may be on leave on the same working day." The word day is in the rule itself. A team is either adequately staffed on a specific day or it is not; that can only be evaluated one day at a time. If any single day in a multi-day request would breach the limit, the entire request is rejected, rather than partially approving some days and not others.

## 3. Overlapping Requests: Pending vs Approved

**Decision:** Both pending and approved requests block new overlapping submissions for the same employee.

**Alternatives considered:**
- Only approved requests block, as the brief's literal wording suggests ("a leave request that overlaps an existing approved request... is invalid").
- Pending requests trigger a warning rather than a hard rejection, leaving the decision to the manager.

**Reasoning:** I chose to extend the rule beyond its literal wording. Allowing overlapping pending requests creates a scenario where two conflicting requests for the same employee could both later be approved, producing exactly the conflict the rule exists to prevent. Blocking at submission time is simpler, safer, and avoids relying on a manager to catch the conflict manually during approval. I am treating this as a deliberate extension of the stated rule rather than a literal reading of it, and I am prepared to defend that choice.

## Additional Decisions

**Weekends in a leave request:** A request consisting entirely of weekend days is rejected outright. A request spanning a mix of weekdays and weekends has the weekend days silently stripped, with only working days processed.

**Public holidays within a leave range:** Public holidays are excluded from both the employee's leave balance and the 30% capacity check for that day, since the entire organisation is off and there is no staffing concern on a holiday.