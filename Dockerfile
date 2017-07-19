# Select source image
FROM node:latest

# Set up metadata
LABEL maintainer="Florian Guitton <f.guitton@imperial.ac.uk>"
LABEL version="0.0.1"

# Create app directory
RUN mkdir -p /usr/src/app
WORKDIR /usr/src/app

# Install app dependencies
COPY package.json /usr/src/app/
RUN npm install

# Bundle app source
COPY . /usr/src/app

# Start application
EXPOSE 4242
CMD [ "npm", "start" ]
