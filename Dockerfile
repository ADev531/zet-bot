FROM node:26-alpine

WORKDIR /usr/server

COPY . .

RUN npm install
RUN npm run build

CMD [ "npm", "run", "start" ]