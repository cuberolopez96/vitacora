# TLS & Reverse Proxy (Caddy) — Example

This document provides a minimal example for using Caddy as a reverse proxy with automatic TLS for Vitacora.

Caddyfile (example):

example.com {
  reverse_proxy 0.0.0.0:8080
  encode gzip
  log {
    output file /var/log/caddy/access.log
  }
}

Docker Compose snippet (production, example with Caddy + app):

version: '3.8'
services:
  app:
    build: ./backend
    restart: unless-stopped
    environment:
      - NODE_ENV=production
    expose:
      - "8080"
    networks:
      - vitacora

  caddy:
    image: caddy:2
    restart: unless-stopped
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./Caddyfile:/etc/caddy/Caddyfile:ro
      - caddy_data:/data
      - caddy_config:/config
    networks:
      - vitacora

volumes:
  caddy_data:
  caddy_config:

networks:
  vitacora:

Notes and verification:
- Replace example.com with your domain and ensure DNS A/AAAA records point to your server.
- Caddy will obtain certificates via Let's Encrypt automatically when ports 80/443 are reachable.
- For development or LAN deployment, use a reverse proxy without TLS (or use self-signed certs) and follow the Quickstart guide.

Security recommendations:
- Keep secrets like JWT_SECRET and DB passwords out of git; use environment variables or a secrets manager.
- Use a minimal surface area for the app (bind to 0.0.0.0 inside container but reverse proxy publicly).
- Consider using HTTP basic auth at the proxy layer for admin/ops endpoints.
