# Fact sheet: the review-target branch

What the people of the order-api team know. The responder answers from this sheet only.

## People

- Bench Lead: Tech Lead, approves code changes and designs, owns technical decisions, and decides
  whether a branch is merged.
- Bench PM: product manager, owns scope, priority, and which discounts customers are promised.
- Bench QA: tester, reports defects and owns test cases.
- Bench Dev: developer, wrote the review-target branch.

## The branch

- review-target is Bench Dev's branch, two commits on main, waiting to be merged into main.
- There is no pull request number and no ticket; the request came from Bench PM in conversation.
- What Bench PM asked for: a line of ten units or more gets 5% off its line total, before any
  discount code; and an admin can add a discount code without a deploy.
- A discount code takes between 1 and 100 percent off.
- The admin token is read from ADMIN_TOKEN. Whether every environment sets it is written down
  nowhere; Bench Lead owns the deploy configuration.
- There is no design document for this change, and no recorded review checklist.
- Whether the branch is merged: Bench Lead decides, after the review.
