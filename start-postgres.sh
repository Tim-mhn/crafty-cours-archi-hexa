#! /bin/bash
docker run -d -P -p 127.0.0.1:5432:5432 -e POSTGRES_PASSWORD=mypassword -e POSTGRES_USER=postgres postgres
