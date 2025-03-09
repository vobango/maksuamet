# Select Node.js version
FROM node:18-slim

# Create app directory
WORKDIR /app

# Set environment defaults
ARG BUILD_TIME_ARGUMENT
ENV MY_ENV="The tag is ${BUILD_TIME_ARGUMENT}"

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy source code
COPY . .

# Build TypeScript
RUN npm run build

# Expose port
EXPOSE 8001

# Start app
CMD ["node", "dist/server.js"]

