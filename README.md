# Maksuamet application

## Development

Prequisites:
* MongoDB for local database (start with `systemctl start mongodb.service`)

1. install dependencies with `npm install`
2. start application with `npm run dev`

## Deployment

1. download/update external images (mongo) with `docker-compose pull`
2. build local applications with `docker-compose build`
3. start everything with `docker-compose up -d`
3.1 (Optional) Start the app without the `-d` flag and verify that all services start correctly

For updates/maintenance stop application with `docker-compose down`
