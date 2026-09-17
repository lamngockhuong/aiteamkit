# Layer playbooks

Loaded by `atk:fix` when it verifies by layer, and usable earlier, while locating the surface, when
the layer is already known. One section per layer: where the cause usually is, how to reproduce it,
and what belongs in the commit. Four of the five add a verify note, for the one thing about checking
that layer which is this skill's own rather than shared.

What to run for a layer, and what that run may be said to prove, is in
`shared/layer-verification.md`. Read it alongside this file at the verification step. It is shared
because `atk:implement` and `atk:verify` answer that same question for their own reasons, and a
correction to what a run proves has to reach all three.

Every command is a blank in both files. The real one comes from the Commands section of
`.atk/profile.md`, which is per project. A command name written into this file would be right for
one repository and wrong for every other, and would be copied anyway because it looks authoritative.

Layer names also come from the profile. The five below are the common shape; a project with
different layers uses its own names and the same questions.

## The questions per layer

| Question | What it means | Answered in |
|----------|---------------|-------------|
| Where | The directories and the kinds of file that hold this layer | here |
| Reproduce | The cheapest way to see the failure again, without a full environment when possible | here |
| Verify | Which profile command covers this layer, and what a pass actually proves | `shared/layer-verification.md` |
| Commit scope | What belongs in the same commit as a fix here | here |

## Presentation layer

**Where**: the view and component directories from the Layers section. State, props, formatting,
conditional rendering.

**Reproduce**: the screen with the same data. A fixture that carries the failing values beats
clicking through the app, and is the thing that becomes the regression test.

**Commit scope**: the component, its test, and the strings it uses. Not a style sweep of the file.

## Interface layer

**Where**: the route, controller, resolver, and serializer directories. Validation, status codes,
response shape, permission checks.

**Reproduce**: call the endpoint directly with the failing payload, and record the request and the
full response including the status. This is the reproduction that survives into the report best,
because a reviewer can run it.

**Verify note**: a changed response shape needs its consumers listed in the blast radius, because
nothing in this layer tells you who reads the field.

**Commit scope**: the handler, its validation, its test, and the contract document when the response
changed.

## Domain layer

**Where**: services, use cases, domain models, the rules that know nothing of transport or storage.

**Reproduce**: call the unit directly with the failing input. A red test is almost always the right
evidence here, because there is nothing to stand up first.

**Verify note**: this is the layer where a pass means the most, so it is also the layer where a fix
without a new test is least defensible.

**Commit scope**: the rule and its test, together.

## Data layer

**Where**: queries, repositories, migrations, schema, indexes, seed data.

**Reproduce**: run the query against data that shows the failure, and keep the row that proves it.
Take a backup before any command that writes, drops, or alters, including in a local environment
that is easy to recreate: the reproduction data is usually the part that is not easy to recreate.

**Verify note**: a migration is verified by running it, not by reading it. State in the report
whether the rollback was actually run, because the table's claim that it reverses is a claim about a
run that happened.

**Commit scope**: the migration and the code that depends on it, in one commit, so a revert takes
both. Never edit a migration that has already run anywhere but a local machine; add a new one.

## Infrastructure layer

**Where**: container definitions, pipeline workflows, deployment manifests, provisioning files,
environment configuration.

**Reproduce**: often impossible without the environment, and that is the defining property of this
layer rather than a gap in the investigation.

**Verify note**: this layer usually has no test suite, so verification is specific and partial.
Besides the tool's own check, parse the pipeline definition and check shell scripts for syntax
without running them.

Write both halves in the report: what was checked, and what can only be checked by deploying. The
last column of the shared table is doing more work here than anywhere else, because these commands
exit zero while proving the least.

**Commit scope**: the configuration and the document that tells a person how to run it.
