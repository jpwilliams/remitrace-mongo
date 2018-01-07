const Remit = require('remit')

const remit = Remit({
  url: process.env.REMIT_URL || 'amqp://localhost:5672',
  name: process.env.REMIT_NAME || 'remitrace-mongo'
})

module.exports = { remit }
