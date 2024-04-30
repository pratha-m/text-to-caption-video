FROM node:14.17.0-alpine
RUN apk update \
    && apk add --no-cache \
        chromium \
        nss \
        freetype \
        freetype-dev \
        harfbuzz \
        ca-certificates \
        ttf-freefont \
    && rm -rf /var/cache/apk/*
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
USER root
CMD ["node","index.js"]