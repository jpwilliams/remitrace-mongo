const { remit } = require('../utils/singleRemit')
const { tree } = require('../utils/dao')
const queueName = 'remitrace.tree'

module.exports = () => remit
  .endpoint(queueName)
  .handler(handler)
  .start()
  .then(() => {
    console.log(`${queueName} endpoint booted`)
  })

async function handler (event) {
  if (!event.data || !event.data.originId) {
    return Promise.reject({
      code: 400,
      message: 'originId is required'
    })
  }

  return tree(event.data.originId)
}
