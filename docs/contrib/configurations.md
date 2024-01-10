# Runtime Configurations

In order to work properly, both the backend and the frontend must be provided
with some environment variable. In particular, the backend needs all the IAM
parameters to handle the Oidc/OAuth2 flow, while the frontend needs infos where
the S3 backend (Rados Gateway) is located and how to access to it.

## Environment

During the development phase, if you use Dev Containers, a single env file is
all you need. Simply copy the `envs/example.env` file and name it `dev.env`

```shell
cp envs/example.env envs/dev.env
```

Now edit all the variables as required. In case you need to re-edit the `dev.env`
file, stop and remove all the dev containers and reopen the project.
New containers will be created with the new variables.

### Frontend Environment Variables

The webapp configuration deserves few more words to understand the mechanism
under the hood. Since it is served as *static* website through NGINX configured
as web server, all the environment variables must be provided ad *build* time,
making the deployment cumbersome. For example, if you want to change one single
variable, such as `S3_ENDPOINT` or `S3_REGION` (or both), it would require a new
build just for that.

All environmental variables needed by the frontend, are stored in `env.js` file
located at `app/public`, which is then imported by `app/index.html`.
This file actually doesn't not exists at build time, but it is rather created at
*runtime* by the `app/init_env.sh` script.
When the container starts, as first thing it runs the `init_env.sh` script,
which copies of the `app/public/env.template.js` file to `app/public/env.js`
substituting the variable templates with the hardcoded real value.

To add/modify an environmental variables, the following steps are required

1. Add the name of variable you want to use to `app/public/env.template.js` and
its value placeholder, for example `MY_VAR_FOO`: 

```js
// app/public/env.template.js
window.env = {
  // other vars
  ...
  // add "key" and "value" placeholder for later substitution
  MY_VAR_FOO: MY_VAR_FOO_VALUE
}
```

2. Edit the `app/init_env.sh` script to update the variable placeholder

```sh
# app/init_env.sh

...

# key and value placeholder must match those written in env.template.js, 
# $TMP_FILE must no be changed
sed -i -e "s|MY_VAR_FOO|${MY_VAR_FOO_VALUE}|g" "$TMP_FILE"

...
```

3. Edit the `app/src/index.tsx` to make the new variable visible by the
typescript compiler

```tsx
// app/src/index.tsx

interface EnvInterface {
  // more vars
  MY_VAR_FOO: string;
}
```


Your env variable is the accessible with

```
// someFile.tsx

const foo = window.env.MY_VAR_FOO;
// do something nice with foo
```
