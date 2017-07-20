# Select source image
FROM node:alpine

# Set up metadata
LABEL maintainer="Florian Guitton <f.guitton@imperial.ac.uk>"

# Create app directory
RUN mkdir -p /usr/app
WORKDIR /usr/app

# Install app dependencies
COPY package.json /usr/app/
RUN npm install

# Bundle app source
COPY src /usr/app/

# Start application
EXPOSE 4242
CMD [ "npm", "start" ]
