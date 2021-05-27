FROM node:12-alpine

ARG NPM_TOKEN=${NPM_TOKEN}
WORKDIR /tmp
COPY package.json yarn.lock .npmrc /tmp/
RUN yarn install --ignore-optional --pure-lockfile

WORKDIR /app
COPY . /app/
RUN rm /app/.npmrc
RUN cp -a /tmp/node_modules /app/
ENTRYPOINT ["yarn", "start"]