FROM node:14.15.4

WORKDIR /app/PGPChatAppServer

COPY src/package.json package.json
COPY src/yarn.lock yarn.lock
RUN yarn install

COPY src .

RUN yarn run build

ENV NODE_ENV=production
ENV TURNsecret=
ENV MYSQLHost=
ENV MYSQLPort=
ENV MYSQLUser=
ENV MYSQLPass=

VOLUME /app/PGPChatAppServer/config

CMD [ "yarn", "run", "start" ]