import prisma from '../../../prisma/index'
const csv = require('csvtojson')

function cleanRawCsv(rawCsv) {
  const lines = rawCsv.split('\n')
  const headerLineIndex = lines.findIndex(line => line.startsWith('name,latitude,longitude,description'))

  if (headerLineIndex === -1) {
    throw new Error('Column headers not found')
  }

  const cleanedLines = lines.slice(headerLineIndex, -2)
  const cleanedCsv = cleanedLines.join('\n')

  return cleanedCsv
}

export default async function handler(req, res) {
  if (req.method === 'GET') {
    // check if all param is set to true on request params
    if (req.query.all && req.query.all === 'true') {
      // get all sensors
      const sensors = await prisma.sensor.findMany({})

      if (sensors.length === 0) {
        res.status(404).json({ message: 'No sensors found' })
      } else {
        res.status(200).json({ message: 'Sensors found', sensors })
      }
    }
    // check if id param is set on request params
    else if (req.query.id) {
      // Check if sensor exists
      const sensor = await prisma.sensor.findUnique({
        where: {
          id: parseInt(req.query.id)
        }
      })
      if (sensor !== null) {
        res.status(200).json({ message: 'Sensor found', sensor })
      } else {
        res.status(404).json({ message: 'Sensor not found' })
      }
    }
    // if no id or all param is set
    else {
      res.status(400).json({ message: 'No sensor id found or all param in request' })
    }
  }
  if (req.method === 'POST') {
    // check if post request is for csv file or not
    if (req.query.csv && req.query.csv === 'false') {
      const { type, location, longitude, latitude } = req.body
      const newSensors = []
      const newSensor = await prisma.sensor.create({
        data: {
          type,
          location,
          longitude,
          latitude,
          status: 'active'
        }
      })
      newSensors.push(newSensor)
      res.status(200).json({ message: 'Sensor created', newSensors })
    } else if (req.query.csv && req.query.csv === 'true') {
      const csvJson = await csv().fromString(cleanRawCsv(csvFile))
      const newSensors = []

      for (let i = 0; i < csvJson.length; i++) {
        const sensor = csvJson[i]
        const newSensor = await prisma.sensor.create({
          data: {
            type: sensor.name,
            location: sensor.description,
            longitude: sensor.longitude,
            latitude: sensor.latitude,
            status: 'active'
          }
        })
        newSensors.push(newSensor)
      }
      res.status(200).json({ message: 'Sensors created', newSensors })
    } else {
      res.status(400).json({ message: 'No csv param found in request' })
    }
  }
  if (req.method === 'DELETE') {
    //check if all param i set to true on request params and delete all sensors
    if (req.query.all && req.query.all === 'true') {
      // delete all sensors
      await prisma.sensor.deleteMany({})
      res.status(200).json({ message: 'All sensors deleted' })
    }
    // check if id param is set on request params, and only delete one sensor
    else if (req.query.id) {
      // Check if sensor exists
      const sensor = await prisma.sensor.findUnique({
        where: {
          id: parseInt(req.query.id)
        }
      })
      if (sensor !== null) {
        //delete sensor
        await prisma.sensor.delete({
          where: {
            id: parseInt(req.query.id)
          }
        })
        res.status(200).json({ message: 'Sensor deleted' })
      } else {
        res.status(404).json({ message: 'Sensor not found' })
      }
    }
    // if no id or all param is set return error
    else {
      res.status(400).json({ message: 'No sensor id found or all param in request' })
    }
  }
}
