FROM node:alpine
WORKDIR /frontend
ADD package*.json .
RUN npm ci
CMD npm start