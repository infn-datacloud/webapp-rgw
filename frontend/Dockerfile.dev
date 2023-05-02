FROM node:19-slim

COPY . /app
WORKDIR /app

RUN npm install && npm cache clean --force

CMD ["npm",  "run", "start"]
