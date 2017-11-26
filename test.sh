#!/usr/bin/env bash

# We build the Docker image for the test
docker-compose -f ./test/docker-compose.yml build tests

# We check that all images are locally available otherwise we download them
docker-compose -f ./test/docker-compose.yml images

# We run the end to end test
docker-compose -f ./test/docker-compose.yml up tests
docker-compose -f ./test/docker-compose.yml run tests npm test

# We clean up
docker-compose -f ./test/docker-compose.yml down --rmi all --remove-orphans