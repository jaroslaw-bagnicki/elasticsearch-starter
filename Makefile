DC := docker-compose -f docker-compose.yml
DC_DEV := docker-compose -f docker-compose.yml -f docker-compose.dev.yml
PROJECT := $(notdir $(PWD))
MAIN_SERVICE := es-client

default: dev logs

dev:
	@$(DC_DEV) up -d

logs:
	@docker logs -f "$(PROJECT)_$(MAIN_SERVICE)_1"

build:
	@$(DC) build

up:
	@$(DC) up -d

stop:
	@$(DC) stop

down: 
	@$(DC) down

npm-install-elastic-client:
	@npm install --silent --no-save @elastic/elasticsearch

seed-series: npm-install-elastic-client
	@node scripts/seedSeries.js 

seed-movies: npm-install-elastic-client
	@node scripts/seedMovies.js 