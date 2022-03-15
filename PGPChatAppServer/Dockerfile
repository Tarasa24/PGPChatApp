FROM node:14.15.4

WORKDIR /tmp/PGPChatAppServer

COPY src/package.json package.json
COPY src/yarn.lock yarn.lock
RUN yarn install

COPY src .

RUN yarn run build

ENV NODE_ENV=production

CMD [ "yarn",  "run", "start" ]