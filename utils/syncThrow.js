function syncThrow (err) {
  process.nextTick(() => {
    throw err
  })
}

module.exports = { syncThrow }
