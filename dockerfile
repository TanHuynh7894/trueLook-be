FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
# Thêm cờ bỏ qua xung đột phiên bản vào đây để build không bị sập
RUN npm install --legacy-peer-deps
COPY . .
RUN npm run build


FROM node:20-alpine
WORKDIR /app
COPY package*.json ./
COPY --from=builder /app/dist ./dist
RUN npm install --omit=dev --legacy-peer-deps
EXPOSE 3000
CMD ["node", "dist/main.js"]