# Select Node.js version
FROM node:16-slim
#Install additional tools
RUN apt update && apt -y install curl net-tools procps
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

