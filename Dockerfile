# Sử dụng Node.js làm base image
FROM node:18 AS build
# Cài đặt zlib, python3, pip, ffmpeg
RUN apt-get update && apt-get install -y zlib1g-dev

# Đặt thư mục làm việc trong container
WORKDIR /app

# Sao chép package.json và package-lock.json (nếu có)
COPY package*.json ./

# Cài đặt các dependencies
RUN npm install --legacy-peer-deps

# Sao chép toàn bộ mã nguồn vào container
COPY . .


# Build ứng dụng Next.js
RUN npm run build

# Giai đoạn thứ hai: Chỉ cần chạy ứng dụng
FROM node:18 AS run
# Cài đặt zlib, python3, pip, ffmpeg
RUN apt-get update && apt-get install -y \
    zlib1g-dev \
    python3 \
    python3-pip \
    python3-venv \
    ffmpeg \
    && rm -rf /var/lib/apt/lists/*

    
# Đặt thư mục làm việc trong container
WORKDIR /app

# Sao chép các file đã build từ giai đoạn build trước đó
COPY --from=build /app/.next ./.next
COPY --from=build /app/public ./public
COPY --from=build /app/package*.json ./
COPY --from=build /app/.env* ./

#COPY --from=build /app/scripts ./scripts


# Cài đặt các dependencies
RUN npm install --production --legacy-peer-deps

EXPOSE 3000

# Chạy ứng dụng Next.js
CMD ["npm", "run", "start"]
