FROM ubuntu:16.10@sha256:7d3f705d307c7c225398e04d4c4f8512f64eb8a65959a1fb4514dfde18a047e7

WORKDIR /root

ADD insert_admin_user.py /root

RUN apt-get update -q && apt-get upgrade -y --no-install-recommends \
    && apt-get install -y python-dev python-pip \
    && pip install pymongo

CMD ["python", "insert_admin_user.py", "mongodb:27017", "admin"]
