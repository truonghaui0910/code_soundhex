# Sử dụng Ubuntu-based như cũ, chỉ tối ưu structure
FROM node:18 AS build

# Cài đặt dependencies hệ thống
RUN apt-get update && apt-get install -y zlib1g-dev

WORKDIR /app

# Copy package files trước để cache layer
COPY package*.json ./
RUN npm install --legacy-peer-deps

# Copy toàn bộ source code
COPY . .

# Disable telemetry và tăng memory
ENV NEXT_TELEMETRY_DISABLED=1
ENV NODE_OPTIONS="--max-old-space-size=4096"

# Build ứng dụng
RUN npm run build

# Production stage
FROM node:18 AS run

# Cài đặt dependencies hệ thống như cũ
RUN apt-get update && apt-get install -y \
    zlib1g-dev \
    python3 \
    python3-pip \
    python3-venv \
    ffmpeg \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Copy từ build stage như cũ
COPY --from=build /app/.next ./.next
COPY --from=build /app/public ./public
COPY --from=build /app/package*.json ./
COPY --from=build /app/.env* ./

# Install production dependencies
RUN npm install --production --legacy-peer-deps

EXPOSE 3000

# Dùng npm start như cũ
CMD ["npm", "run", "start"]