# Nest auth template

This repository provides simple boilerplate for implementing authentication in a NestJS application using JSON Web Tokens (JWT).

### Key Features:

1. JWT Authentication: Secure authentication using JSON Web Tokens.
2. Role-Based Access Control: Easily extendable to support different user roles and permissions.
3. Environment Configuration: Centralized configuration management using @nestjs/config.
4. TypeORM Integration: Database management with TypeORM, supporting PostgreSQL out of the box.
5. Redis Integration: Redis support via ioredis for session management, caching, or other use cases.
6. Scalability: Modular architecture, making it easy to extend and scale.
7. Best Practices: Includes TypeScript, ESLint, and Prettier for code quality and consistency.

# Project Setup

## Prerequisites

Ensure you have Docker and Docker Compose installed on your machine.

## Environment Variables

1. Create your environment variables file by copying `.env.example` to `.env`:

   ```bash
   cp .env.example .env
   ```

2. Update the `.env` file with your specific environment configurations.

## Running the App with Docker

The recommended way to run the project is by using Docker. Docker Compose will handle all the necessary services.

### Starting the Application

To spin up the entire application (including the database, Redis, and other services), run:

```bash
$ docker-compose up --build
```

This command will build the Docker images if they don't exist, and start the containers as defined in your docker-compose.yml file.

### Stopping the Application

To stop the running containers, press CTRL+C or run:

```bash
$ docker-compose down
```

This command will stop and remove the containers, but the data in the volumes (e.g., PostgreSQL and Redis data) will be preserved.

## Testing

Testing can be done inside the Docker container or on your local machine if you have Node.js installed.

### Running Tests in Docker

To run the tests inside the Docker container:

```bash
$ docker-compose exec app npm run test
```

### Running Tests Locally

If you prefer running tests on your local machine:

1. Install the dependencies:

```bash
$ npm install
```

2. Run the tests:

```bash
# unit tests
$ npm run test

# e2e tests
$ npm run test:e2e

# test coverage
$ npm run test:cov
```
