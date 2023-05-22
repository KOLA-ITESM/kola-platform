import { useEffect, useRef, useState } from 'react'
import { Line, Bar } from 'react-chartjs-2'
import { getYear, getMonth, getDate } from 'date-fns'

// ** MUI Imports
import Grid from '@mui/material/Grid'
import { Typography, Select, MenuItem } from '@mui/material'
import { TableContainer, Table, TableHead, TableBody, TableRow, TableCell, TablePagination } from '@mui/material'

import mapboxgl from 'mapbox-gl'
import prisma from '../../../prisma'
import { parseCoordinate } from 'src/@core/utils/parse-coordinates'

mapboxgl.accessToken = 'pk.eyJ1Ijoic2ViZnJvbWxoIiwiYSI6ImNsZ2hkNmNodzAwMmkzZXA2cTJlMHlzY2UifQ.-0tFUeRnCr8jISRMn_CRvw'

function formatReadingTime(readingTime) {
  const date = new Date(readingTime)

  // Format the time
  const hoursUTC = date.getUTCHours()
  const hours12 = hoursUTC % 12 || 12
  const minutes = date.getUTCMinutes().toString().padStart(2, '0')
  const amPm = hoursUTC < 12 ? 'AM' : 'PM'
  const time = `${hours12}:${minutes} ${amPm}`

  // Format the date
  const month = (date.getUTCMonth() + 1).toString().padStart(2, '0')
  const day = date.getUTCDate().toString().padStart(2, '0')
  const year = date.getUTCFullYear()
  const formattedDate = `${month}/${day}/${year}`

  return `${time}, ${formattedDate}`
}

const transformForLineChart = groupedReadings => {
  const labels = []
  const data = []

  groupedReadings.forEach(reading => {
    labels.push(reading.readingTime)
    data.push(reading.readingValues)
  })

  return {
    labels,
    datasets: [
      {
        fill: true,
        label: 'Sensor Readings',
        data,
        backgroundColor: 'rgba(75, 192, 192, 0.2)',
        borderColor: 'rgba(75, 192, 192, 1)',
        borderWidth: 1
      }
    ]
  }
}

const transformForBarChart = groupedReadings => {
  const labels = []
  const data = []

  groupedReadings.forEach(reading => {
    labels.push(reading.readingTime)
    data.push(reading.count)
  })

  return {
    labels,
    datasets: [
      {
        label: 'Readings per interval',
        data,
        backgroundColor: 'rgba(75, 192, 192, 0.2)',
        borderColor: 'rgba(75, 192, 192, 1)',
        borderWidth: 1
      }
    ]
  }
}

