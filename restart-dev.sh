#!/bin/bash

echo "🧹 Nettoyage des caches..."
rm -rf .next
rm -rf node_modules/.cache
rm -rf .next/cache

echo "🚀 Redémarrage du serveur de développement..."
npm run dev