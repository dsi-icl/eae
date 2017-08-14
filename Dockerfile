# Select source image
FROM node:wheezy

# Install all dependencies
RUN apt-get update

# Create app directories
RUN mkdir -p /usr/app
WORKDIR /usr/app

# Install app dependencies
COPY ./package.json /usr/app/
# Install eae-compute npm dependencies
RUN npm install --silent; exit 0;
RUN cat /root/.npm/_logs/*; exit 0;

# Bundle app
COPY ./src /usr/app/src
COPY ./config/eae.compute.config.js /usr/app/config/eae.compute.config.js

# Run compute service
EXPOSE 80
CMD [ "npm", "start" ]
