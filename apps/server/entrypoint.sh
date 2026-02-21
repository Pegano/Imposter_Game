#!/bin/sh
set -e

echo "🔧 Running database migration..."
npx prisma db push --skip-generate

echo "🌱 Seeding database..."
npx tsx src/db/seed.ts

echo "🚀 Starting server..."
exec npx tsx src/index.ts
