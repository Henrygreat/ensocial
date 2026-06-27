# Coolify deployment checklist

Use this app as a Docker Compose resource.

- Build pack: Docker Compose
- Compose file: `/docker-compose.yaml`
- Web service: `web`, port `5173`
- API service: `api`, port `3000`
- Database and Redis are included in the compose file.

Do not create separate MongoDB or MySQL services. EnSocial uses PostgreSQL and Redis.

For production, replace all default passwords and secrets in Coolify environment variables.
