FROM node:lts-slim

ARG WORKSPACE="/workspace"

COPY ../ ${WORKSPACE}
WORKDIR ${WORKSPACE}/app

RUN npm install && npm cache clean --force

CMD ["npm",  "run", "dev"]
