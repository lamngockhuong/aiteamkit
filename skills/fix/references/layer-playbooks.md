# Layer playbooks

Loaded by `atk:fix` when it verifies by layer, and usable earlier, while locating the surface, when
the layer is already known. One section per layer: where the cause usually is, how to reproduce it,
what to run, and what that run proves.

Every command in this file is a blank. The real one comes from the Commands section of
`.atk/profile.md`, which is per project. A command name written into this file would be right for
one repository and wrong for every other, and would be copied anyway because it looks authoritative.

Layer names also come from the profile. The five below are the common shape; a project with
different layers uses its own names and the same four columns.

## The four questions per layer

| Question | What it means |
|----------|---------------|
| Where | The directories and the kinds of file that hold this layer |
| Reproduce | The cheapest way to see the failure again, without a full environment when possible |
| Verify | Which profile command covers this layer, and what a pass actually proves |
| Commit scope | What belongs in the same commit as a fix here |

## Presentation layer

**Where**: the view and component directories from the Layers section. State, props, formatting,
conditional rendering.

**Reproduce**: the screen with the same data. A fixture that carries the failing values beats
clicking through the app, and is the thing that becomes the regression test.

**Verify**: the component test command from the profile. A pass proves the component renders the
right thing for the values tested, and nothing about values that were not tested. Say which.

**Commit scope**: the component, its test, and the strings it uses. Not a style sweep of the file.

## Interface layer

**Where**: the route, controller, resolver, and serializer directories. Validation, status codes,
response shape, permission checks.

**Reproduce**: call the endpoint directly with the failing payload, and record the request and the
full response including the status. This is the reproduction that survives into the report best,
because a reviewer can run it.

**Verify**: the request or integration test command from the profile. A pass proves the contract
for the cases the tests cover. A changed response shape needs its consumers listed in the blast
radius, because nothing in this layer tells you who reads the field.

**Commit scope**: the handler, its validation, its test, and the contract document when the response
changed.

## Domain layer

**Where**: services, use cases, domain models, the rules that know nothing of transport or storage.

**Reproduce**: call the unit directly with the failing input. A red test is almost always the right
evidence here, because there is nothing to stand up first.

**Verify**: the unit test command from the profile. This is the layer where a pass means the most,
so it is also the layer where a fix without a new test is least defensible.

**Commit scope**: the rule and its test, together.

## Data layer

**Where**: queries, repositories, migrations, schema, indexes, seed data.

**Reproduce**: run the query against data that shows the failure, and keep the row that proves it.
Take a backup before any command that writes, drops, or alters, including in a local environment
that is easy to recreate: the reproduction data is usually the part that is not easy to recreate.

**Verify**: the migration and integration commands from the profile. A migration is verified by
running it forward and backward, not by reading it. State whether the rollback was actually run.

**Commit scope**: the migration and the code that depends on it, in one commit, so a revert takes
both. Never edit a migration that has already run anywhere but a local machine; add a new one.

## Infrastructure layer

**Where**: container definitions, pipeline workflows, deployment manifests, provisioning files,
environment configuration.

**Reproduce**: often impossible without the environment, and that is the defining property of this
layer rather than a gap in the investigation.

**Verify**: this layer usually has no test suite, so verification is specific and partial. Validate
the syntax and the resolved configuration with the tool's own check, parse the pipeline definition,
and check shell scripts for syntax without running them. Every one of these proves the file is
well formed and none of them proves the deployment works.

Write both halves in the report: what was checked, and what can only be checked by deploying. An
infrastructure fix reported as verified is the most common false claim in this skill, because the
commands exit zero.

**Commit scope**: the configuration and the document that tells a person how to run it.
