# syntax=docker/dockerfile:1
FROM node:20-alpine AS builder
WORKDIR /app

ARG VITE_REPORT_SERVICE_URL=http://localhost:3009
ENV VITE_REPORT_SERVICE_URL=${VITE_REPORT_SERVICE_URL}

COPY package*.json ./
RUN npm install

COPY . .
RUN npm run build

FROM nginx:alpine
COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 4009
