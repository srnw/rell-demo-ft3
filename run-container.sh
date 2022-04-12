#!/usr/bin/env bash

docker run \
    -v "$PWD/rell:/usr/src/rell" \
    -p 5432:5432 \
    -p 7740:7740 \
    --interactive --tty \
    docker.io/snieking/postchain
