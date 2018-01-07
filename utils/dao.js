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

  const { action, event } = nextTrace
  const { metadata, eventId } = event
  const { flowType, bubbleId, fromBubbleId } = metadata

  if (!bubbleId && !fromBubbleId) return traces

  // sort out what to search for next
  let nextQuery

  if (flowType === 'entry') {
    nextQuery = {
      'event.metadata.flowType': 'exit',
      'event.metadata.bubbleId': fromBubbleId,
      'event.eventId': eventId
    }
  } else if (flowType === 'exit') {
    nextQuery = {
      'event.metadata.flowType': 'entry',
      'event.metadata.bubbleId': bubbleId
    }
  } else if (action === 'ENDP SENT') {
    nextQuery = {
      action: 'ENDP RECV',
      'event.eventId': eventId
    }
  } else {
    nextQuery = {
      action: 'REQU SENT',
      'event.eventId': eventId
    }
  }

  // go search for it
  return findCause(nextQuery, traces)
}

async function tree (originId) {
  // build query
  const query = {
    'event.metadata.originId': originId
  }

  // find all
  const collection = await mongo

  const traces = await collection
    .find(query)
    .sort([['time', 1]])
    .toArray()

  if (!traces.length) {
    return {}
  }

  const { bubbleMap, fromBubbleMap } = traces.reduce((maps, trace) => {
    const { bubbleId, instanceId, flowType, fromBubbleId } = trace.event.metadata

    maps.bubbleMap[bubbleId] = maps.bubbleMap[bubbleId] || {}
    maps.bubbleMap[bubbleId][instanceId] = trace

    if (flowType === 'entry') {
      maps.fromBubbleMap[fromBubbleId] = maps.fromBubbleMap[fromBubbleId] || []
      maps.fromBubbleMap[fromBubbleId].push(maps.bubbleMap[bubbleId])
    }

    return maps
  }, {
    bubbleMap: {},
    fromBubbleMap: {}
  })

  const seed = bubbleMap[null]
  const tree = buildTree(fromBubbleMap, seed)

  return tree
}

function buildTree (map, tree) {
  const branches = Object.keys(tree).reduce((branches, instanceId) => {
    const branch = tree[instanceId]

    if (!branch) {
      return branches
    }

    const { flowType, bubbleId } = branch.event.metadata

    if (flowType === 'exit') {
      branch.effects = map[bubbleId].map((t) => {
        return buildTree(map, t)
      })
    }

    branches[instanceId] = {
      action: branch.action,
      instanceId: branch.event.metadata.instanceId,
      eventType: branch.event.eventType,
      resource: branch.event.resource,
      resourceTrace: branch.event.resourceTrace,
      effects: branch.effects,
      data: branch.event.data
    }

    return branches
  }, {})

  const sortedKeys = Object.keys(branches).sort()

  return sortedKeys.map((key) => {
    return branches[key]
  })
}

module.exports = {
  saveTrace,
  findCause,
  tree
}
