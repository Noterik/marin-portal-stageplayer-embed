FROM node:alpine as builder

RUN mkdir /app && chown node:node /app
WORKDIR /tmp
COPY package.json yarn.lock /tmp/
RUN yarn install --pure-lockfile
WORKDIR /app
COPY . /app/
RUN cp -a /tmp/node_modules /app
RUN yarn build

FROM nginx:alpine
COPY --from=builder /app/public /usr/share/nginx/html/
EXPOSE 80