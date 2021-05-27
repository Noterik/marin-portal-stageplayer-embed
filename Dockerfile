FROM node:12-alpine

ARG NPM_TOKEN=${NPM_TOKEN}
WORKDIR /tmp
COPY package.json yarn.lock .npmrc /tmp/

RUN yarn install --ignore-optional --pure-lockfile

COPY . /app/
RUN rm /app/.npmrc
RUN cp -a /tmp/node_modules /app/
WORKDIR /app
ENV NODE_ENV=production
RUN yarn build
ENTRYPOINT ["yarn", "run", "start-server"]