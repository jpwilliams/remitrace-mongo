# remitrace-mongo

Consumes `remitrace` messages and provides an API for parsing the stored information. Can be run as a single service in your infrastructure to provide tracing support to the entire system.

## Usage

First clone the repo, then:

``` js
yarn
yarn start
```

## Environment variables

* `REMIT_URL` The RabbitMQ server to connect to. Defaults to `amqp://localhost:5672`.
* `REMIT_NAME` The service name to give the process. Defaults to `remitrace-mongo`.
* `REMIT_QUEUE` The queue to listen to `remitrace` traces. Defaults to `remitrace`.

## API

`remitrace.findCause`
`remitrace.getAll`
