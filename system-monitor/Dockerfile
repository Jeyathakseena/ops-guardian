FROM node:20-alpine


RUN apk add --no-cache procps

WORKDIR /app

COPY package.json .
COPY monitor.js .

CMD ["node", "monitor.js"]