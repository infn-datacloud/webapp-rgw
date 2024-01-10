# GitLab CI/CD Pipeline

This repository utilizes
[GitLab's CI/CD Pipelines](https://docs.gitlab.com/ee/ci/pipelines/)
to build the artifacts to be deployed, and empowers the
[semantic-release](https://semantic-release.gitbook.io/semantic-release/)
tool to manage semantic versioning.
The pipeline runs at each push to build and test the artifacts.

## Docker Images

Pipeline's artifacts are two docker images (frontend and backend)
that are pushed on the Baltig's internal
[Container Registry](https://baltig.infn.it/infn-cloud/webapp-rgw/container_registry/)

Images are tagged accordingly with the name of the branch that triggered the
pipeline, for example, if you are working on the branch named `awesome-feature`,
each push will trigger the pipeline that will produces the following images

- `webapp-rgw/webapp:awesome-feature`
- `webapp-rgw/backend:awesome-feature`

> **Note** that a new push il overwrite those tags.

This is true for all branches different from `main` and `dev`. Since pushes
on `main` and `dev` generate new release or pre-release, respectively,
as discussed in the [versioning guide](git-workflow.md#versioning), the images
tags will be the new versions. For example, if a push to the `dev` branch
produces the new version `v0.20.1-dev.3`, the docker images will be tagged as

```
webapp-rgw/webapp:v0.20.1-dev.3
webapp-rgw/backend:v0.20.1-dev.3
```

In addition, the `latest-dev` tag will be updated to point the new tag
corresponding to the last version, i.e.:

```
webapp-rgw/webapp:latest-dev   ->   webapp-rgw/webapp:v0.20.1-dev.3
webapp-rgw/backend:latest-dev  ->   webapp-rgw/backend:v0.20.1-dev.3
```

Similarly, a push on the`main` branch, that will produce the, for example, the
`v0.20.1` version, will generate the following images

```
webapp-rgw/webapp:v0.20.1
webapp-rgw/backend:v0.20.1 

webapp-rgw/webapp:latest    ->   webapp-rgw/webapp:v0.20.1
webapp-rgw/backend:latest   ->   webapp-rgw/backend:v0.20.1 
```

## Kubernetes

When pushing on the `dev` or `main` branches, the last step of the pipeline will
trigger a restart of the Kubernetes test deployment, which will automatically
pull the `latest-dev` images.

The testbed deployment is located at https://cloud-vm22.cloud.cnaf.infn.it.
