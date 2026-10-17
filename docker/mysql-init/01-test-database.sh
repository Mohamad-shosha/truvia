#!/bin/sh
# Runs once, on first initialization of the data volume only.
# Creates an isolated schema for automated backend tests so they never touch real data.
set -e
mysql -uroot -p"$MYSQL_ROOT_PASSWORD" <<EOSQL
CREATE DATABASE IF NOT EXISTS nextrisk_test CHARACTER SET utf8mb4;
GRANT ALL PRIVILEGES ON nextrisk_test.* TO '${MYSQL_USER}'@'%';
FLUSH PRIVILEGES;
EOSQL
