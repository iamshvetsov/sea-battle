FROM node:alpine
WORKDIR /backend
ADD package*.json .
RUN npm ci
CMD npm start