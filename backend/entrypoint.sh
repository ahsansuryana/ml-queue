#!/bin/sh
set -e
npx prisma db push --accept-data-loss --skip-generate
exec node dist/index.js
