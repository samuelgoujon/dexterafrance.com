FROM node:10-buster

WORKDIR /app

COPY . /app

RUN npm ci

CMD npm run start
