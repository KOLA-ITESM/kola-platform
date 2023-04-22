import prisma from '../../../prisma/index'
const csv = require('csvtojson')

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
    const csvFile = req.body
    // check if csv file is in body
    if (csvFile === undefined) {
      res.status(400).json({ message: 'No csv file found in body' })
    }
    // if csv file is in body, then create sensors
    else {
      const options = {
        delimiter: ',',
        noheader: false
      }

      const csvJson = await csv(options).fromString(csvFile)
      const newSensors = []

      console.log(csvJson)

      // for (let i = 0; i < csvJson.length; i++) {
      //   const sensor = csvJson[i]
      //   const newSensor = await prisma.sensor.create({
      //     data: {
      //       type: sensor.name,
      //       location: sensor.description,
      //       longitude: sensor.longitude,
      //       latitude: sensor.latitude,
      //       status: 'active'
      //     }
      //   })
      //   newSensors.push(newSensor)
      // }
      res.status(200).json({ message: 'Sensors created', newSensors })
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
