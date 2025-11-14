# Build stage
FROM node:18-alpine AS build

WORKDIR /usr/src/app

# Copy package.json and install dependencies (use npm install because package-lock.json may be absent)
COPY package*.json ./
RUN npm install

# Copy source (relative to build context ./frontend) and build
COPY . ./
RUN npm run build

# Runtime stage (nginx to serve static files)
FROM nginx:alpine AS runtime

# If you have a custom nginx.conf in frontend/, copy it. Otherwise remove this line.
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copy built static files from build stage
COPY --from=build /usr/src/app/dist /usr/share/nginx/html

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]

