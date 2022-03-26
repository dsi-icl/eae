FROM ubuntu:20.04@sha256:bea6d19168bbfd6af8d77c2cc3c572114eb5d113e6f422573c93cb605a0e2ffb

WORKDIR /root

ADD insert_admin_user.py /root

RUN apt-get update -q && apt-get upgrade -y --no-install-recommends \
    && apt-get install -y python-dev python-pip \
    && pip install pymongo

CMD ["python", "insert_admin_user.py", "mongodb:27017", "admin"]
