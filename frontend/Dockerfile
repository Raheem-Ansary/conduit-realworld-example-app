FROM node:18-alpine AS build

WORKDIR /usr/src/app

COPY frontend/package*.json ./
RUN npm install

COPY frontend/ ./

ENV NODE_ENV=production

ARG VITE_API_BASE_URL
ENV VITE_API_BASE_URL=${VITE_API_BASE_URL}

RUN npm run build

FROM nginx:alpine AS runtime

ENV NODE_ENV=production

COPY frontend/nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /usr/src/app/dist /usr/share/nginx/html

EXPOSE 80
