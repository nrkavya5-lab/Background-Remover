FROM node:20-alpine

WORKDIR /app

COPY server/package*.json ./server/
RUN cd server && npm ci --only=production

COPY server/ ./server/
COPY shared/ ./shared/

ENV NODE_ENV=production
EXPOSE 5000

CMD ["node", "server/app.js"]
