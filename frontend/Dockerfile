# Multi-stage build for React frontend
# Stage 1: Build the React application
FROM node:18-alpine as build

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci --silent

# Copy source code
COPY . .

# Build the application
RUN npm run build

# Stage 2: Serve the application with nginx
FROM nginx:alpine

# Copy custom nginx configuration
COPY nginx.conf /etc/nginx/nginx.conf

# Copy built application from build stage
COPY --from=build /app/build /usr/share/nginx/html

# Create non-root user for security
RUN adduser -S swasthvault -u 1001 -G nginx

# Change ownership of nginx directories
RUN chown -R swasthvault:nginx /var/cache/nginx && \
    chown -R swasthvault:nginx /var/log/nginx && \
    chown -R swasthvault:nginx /etc/nginx/conf.d
RUN touch /var/run/nginx.pid && \
    chown -R swasthvault:nginx /var/run/nginx.pid

# Switch to non-root user
USER swasthvault

# Expose port
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:3000/ || exit 1

# Start nginx
CMD ["nginx", "-g", "daemon off;"]
