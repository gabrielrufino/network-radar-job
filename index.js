const CronJob = require('cron').CronJob
const axios = require('axios')
const localDevices = require('local-devices')
const speedTest = require('speedtest-net')

const { bytesToBits, toMega } = require('./conversor')

const job = new CronJob('0 * * * * *', function() {
  const startedAt = Date()

  Promise.all([
    speedTest({
      acceptGdpr: true,
      acceptLicense: true
    }),
    localDevices()
  ])
    .then(([result, devices]) => {
      const finishedAt = Date()

      const speed = {
        download: toMega(bytesToBits(result.download.bandwidth)),
        upload: toMega(bytesToBits(result.upload.bandwidth)),
        connected_devices: devices.length,
        started_at: startedAt,
        finished_at: finishedAt
      }
  
      axios.post('http://localhost:3000/speeds', speed)
    })
    .catch(error => console.error(error.message))
}, null, true, 'America/Recife')

job.start()
console.log('Running...')