const Sensor = ({ sensor, sensorReadings }) => {
  const mapContainer = useRef()

  const [page, setPage] = useState(0)
  const [rowsPerPage, setRowsPerPage] = useState(10)

  const [lineChartState, setLineChartState] = useState(transformForLineChart(sensorReadings))
  const [barChartState, setBarChartState] = useState(transformForBarChart(sensorReadings))

  const [lineChartInterval, setLineChartInterval] = useState('daily')
  const [barChartInterval, setBarChartInterval] = useState('daily')

  const handleChangePage = (event, newPage) => {
    setPage(newPage)
  }

  const handleChangeRowsPerPage = event => {
    setRowsPerPage(+event.target.value)
    setPage(0)
  }

  function groupByInterval(readings, interval) {
    let groupedReadings = {}

    readings.forEach(reading => {
      let readingDate = new Date(reading.readingTime)
      let groupKey

      switch (interval) {
        case 'daily':
          groupKey = readingDate.toISOString().split('T')[0] // YYYY-MM-DD format
          break
        case 'weekly':
          let year = getYear(readingDate)
          let week = Math.ceil(
            ((readingDate - new Date(year, 0, 1)) / 86400000 + new Date(year, 0, 1).getDay() + 1) / 7
          )
          groupKey = `${year}-W${week}` // Format: YYYY-WW

          break
        case 'monthly':
          groupKey = `${getYear(readingDate)}-${getMonth(readingDate) + 1}` // YYYY-MM format
          break
        case 'yearly':
          groupKey = getYear(readingDate).toString() // YYYY format
          break
      }

      if (!groupedReadings[groupKey]) {
        groupedReadings[groupKey] = { total: 0, count: 0, average: 0 }
      }

      groupedReadings[groupKey].total += parseFloat(reading.readingValues)
      groupedReadings[groupKey].count += 1
      groupedReadings[groupKey].average = groupedReadings[groupKey].total / groupedReadings[groupKey].count
    })

    return Object.entries(groupedReadings).map(([groupKey, { average, count }]) => ({
      readingTime: groupKey,
      readingValues: average,
      count: count
    }))
  }

  useEffect(() => {
    setLineChartState(transformForLineChart(groupByInterval(sensorReadings, lineChartInterval)))
  }, [lineChartInterval])

  useEffect(() => {
    setBarChartState(transformForBarChart(groupByInterval(sensorReadings, barChartInterval)))
  }, [barChartInterval])

  useEffect(() => {
    const sensorCoordinates = [parseCoordinate(sensor.longitude), parseCoordinate(sensor.latitude)]

    const map = new mapboxgl.Map({
      container: mapContainer.current,
      style: 'mapbox://styles/mapbox/streets-v11',
      center: sensorCoordinates,
      zoom: 10
    })

    new mapboxgl.Marker().setLngLat(sensorCoordinates).addTo(map)

    return () => {
      map.remove()
    }
  }, [])

  return (
    <Grid container spacing={6}>
      <Grid item xs={12}>
        <Typography variant='h5'>
          <div className='flex'>
            {sensor.type} -
            {sensor.status === 'active' ? (
              <div className='flex items-center space-x-2 ml-2'>
                <p className='text-emerald-500'>Active</p>
                <div className='w-2 h-2 rounded-full bg-emerald-500 inline-block' />
              </div>
            ) : (
              <div className='flex items-center space-x-2 ml-2'>
                <p className='text-red-500'>Inactive</p>
                <div className='w-2 h-2 rounded-full bg-red-500 inline-block' />
              </div>
            )}
          </div>
        </Typography>
        <Typography variant='body2'>{sensor.location}</Typography>
      </Grid>

      <Grid item xs={4}>
        <div ref={mapContainer} style={{ width: '100%', height: '90%' }} className='rounded-lg' />
        <Typography variant='body2' align='center' marginTop={3}>
          ({sensor.latitude}, {sensor.longitude})
        </Typography>
      </Grid>

      <Grid item xs={8}>
        <TableContainer style={{ backgroundColor: 'white', borderRadius: '5px' }}>
          <Table stickyHeader aria-label='sticky table'>
            <TableHead>
              <TableRow>
                <TableCell>#</TableCell>
                <TableCell>Reading</TableCell>
                <TableCell>Date / Time</TableCell>
              </TableRow>
            </TableHead>

            <TableBody>
              {sensorReadings.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map(sensorReading => (
                <TableRow hover role='checkbox' tabIndex={-1} key={sensorReading.id} className='cursor-pointer'>
                  <TableCell>{sensorReading.id}</TableCell>
                  <TableCell>{sensorReading.readingValues}</TableCell>
                  <TableCell>{formatReadingTime(sensorReading.readingTime)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>

        <TablePagination
          rowsPerPageOptions={[10]}
          component='div'
          count={sensorReadings.length}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
        />
      </Grid>

      <Grid item xs={6}>
        <div
          style={{
            backgroundColor: 'white',
            padding: '1rem',
            borderRadius: '10px'
          }}
        >
          <Select value={lineChartInterval} onChange={event => setLineChartInterval(event.target.value)}>
            <MenuItem value='daily'>Daily</MenuItem>
            <MenuItem value='weekly'>Weekly</MenuItem>
            <MenuItem value='monthly'>Monthly</MenuItem>
            <MenuItem value='yearly'>Yearly</MenuItem>
          </Select>

          {sensorReadings && (
            <Line
              options={{
                responsive: true,
                plugins: {
                  legend: {
                    position: 'top'
                  },
                  title: {
                    display: true,
                    text: 'Chart.js Line Chart'
                  }
                }
              }}
              data={lineChartState}
            />
          )}
        </div>
      </Grid>

      <Grid item xs={6}>
        <div
          style={{
            backgroundColor: 'white',
            padding: '1rem',
            borderRadius: '10px'
          }}
        >
          <Select value={barChartInterval} onChange={event => setBarChartInterval(event.target.value)}>
            <MenuItem value='daily'>Daily</MenuItem>
            <MenuItem value='weekly'>Weekly</MenuItem>
            <MenuItem value='monthly'>Monthly</MenuItem>
            <MenuItem value='yearly'>Yearly</MenuItem>
          </Select>

          {sensorReadings && (
            <Bar
              options={{
                responsive: true
              }}
              data={barChartState}
            />
          )}
        </div>
      </Grid>
    </Grid>
  )
}

export const getServerSideProps = async query => {
  const sensorId = query.params.id
  const sensor = await prisma.sensor.findUnique({
    where: {
      id: parseInt(sensorId)
    }
  })

  const sensorReadings = await prisma.sensorReading.findMany({
    where: {
      sensorId: parseInt(sensorId)
    }
  })

  const serializedSensorReadings = sensorReadings.map(reading => ({
    ...reading,
    readingValues: parseFloat(reading.readingValues.replace(',', '.')),
    readingTime: reading.readingTime.toISOString()
  }))

  return {
    props: {
      sensor,
      sensorReadings: serializedSensorReadings
    }
  }
}

export default Sensor
