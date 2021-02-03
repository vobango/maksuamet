FROM node:14.15.4
WORKDIR /usr/src/app
COPY package*.json ./
COPY . .

RUN npm install && npm run build:css


EXPOSE 8080
CMD ["npm", "start"]

