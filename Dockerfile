# A built static site for the box: build with Node, serve the output with nginx.
# Copy this file and nginx.conf to the repo root. Change BUILD_CMD and OUT_DIR if the project differs.
FROM node:22-alpine AS build
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci --no-audit --no-fund
COPY . .
ARG BUILD_CMD="npm run build"
RUN sh -c "$BUILD_CMD"

FROM nginx:1.27-alpine
ARG OUT_DIR=dist
COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/${OUT_DIR} /usr/share/nginx/html
EXPOSE 80
