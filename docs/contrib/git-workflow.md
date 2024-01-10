# Git Workflow

This repository relies on
[GitLab's CI/CD Pipelines](https://docs.gitlab.com/ee/ci/pipelines/) to build
the artifacts to be deployed, and empowers the
[semantic-release](https://semantic-release.gitbook.io/semantic-release/) tool
to manage semantic versioning.
The pipeline runs at each push to build and test the artifacts.


## Commit Messages

`semantic-release` is infers the next version by analyzing commit
messages and automatically generates release notes for each version.
It makes usage of the
[Angular Commit Message Conventions](https://github.com/angular/angular/blob/main/CONTRIBUTING.md#-commit-message-format).
For this project, it is sufficient to specify the `<type>` and the `<summary>`
fields, leaving out the `<scope>`.

In order to generate proper versions and release notes, commit messages MUST
have the following format

```text
<type>: <summary>
```

where `<type>` MUST be one among `build|ci|docs|feat|fix|perf|refactor|test`.

Example of commit messages:

Must be one of the following:

- **build**: Changes that affect the build system or external dependencies
- **ci**: Changes to our CI configuration files and scripts 
- **docs**: Documentation only changes
- **feat**: A new feature
- **fix**: A bug fix
- **perf**: A code change that improves performance
- **refactor**: A code change that neither fixes a bug nor adds a feature
- **test**: Adding missing tests or correcting existing tests

</br>

> **Note**: Please don't use past tense in commit messages, but use present
> tense instead.

```
feat: Add awesome feature      # CORRECT
feat: Added awesome feature    # WRONG
```

or

```
fix: fixed a bug                               # WRONG
fix: button click not opening the alert popup  # CORRECT
```

## Versioning

A new release is generated when one or more commits are pushed to the `main`
branch, while pushing to the `dev` branch trigger a new a pre-release.

For example, pushes to `dev` generate `v0.18.1-dev.1`, `v0.18.1-dev.2`, etc,
and pushes to `main` generate `v0.18.1`, `v0.19.0`, etc.

## Branching Workflow

Direct pushes to `main` are not allowed and thus is only possible to
include changes only with via Merge Requests (MR). As described in the
[gitlab-ci guide](gitlab-ci.md), pushes to `dev` trigger a new versions
that will be deployed to the testbed cluster as a stage environment for testing
before the final release.

Despite pushes to `dev` are always allowed, especially for rapid
fixes, we encourage to work on a dedicated branch, especially when developing a
big new feature.

```
        v0.20.0                                      v0.21.0 
main -------*------------------------------------------*-------------
             \            v0.21.0-dev.1               / v0.21.0-dev.2
dev  ---------*------------------*-------------------*---------------   
               \                /                   /
new-feature     \----*----*----/----*----*----*----/
```

The figure above shows an example of branching workflow. Let's say that the
latest stable version is `v0.20.0`. Let's create a new branch starting
from it

```shell
git checkout -b new-feature v0.20.0
```

We now apply all the needed changes with as many commits as needed.
When we think we have, it is possible to merge (rebasing eventual other
changes from `dev`) `new-feature` into `dev` branch to test it on on the
testbed cluster.
If `semantic-release` finds at least one commit message starting with the
`feat:` token, it will increment the minor version number creating the
pre-release `v0.21.0-dev.1`.
The CI/CD pipeline will build and deploy the pre-release to the
Kubernetes test cluster.
Then, we realize that the feature is not ready yet and we add more changes on
the `new-feature` branch. Again, we want to the them in the staging environment,
thus we merge `new-feature` into `dev`. A new pre-release tagged
`v0.21.0-dev.2` will be created. After proper testing we elect the pre-release
as candidate for the final release. Thus, we merge `dev` to `main` (via merge
request) and `v0.21.0` version is released and Docker images deployed to the
container registry.
