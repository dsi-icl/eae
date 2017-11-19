#!/usr/bin/env bash

rm -rf Docker/*.config.js

cp config/eae.carrier.sample.config.js Docker/eae.carrier.config.js
cp config/eae.compute.sample.config.js Docker/eae.compute.config.js
cp config/eae.interface.sample.config.js Docker/eae.interface.config.js
cp config/eae.scheduler.sample.config.js Docker/eae.scheduler.config.js

cd Docker

docker-compose build
docker-compose pull

echo -e "Please check the configuration files then start the eAE with 'bash start.sh'\n"
