# Select source image
FROM node:alpine

# Set up metadata
LABEL maintainer="Florian Guitton <f.guitton@imperial.ac.uk>"
LABEL version="0.0.1"

# Create app directory
RUN mkdir -p /usr/app
WORKDIR /usr/app

# Install app dependencies
COPY package.json /usr/app/
RUN apk update && apk upgrade && apk add git
RUN npm install

# Bundle app source
COPY src/* /usr/app/

# Start application
EXPOSE 4242
CMD [ "npm", "start" ]
