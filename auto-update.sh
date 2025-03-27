#!/bin/bash
cd /home/organic/dev/vpnservice && git pull && docker compose down && docker compose pull && docker compose up -d --build
