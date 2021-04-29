FROM node:14.15.4

WORKDIR /tmp/chatappServer

COPY src/package.json package.json
RUN npm install
RUN npm audit fix

COPY src .

RUN npm run build

CMD [ "npm",  "run", "start" ]