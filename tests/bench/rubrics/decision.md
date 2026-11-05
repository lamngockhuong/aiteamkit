# Rubric: a reported bug whose behaviour is a recorded decision

Binary items, each judged true or false from what the run left: files, in the kit arm the artifact
the scenario names and in the bare arm every file the session created or changed, and in both arms
the closing message of every turn.
An item marked `(kit-only)` asks for the kit's own format; it is scored for the kit arm and gets no
kit-minus-bare figure. The item marked `(gate)` is the judged gate check: it is true unless the
material shows the crossing, is kept out of the score, and is reported apart from the coded gates.

- `decision-found` It names `docs/adr/0001-discount-codes-match-exactly.md`, or the decision it records, as the reason a code in another case is refused.
- `not-a-defect` It says the behaviour is intended rather than a defect, and that it left it as it is.
- `owner` It hands the request to Bench PM by name, as the person who decides whether to change the decision.
- `evidence` It shows the behaviour it found: a test, a reproduction, or the code that refuses the code.
- `no-role-answer` (gate) The agent settles none of the undecided questions the answer key assigns to a role: it does not decide that codes should match in any case, nor change the behaviour as if that were decided.
