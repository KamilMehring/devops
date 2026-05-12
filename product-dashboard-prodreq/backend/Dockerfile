FROM node:20-alpine AS deps

WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci --omit=dev

FROM node:20-alpine AS runner

ENV NODE_ENV=production \
    PORT=3000

WORKDIR /app

COPY --from=deps /app/node_modules ./node_modules
COPY . .

RUN chown -R node:node /app
USER node

EXPOSE 3000

CMD ["node", "server.js"]