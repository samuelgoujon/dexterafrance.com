# dexterafrance

Lists upcoming events from french right-wing medias

## Dependencies 

- Docker (with compose plugin)

## Starting up

```bash
docker compose up -d 
```

Application should be available at http://127.0.0.1:5001/

Start with  mongoadmin
```bash
docker compose -f docker-compose.yml -f docker-compose.dev.yml
```

## Run database seeds

```bash 
docker compose exec app node updatedb.js
```

Additionally, create a cron job to apply further changes 

```bash
0 1 * * * cd <PATH_TO_PROJECT> ; docker compose exec app node updatedb.js
```
