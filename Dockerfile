FROM node:alpine

WORKDIR /app

COPY package*.json ./
RUN npm i

COPY server.js .
COPY public public

EXPOSE 3000

CMD ["node", "server.js"]
