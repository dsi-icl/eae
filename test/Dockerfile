# Select source image
FROM node:latest

# Create app directories
RUN mkdir -p /usr/app
WORKDIR /usr/app

# Install app dependencies
COPY ./package.json .

# Install eae-compute npm dependencies
RUN npm install; exit 0;
# RUN cat /root/.npm/_logs/*; exit 0;

# Bundle app
COPY ./src ./src
COPY ./test ./test
COPY ./.eslintrc .

# Run compute service
EXPOSE 8000
CMD [ "npm", "test"]
