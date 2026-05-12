FROM node:20-alpine

ARG IMAGE_VERSION=v2
LABEL version=$IMAGE_VERSION

ENV NODE_ENV=production \
    PORT=3000

WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci --omit=dev \
    && npm cache clean --force \
    && mkdir -p /data \
    && chown -R node:node /app /data

COPY --chown=node:node . .

USER node

EXPOSE 3000

CMD ["node", "server.js"]