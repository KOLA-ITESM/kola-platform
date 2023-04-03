import prisma from '../../../prisma/index'
const csv = require('csvtojson')

export default async function handler(req, res) {
  if (req.method === 'GET') {
    // check if all param is set to true on request params
    if (req.query.all && req.query.all === 'true') {
      // get all sensors readings
      const readings = await prisma.sensorReading.findMany({})

      if (readings.length !== 0) {
        res.status(200).json({ message: 'Readings found', readings })
      } else {
        res.status(404).json({ message: 'No readings found' })
      }
    }
    // check if id param is set on request params
    else if (req.query.id) {
      // Check if sensor exists
      const reading = await prisma.sensorReading.findUnique({
        where: {
          id: parseInt(req.query.id)
        }
      })
      if (sensor !== null) {
        res.status(200).json({ message: 'Reading found', reading })
      } else {
        res.status(404).json({ message: 'Reading not found' })
      }
    }
    // if no id or all param is set
    else {
      res.status(400).json({ message: 'No reading id found or all param in request' })
    }
  }

  if (req.method === 'POST') {
    const csvFile = req.body
    // check if csv file is in body
    if (csvFile === undefined) {
      res.status(400).json({ message: 'No csv file found in body' })
    }
    // if csv file is in body, then create sensors
    else {
      const csvJson = await csv().fromString(csvFile)
      const newReadings = []
      for (let i = 0; i < csvJson.length; i++) {
        const reading = csvJson[i]
        const newReading = await prisma.sensorReading.create({
          data: {
            sensorId: reading.id,
            readingValues: reading.value,
            readingTime: reading.date
          }
        })
        newReadings.push(newReading)
      }
      res.status(200).json({ message: 'Readings created', newReadings })
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
    // check if id param is set on request params, and only delete one sensor
    else if (req.query.id) {
      // Check if sensor exists
      const reading = await prisma.sensorReading.findUnique({
        where: {
          id: parseInt(req.query.id)
        }
      })
      if (reading !== null) {
        //delete sensor
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
