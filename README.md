# Maksuamet application

## Development

Prequisites:
* MongoDB for local database (start with `systemctl start mongodb.service`)

1. install dependencies with `npm install`
2. start application with `npm run dev`

## Deployment

1. download/update images with `docker-compose pull`
2. build application with `docker-compose build`
3. start application with `docker-compose up -d`

For updates/maintenance stop application with `docker-compose down`
