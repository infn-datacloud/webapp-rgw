# GitLab CI/CD Pipeline

This repository makes usage of
[GitLab's CI/CD Pipelines](https://docs.gitlab.com/ee/ci/pipelines/)
to build the artifacts to be deployed, and empowers the
[semantic-release](https://semantic-release.gitbook.io/semantic-release/)
tool for semantic versioning.
The CI pipeline it triggered by every push to all branches, running tests and
the artifacts.

## Docker Images

Pipeline's artifacts consist in two docker images (frontend and backend) that
are pushed on the Baltig's internal
[Container Registry](https://baltig.infn.it/infn-cloud/webapp-rgw/container_registry/)

Images are tagged as the name of the branch that triggered the
pipeline. If you are working on the branch named `awesome-feature`,
each push to origin will run the pipeline, producing the following images

- `webapp-rgw/webapp:awesome-feature`
- `webapp-rgw/backend:awesome-feature`

> **Note** that a new push will overwrite those tags.

This is true for all branches apart from `main` and `dev`.
Since pushes to (`dev`)/`main` and `dev` generate new (pre-)releases,
as discussed in the [versioning guide](git-workflow.md#versioning), the images
tags will correspond to the new version. For example, a push to `dev` will
produce the `v0.20.1-dev.3` pre-release and the following docker images

```
webapp-rgw/webapp:v0.20.1-dev.3
webapp-rgw/backend:v0.20.1-dev.3
```

In addition, the `latest-dev` tag is updated to point to the new tag
corresponding to the version just released

```
webapp-rgw/webapp:latest-dev   ->   webapp-rgw/webapp:v0.20.1-dev.3
webapp-rgw/backend:latest-dev  ->   webapp-rgw/backend:v0.20.1-dev.3
```

Similarly, a push to the`main` branch will produce, for example, the
`v0.20.1` release and the following images

```
webapp-rgw/webapp:v0.20.1
webapp-rgw/backend:v0.20.1 

webapp-rgw/webapp:latest    ->   webapp-rgw/webapp:v0.20.1
webapp-rgw/backend:latest   ->   webapp-rgw/backend:v0.20.1 
```

## Kubernetes

On pushes to `dev` and `main` branches, the pipeline triggers a restart of
the Kubernetes test deployment, which will automatically
pull the `latest-dev` images and reload the services.

The testbed deployment is located at https://cloud-vm22.cloud.cnaf.infn.it.
