FROM node:12-alpine

WORKDIR /tmp
COPY package.json yarn.lock /tmp/
RUN yarn install --ignore-optional --pure-lockfile

WORKDIR /app
COPY . /app/
RUN cp -a /tmp/node_modules /app/
ENTRYPOINT ["yarn", "start"]