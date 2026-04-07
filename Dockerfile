# Stage 1: Build
FROM node:20-alpine AS builder
WORKDIR /app
ARG NEXT_PUBLIC_SITE_URL
ARG NEXT_PUBLIC_CONTACT_EMAIL
ENV NEXT_PUBLIC_SITE_URL=$NEXT_PUBLIC_SITE_URL
ENV NEXT_PUBLIC_CONTACT_EMAIL=$NEXT_PUBLIC_CONTACT_EMAIL
COPY package.json package-lock.json ./
RUN npm ci
COPY . .
RUN npm run build

# Stage 2: Serve (unprivileged nginx — runs as non-root on port 8080)
FROM nginxinc/nginx-unprivileged:alpine
USER root
RUN apk add --no-cache curl
USER 101
COPY --from=builder /app/out/headers.conf /etc/nginx/conf.d/headers.conf
COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=builder /app/out /usr/share/nginx/html
EXPOSE 8080
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD curl -fsS http://localhost:8080/ >/dev/null || exit 1
CMD ["nginx", "-g", "daemon off;"]
