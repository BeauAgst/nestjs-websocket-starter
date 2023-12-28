<p align="center">
  <a href="http://nestjs.com/" target="blank"><img src="https://nestjs.com/img/logo-small.svg" width="200" alt="Nest Logo" /></a>
</p>

## Description

[Nest](https://github.com/nestjs/nest) framework TypeScript starter repository for a WebSocket server. Users are designed to be thrown away, and are cleared out periodically.

## Installation

```bash
$ yarn install
```

## Running the app

```bash
# development
$ yarn run start

# watch mode
$ yarn run start:dev

# production mode
$ yarn run start:prod
```

## Test

```bash
# unit tests
$ yarn run test

# e2e tests
$ yarn run test:e2e

# test coverage
$ yarn run test:cov
```

## TODO

-   Look at migrating users and rooms to redis
-   Look at TTLs on data to clear out that which isn't updated. Trigger document updates every X when a user is still connected to server?
-   Write tests
-   secret needs to be updated every time host re-connects
