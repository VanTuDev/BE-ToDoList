# Backend (NestJS) - multi-stage. Builder cần devDependencies (nest CLI) để build.
FROM node:20-alpine AS builder

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build

# Stage chạy production: chỉ cần dist + node_modules production
FROM node:20-alpine

WORKDIR /app

ENV NODE_ENV=production
RUN addgroup -g 1001 -S nodejs && adduser -S nestjs -u 1001

COPY --from=builder /app/dist ./dist
COPY --from=builder /app/package*.json ./
RUN npm ci --omit=dev

USER nestjs
EXPOSE 4000

CMD ["node", "dist/main.js"]
