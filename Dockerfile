# Select Node.js version
FROM node:14.15.4
# Create app directory
WORKDIR /usr/src/app
# Install dependencies
COPY package*.json ./

RUN npm install
# Copy source code
COPY . .

# Expose port
EXPOSE 8001
# Start app
CMD ["npm", "start"]

