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

-   Clean up emitted data. All data should emit an action with a key that describes the data. ie. `"type": "user_update"`
-   host should be emitted room updates where the secret is set
-   Ensure consistent data format between event data responses
-   Look at migrating users and rooms to redis or mongo. May need to look at TTLs on data to clear out that which isn't updated. Trigger document updates every X when a user is still connected to server?
-   Don't externalise all data - (looking at you, socketIds)
-   Write tests
