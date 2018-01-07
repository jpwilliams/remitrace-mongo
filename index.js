const microboot = require('microboot')

microboot('lib')
  .then(() => {
    console.log('Finished booting')
  })
  .catch((err) => {
    console.error(err)
    process.exit(1)
  })
