const { remit } = require('../utils/singleRemit')
const { saveTrace } = require('../utils/dao')
const debug = require('debug')('remitrace:consumer')

module.exports = () => {
  const queueName = process.env.REMIT_QUEUE || 'remitrace'

  return remit
    .listen(queueName)
    .handler(handler)
    .start()
    .then(() => {
      console.log(`Consumer booted, watching "${queueName}" queue`)
    })
}

async function handler (event) {
  await saveTrace(event.data)

  debug(`New trace -- Origin: ${event.data.event.metadata.originId} -- Transaction: ${event.data.event.eventId} -- Instance: ${event.data.event.metadata.instanceId} -- Action: ${event.data.action} -- Event: ${event.data.event.eventType} -- Service: ${event.data.event.resource}`)
}
