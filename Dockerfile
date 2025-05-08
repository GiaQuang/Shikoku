# Stage 1: Build ứng dụng
FROM node:22.14-slim AS builder
WORKDIR /app

# Copy package.json và package-lock.json trước để cache tốt hơn
COPY package.json package-lock.json ./

# Cài đặt dependencies (ci = clean install)
RUN npm ci

# Copy mã nguồn và build ứng dụng
COPY . .
RUN npm run build

# Stage 2: Chạy ứng dụng mà không chứa mã nguồn thừa
FROM node:22.14-slim
WORKDIR /app

# Copy bản build và dependencies từ builder
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/package.json ./
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/public ./public

# Start ứng dụng
CMD ["npm", "run", "start"]