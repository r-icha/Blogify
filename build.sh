#!/bin/bash

echo "Building and collecting static files..."

# Create a public/uploads folder if not exists
mkdir -p public/uploads

# Move existing static files to public folder
cp -r static/ public/static/

echo "Build script executed successfully!"
