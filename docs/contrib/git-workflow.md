# Git Workflow

This repository utilizes [GitLab's CI/CD Pipelines](https://docs.gitlab.com/ee/ci/pipelines/)
to build the artifacts to be deployed, and empowers the [semantic-release](https://semantic-release.gitbook.io/semantic-release/) tool to manage semantic versioning.
The pipeline runs at each push to build and test the artifacts.


## Commit Messages

`semantic-release` is able to compute the correct version analyzing commit
messages, and it automatically generates the release notes for each version.
It uses the [Angular Commit Message Conventions](https://github.com/angular/angular/blob/main/CONTRIBUTING.md#-commit-message-format). For this project, it is sufficient to
specify the `<type>` and the `<summary>` fields, leaving out the `<scope>`.

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


> **Note**: Please make use of present sentences in commit messages instead of
> past sentences, i.e.:

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

A new release is generated when one or more commits are pushed on the `main`
branch, while a pre-release is generated on push on the `dev` branch, for example

- Pushes on `dev` generate: `v0.18.1-dev.1`, `v0.18.1-dev.2`, etc.
- Pushes on `main` generate: `v0.18.1`, `v0.19.0`, etc.

## Branching Workflow

Direct pushes on the `main` branch are not allowed and thus is only possible to
include changes with a Merge Request (MR). As describe above and in the
[gitlab-ci guide](gitlab-ci.md), as push to `dev` branch triggers a new version
that will be deployed to the testbed cluster as stage environment for testing
before the actual release.

Even though pushing directly on `dev` is always allowed, especially for rapid
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

The snippet above shows an example of branching workflow. Let's say that the
latest stable version is `v0.20.0` (`main`). Let's create a new branch starting
from that tag

```shell
git checkout -b new-feature v0.20.0
```

We now apply all the needed changes with as many commits as needed.
When we think we added a sufficient amount of changes, it is possible to merge 
the `new-feature` into the `dev` branch to test them. If `semantic-release`
finds at least one commit message starting with `feat:` token, it understands 
that the minor version number must be increased, creating the pre-release 
`v0.21.0-dev.1`.
The CI/CD pipeline will build and deploy this pre-release to testbed Kubernetes
cluster.
Then, we realize that the feature is not ready yet and we add more changes on
the `new-feature` branch. Again, we want to the them in the staging environment,
thus we merge `new-feature` into `dev` branch. A new pre-release tagged
`v0.21.0-dev.2` will be created. After some tests we elect this pre-release to
candidate for the final release. Thus, we merge `dev` to `main` (via merge
request) and `v0.21.0` version is released.
