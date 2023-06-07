import prisma from '../../../prisma/index'
const csv = require('csvtojson')

export default async function handler(req, res) {
  if (req.method === 'GET') {
    // check if all param is set to true on request params
    if (req.query.all && req.query.all === 'true') {
      // get all sensors readings
      const readings = await prisma.sensorReading.findMany({})

      // todo: cambiar a 200 con arreglo vacio
      if (readings.length !== 0) {
        res.status(200).json({ message: 'Readings found', readings })
      } else {
        res.status(404).json({ message: 'No readings found' })
      }
    }
    // check if id param is set on request params
    else if (req.query.id) {
      // Check if reading exist
      const reading = await prisma.sensorReading.findUnique({
        where: {
          id: parseInt(req.query.id)
        }
      })
      if (reading !== null) {
        res.status(200).json({ message: 'Reading found', reading })
      } else {
        res.status(404).json({ message: 'Reading not found' })
      }
    }
    // check if sensorId is set on request params
    else if (req.query.sensorId) {
      // checck if readings exist in that sensor
      const readings = await prisma.sensorReading.findMany({
        where: {
          sensorId: parseInt(req.query.sensorId)
        }
      })

      if (readings !== null) {
        res.status(200).json({ message: 'Readings found', readings })
      } else {
        res.status(400).json({ message: 'Readings not found' })
      }
    }
    // if no id or all param is set
    else {
      res.status(400).json({ message: 'No reading id found or all param in request' })
    }
  }

  if (req.method === 'POST') {
    // check if post request meets the required params
    if (req.query.csv && req.query.csv === 'true' && req.query.sensorId) {
      const csvFile = req.body
      const sensorId = parseInt(req.query.sensorId)

      const csvJson = await csv().fromString(csvFile)
      const newReadings = []

      for (let i = 0; i < csvJson.length; i++) {
        const reading = csvJson[i]
        // check if the read already exists
        const existingReading = await prisma.sensorReading.findFirst({
          where: {
            readingId: reading.id,
            sensorId: sensorId
          }
        })

        if (existingReading === null) {
          // create new record
          const newReading = await prisma.sensorReading.create({
            data: {
              readingId: reading.id,
              readingValues: reading.value,
              readingTime: new Date(reading.date),
              sensorId: sensorId
            }
          })

          newReadings.push(newReading)
        }
      }
      res.status(200).json({ message: 'Readings created', newReadings })
    } else if (req.query.mediaUrl && req.query.mediaUrl === 'true' && req.query.sensorId) {
      const mediaUrl = req.body.mediaUrl
      const readingDate = req.body.readingDate
      const sensorId = parseInt(req.query.sensorId)

      console.log('mediaUrl', mediaUrl)
      console.log('readingDate', readingDate)

      const newReading = await prisma.sensorReading.create({
        data: {
          readingId: sensorId + '-' + new Date().toISOString().replace(/[:.-]/g, ''),
          readingValues: mediaUrl,
          readingTime: new Date(readingDate),
          sensorId: sensorId
        }
      })

      res.status(200).json({ message: 'Reading created', newReading })
    } else {
      res.status(400).json({ message: 'CSV file, media file or reading ID not found in request' })
    }
  }

  if (req.method === 'DELETE') {
    //check if all param i set to true on request params and delete all readings
    if (req.query.all && req.query.all === 'true') {
      // delete all readings
      await prisma.sensorReading.deleteMany({})
      res.status(200).json({ message: 'All readings deleted' })
    }
    // check if id param is set on request params, and only delete one sensor
    else if (req.query.id) {
      // Check if reading exists
      const reading = await prisma.sensorReading.findUnique({
        where: {
          id: parseInt(req.query.id)
        }
      })
      if (reading !== null) {
        //delete reading
        await prisma.sensorReading.delete({
          where: {
            id: parseInt(req.query.id)
          }
        })
        res.status(200).json({ message: 'Reading deleted' })
      } else {
        res.status(404).json({ message: 'Reading not found' })
      }
    }
    // if no id or all param is set return error
    else {
      res.status(400).json({ message: 'No reading id found or all param in request' })
    }
  }
}
