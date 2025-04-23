# Stage 1: Build the frontend
FROM node:22-alpine AS builder

# Set the working directory in the container
WORKDIR /app

# Copy package.json and package-lock.json
COPY package.json .
COPY package-lock.json .

# Install dependencies
RUN npm install

# Copy the rest of the frontend code
COPY . .

# Build the frontend application
RUN npm run build

RUN npm run export

# Stage 2: Serve the static assets
FROM nginx:alpine

# Copy the built assets from the builder stage
COPY --from=builder /app/out /usr/share/nginx/html

# Expose port 80 for HTTP
EXPOSE 80

# Optionally, you can add a custom nginx configuration if needed
# COPY nginx.conf /etc/nginx/nginx.conf

# Nginx serves static files by default from /usr/share/nginx/html
CMD ["nginx", "-g", "daemon off;"]