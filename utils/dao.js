const { syncThrow } = require('./syncThrow')
const { MongoClient } = require('mongodb')
const mongoUrl = process.env.MONGO_URL || 'mongodb://localhost'
const mongoDb = process.env.MONGO_DB || 'remit'
const mongoCollection = process.env.MONGO_COLLECTION || 'remitrace'
const mongo = getConnection()

async function getConnection () {
  const client = await MongoClient
    .connect(mongoUrl)
    .catch(syncThrow)

  client.on('close', syncThrow)

  return client.db(mongoDb).collection(mongoCollection)
}

async function saveTrace (trace) {
  const collection = await mongo

  return collection.insertOne(trace)
}

async function findCause (query, traces = []) {
  // handle the initial sending of an instanceId
  if (typeof query === 'string') {
    query = { 'event.metadata.instanceId': query }
  }

  // find a trace and return early if it's the end of the line
  const collection = await mongo
  const nextTrace = await collection.findOne(query)
  if (!nextTrace) return traces
  traces.push(nextTrace)

  const { metadata, eventId } = nextTrace.event
  const { flowType, bubbleId, fromBubbleId } = metadata

  if (!bubbleId && !fromBubbleId) return traces

  // sort out what to search for next
  const nextQuery = flowType === 'exit' ? {
    'event.metadata.flowType': 'entry',
    'event.metadata.bubbleId': bubbleId
  } : {
    'event.metadata.flowType': 'exit',
    'event.metadata.bubbleId': flowType ? fromBubbleId : bubbleId,
    'event.eventId': eventId
  }

  // go search for it
  return findCause(nextQuery, traces)
}

async function findAll (originId) {
  // build query
  const query = {
    'event.metadata.originId': originId
  }

  // find all
  const collection = await mongo

  return collection
    .find(query)
    .sort([['time', 1]])
    .toArray()
}

module.exports = {
  saveTrace,
  findCause,
  findAll
}
