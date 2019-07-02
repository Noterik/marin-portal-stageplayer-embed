FROM node:12-alpine

WORKDIR /tmp
COPY package.json yarn.lock /tmp/

RUN yarn install --ignore-optional --pure-lockfile

COPY . /app/
RUN cp -a /tmp/node_modules /app/
WORKDIR /app
RUN yarn build
ENTRYPOINT ["yarn", "start"]