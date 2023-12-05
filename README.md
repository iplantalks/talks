# Talks

Web UI for iPlan Talks search service

http://eters.italks.com.ua

Data is stored in Google sheet and is synced to ElasticSearch, code for this can be found in [sync](https://github.com/iplantalks/sync) repository

This repository is for web ui part only

Idea behind such split - is that it will allow to make web part publicly available so anyone wanting to participate can do so

## ElasticSearch

For local development you gonna need ElasticSearch here is how you can run and seed it locally

```bash
docker run -d --name=es -p 9200:9200 -e ELASTICSEARCH_USERNAME=elastic -e ELASTIC_PASSWORD=changeme -e "discovery.type=single-node" -e "xpack.security.enabled=true" -e "xpack.security.enrollment.enabled=false" docker.elastic.co/elasticsearch/elasticsearch:8.11.1
```

to check if it works:

```bash
curl -u elastic:changeme localhost:9200
```

create an index (think of this as table in database):

```bash
curl -s -u elastic:changeme -X PUT http://localhost:9200/talks -H 'Content-Type: application/json' -d '{
  "settings": {
    "number_of_shards": 1,
    "number_of_replicas": 0
  },
  "mappings": {
    "properties": {
      "title": { "type": "text" },
      "description": { "type": "text" },
      "transcript": { "type": "text" },
      "authors": { "type": "keyword" },
      "categories": { "type": "keyword" },
      "levels": { "type": "keyword" },
      "status": { "type": "keyword" },
      "date": { "type": "date" },
      "year": { "type": "integer" },
      "telegram": { "type": "keyword" }
    }
  }
}'
```

and seed it with sample data:

```bash
curl -s -u elastic:changeme -X POST http://localhost:9200/_bulk -H 'Content-Type: application/x-ndjson' --data-binary @seed.json
```

to check if data was saved:

```bash
curl -s -u elastic:changeme -X POST http://localhost:9200/talks/_search -H 'Content-Type: application/json' -d '{"_source":["title"],"size":3,"query":{"match_all":{}}}'
```

## Server

To run server locally use

```bash
node server.js
```

If you do not have node installed use docker instead like so

```bash
docker buildx build --platform linux/amd64 -t talks .
docker run -it --rm -p 3000:3000 --link=es -e ES_HOSTNAME=http://es:9200 talks
```

## Docker

to build image use

```bash
docker buildx build --platform linux/amd64 -t ghcr.io/iplantalks/talks:latest .
docker push ghcr.io/iplantalks/talks
```

to run it locally use

```bash
docker run -it --rm -p 3000:3000 --link=es -e ES_HOSTNAME=http://es:9200 ghcr.io/iplantalks/talks
```

## Notes

Keep in mind, this was written in day or two so do not expect anything fancy here

Also note that by indent fancy frameworks and libraries were skipped to keep everything small and simple
