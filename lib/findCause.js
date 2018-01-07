const { remit } = require('../utils/singleRemit')
const { findCause } = require('../utils/dao')
const queueName = 'remitrace.findCause'

module.exports = () => remit
  .endpoint(queueName)
  .handler(handler)
  .start()
  .then(() => {
    console.log(`${queueName} endpoint booted`)
  })

async function handler (event) {
  if (!event.data || !event.data.instanceId) {
    return Promise.reject({
      code: 400,
      message: 'instanceId is required'
    })
  }

  return findCause(event.data.instanceId)
}
