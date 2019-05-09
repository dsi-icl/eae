#!/usr/bin/env bash

rm -rf Docker/*.config.js

cp config/eae.carrier.sample.config.js Docker/eae.carrier.config.js
cp config/eae.compute.sample.config.js Docker/eae.compute.config.js
cp config/eae.interface.sample.config.js Docker/eae.interface.config.js
cp config/eae.scheduler.sample.config.js Docker/eae.scheduler.config.js

cd Docker

echo -e "Building the images\n"

docker-compose build

echo -e "\nPulling the latest Docker images from DockerHub\n"

docker-compose pull

echo -e "\nPlease check the configuration files then start the eAE with 'bash start.sh'\n"
