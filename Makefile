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