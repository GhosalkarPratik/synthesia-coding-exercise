FROM node:16.17.0-alpine

EXPOSE 3000

RUN mkdir -p /app

ADD . /app
WORKDIR /app

CMD npm i && npm run compile && npm run start
