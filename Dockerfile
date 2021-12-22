# Select Node.js version
FROM node:16-slim
# Create app directory
WORKDIR /app
#Set evironment defaults
ARG BUILD_TIME_ARGUMENT
ENV MY_ENV="The tag is ${BUILD_TIME_ARGUMENT}"
#Startup command
ENTRYPOINT ["node"]

# Start app
CMD ["server.js"]

# Copy source code
COPY . /app

#Build application
RUN npm install

