# Select source image
FROM node:wheezy@sha256:4e94d7eab2c3c8c59647b534699c32c5cbcdce371e70eb314c2d056922b2a2f1

# Install all dependencies
RUN apt-get update

# Create app directories
RUN mkdir -p /usr/app
WORKDIR /usr/app

# Install app dependencies
COPY ./package.json /usr/app/
# Install eae-interface npm dependencies
RUN npm install --silent; exit 0;
RUN cat /root/.npm/_logs/*; exit 0;

# Bundle app
COPY ./src /usr/app/src
COPY ./config/eae.interface.config.js /usr/app/config/eae.interface.config.js

# Run compute service
EXPOSE 80
CMD [ "npm", "start" ]