SRCS= ./docker-compose.yaml

all: up

clean:
	docker rm backend  -f -v
	docker rm frontend -f -v
	docker rm dev-db -f
	docker rm prisma-studio -f
	docker rm backend-e2e -f

stop:
	docker stop backend || true
	docker stop frontend || true
	docker stop dev-db || true
	docker stop prisma-studio || true
	docker stop backend-e2e || true

up: stop
	docker compose -f $(SRCS) up -d --build