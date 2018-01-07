# remitrace-mongo

Built for [`remit`](https://github.com/jpwilliams/remit) tracing storage and querying utilising [`remitrace`](https://github.com/jpwilliams/remitrace).

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

### `remitrace.tree`

Shows all calls under a particular `originId` and returns them in an understandable, chronological, nested format.

``` js
// example request
const getTree = remit.request('remitrace.tree')

const tree = await getTree({
  originId: '01C39ECGASDQV3GKAG7TPWHGCG'
})

// example response
[
   {
      "action":"REQU SENT",
      "instanceId":"01C39F1KH01E9HEMJEF0047GV1",
      "eventType":"testing.endpoint",
      "resource":"",
      "resourceTrace":"Object.<anonymous> (/Users/jack.williams/personal/remit/dummy.js:35:1)",
      "effects":[
         [
            {
               "action":"ENDP RECV",
               "instanceId":"01C39F1KH9RW44859DA00D3GM1",
               "eventType":"testing.endpoint",
               "resource":"",
               "resourceTrace":"Object.<anonymous> (/Users/jack.williams/personal/remit/dummy.js:35:1)",
               "data":null
            },
            {
               "action":"EMIT SENT",
               "instanceId":"01C39F1KHDJKJNZEH5ZMPB8TQA",
               "eventType":"testing.listener",
               "resource":"",
               "resourceTrace":"remit.endpoint.handler (/Users/jack.williams/personal/remit/dummy.js:12:11)",
               "effects":[
                  [
                     {
                        "action":"LIST RECV",
                        "instanceId":"01C39F1KHGFAQQ0709RWZVEGBG",
                        "eventType":"testing.listener",
                        "resource":"",
                        "resourceTrace":"remit.endpoint.handler (/Users/jack.williams/personal/remit/dummy.js:12:11)",
                        "data":null
                     },
                     {
                        "action":"REQU SENT",
                        "instanceId":"01C39F1KHHC32SZZ50D0FX2882",
                        "eventType":"testing.endpoint2",
                        "resource":"",
                        "resourceTrace":"remit.listen.handler (/Users/jack.williams/personal/remit/dummy.js:31:12)",
                        "effects":[
                           [
                              {
                                 "action":"ENDP RECV",
                                 "instanceId":"01C39F1KHNNJ1CY48Q454RY8MK",
                                 "eventType":"testing.endpoint2",
                                 "resource":"",
                                 "resourceTrace":"remit.listen.handler (/Users/jack.williams/personal/remit/dummy.js:31:12)",
                                 "data":null
                              },
                              {
                                 "action":"ENDP SENT",
                                 "instanceId":"01C39F1KHQ7M9ENE17VPSX4MRR",
                                 "eventType":"testing.endpoint2",
                                 "resource":"",
                                 "resourceTrace":"remit.listen.handler (/Users/jack.williams/personal/remit/dummy.js:31:12)",
                                 "data":"[null,\"handled2\"]"
                              }
                           ]
                        ],
                        "data":null
                     },
                     {
                        "action":"REQU RECV",
                        "instanceId":"01C39F1KHS5GRG8BDN7HVNRMXF",
                        "eventType":"amq.rabbitmq.reply-to.g2dkABByYWJiaXRAbG9jYWxob3N0AAAfpQAAAAAC.sCJ5rq7XRm/Rlw35Z7rtSg==",
                        "resource":"",
                        "resourceTrace":"remit.listen.handler (/Users/jack.williams/personal/remit/dummy.js:31:12)",
                        "data":"handled2"
                     }
                  ],
                  [
                     {
                        "action":"LIST RECV",
                        "instanceId":"01C39F1KHHM2WVNGK14R1VACTX",
                        "eventType":"testing.listener",
                        "resource":"",
                        "resourceTrace":"remit.endpoint.handler (/Users/jack.williams/personal/remit/dummy.js:12:11)",
                        "data":null
                     }
                  ]
               ],
               "data":null
            },
            {
               "action":"ENDP SENT",
               "instanceId":"01C39F1KHEQC9VDWQ67KC69P8V",
               "eventType":"testing.endpoint",
               "resource":"",
               "resourceTrace":"Object.<anonymous> (/Users/jack.williams/personal/remit/dummy.js:35:1)",
               "data":"[null,\"handled\"]"
            }
         ]
      ],
      "data":null
   },
   {
      "action":"REQU RECV",
      "instanceId":"01C39F1KHNEM5EBPGQ0FC76G0F",
      "eventType":"amq.rabbitmq.reply-to.g2dkABByYWJiaXRAbG9jYWxob3N0AAAfoQAAAAAC.NU5mrBb594o8z/VzoH68mQ==",
      "resource":"",
      "resourceTrace":"Object.<anonymous> (/Users/jack.williams/personal/remit/dummy.js:35:1)",
      "data":"handled"
   }
]
```
