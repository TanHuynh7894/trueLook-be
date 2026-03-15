# ==========================================
# STAGE 1: BUILDER - Môi trường dùng để build code
# ==========================================
FROM node:20-alpine AS builder
WORKDIR /app

# Copy package.json và cài đặt toàn bộ thư viện
COPY package*.json ./
RUN npm install --legacy-peer-deps

# Copy toàn bộ code và tiến hành build
COPY . .
RUN npm run build

# Lệnh này sẽ in toàn bộ cây thư mục dist ra terminal lúc build.
# Nếu bước cuối cùng vẫn lỗi, hãy cuộn terminal lên xem log của lệnh này để biết file main.js nằm chính xác ở đâu.
RUN ls -R /app/dist


# ==========================================
# STAGE 2: PRODUCTION - Môi trường chạy thực tế
# ==========================================
FROM node:20-alpine
WORKDIR /app

ENV NODE_ENV=production

# Copy package.json và CHỈ cài đặt thư viện cho production
COPY package*.json ./
RUN npm install --omit=dev --legacy-peer-deps

# Bế thư mục dist đã build từ Stage 1 sang
COPY --from=builder /app/dist ./dist

# Bế thư mục uploads từ source gốc sang
COPY --from=builder /app/uploads ./uploads
COPY --from=builder /app/src/uploads ./src/uploads

# Mở port 3000
EXPOSE 3000

# Đã sửa: Trỏ vào dist/src/main.js (Cấu trúc phổ biến khi build NestJS giữ nguyên thư mục src)
# (Nếu ứng dụng của bạn là dạng Monorepo, hãy đổi thành "dist/apps/<tên-app>/main.js")
CMD ["node", "dist/src/main.js"]