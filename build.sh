#!/bin/bash

# Ensure we're using bun for the build process
echo "Using bun for build process..."

# Run the Next.js build with bun
bun run build

# Check if the build was successful
if [ $? -eq 0 ]; then
    echo "Next.js build successful"
    
    # Run opennextjs-cloudflare build
    bunx opennextjs-cloudflare build
    
    # Check if the opennextjs-cloudflare build was successful
    if [ $? -eq 0 ]; then
        echo "OpenNext.js Cloudflare build successful"
        exit 0
    else
        echo "OpenNext.js Cloudflare build failed"
        exit 1
    fi
else
    echo "Next.js build failed"
    exit 1
fi