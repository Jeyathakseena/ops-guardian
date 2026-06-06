FROM node:20-alpine

# procps gives us the GNU version of ps with --sort and --no-headers flags
RUN apk add --no-cache procps

WORKDIR /app

COPY package.json .
COPY monitor.js .

CMD ["node", "monitor.js"]