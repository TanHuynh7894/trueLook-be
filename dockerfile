# ==========================================
# STAGE 1: BUILDER
# ==========================================
FROM node:20-alpine AS builder
WORKDIR /app

COPY package*.json ./
RUN npm install --legacy-peer-deps

COPY . .
RUN npm run build


# ==========================================
# STAGE 2: PRODUCTION
# ==========================================
FROM node:20-alpine
WORKDIR /app

ENV NODE_ENV=production

COPY package*.json ./
RUN npm install --omit=dev --legacy-peer-deps

COPY --from=builder /app/dist ./dist

# Tạo folder uploads trong container
RUN mkdir -p /app/uploads
RUN mkdir -p /app/src/uploads

EXPOSE 3000

CMD ["node", "dist/src/main.js"]