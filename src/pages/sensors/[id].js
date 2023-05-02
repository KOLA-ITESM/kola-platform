import { useEffect, useRef, useState } from 'react'

// ** MUI Imports
import Grid from '@mui/material/Grid'
import { Typography } from '@mui/material'
import { TableContainer, Table, TableHead, TableBody, TableRow, TableCell, TablePagination } from '@mui/material'

import mapboxgl from 'mapbox-gl'
import prisma from '../../../prisma'

mapboxgl.accessToken = 'pk.eyJ1Ijoic2ViZnJvbWxoIiwiYSI6ImNsZ2hkNmNodzAwMmkzZXA2cTJlMHlzY2UifQ.-0tFUeRnCr8jISRMn_CRvw'

const Sensor = ({ sensor, sensorReadings }) => {
  const mapContainer = useRef()

  const [page, setPage] = useState(0)
  const [rowsPerPage, setRowsPerPage] = useState(10)

  const handleChangePage = (event, newPage) => {
    setPage(newPage)
  }

  const handleChangeRowsPerPage = event => {
    setRowsPerPage(+event.target.value)
    setPage(0)
  }

  useEffect(() => {
    const sensorCoordinates = [parseFloat(sensor.longitude), parseFloat(sensor.latitude)]

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
        <Typography variant='h5'>{sensor.type}</Typography>
        <Typography variant='body2'>{sensor.location}</Typography>
      </Grid>

      <Grid item xs={4}>
        <div ref={mapContainer} style={{ width: '100%', height: '300px' }} className='rounded-lg' />
      </Grid>
      <Grid item xs={8}>
        <TableContainer>
          <Table stickyHeader aria-label='sticky table'>
            <TableHead>
              <TableRow>
                <TableCell>ID</TableCell>
                <TableCell>Reading</TableCell>
                <TableCell>Date / Time</TableCell>
              </TableRow>
            </TableHead>

            <TableBody>
              {sensorReadings.map(sensorReading => (
                <TableRow hover role='checkbox' tabIndex={-1} key={sensorReading.id} className='cursor-pointer'>
                  <TableCell>{sensorReading.id}</TableCell>
                  <TableCell>{sensorReading.readingValues}</TableCell>
                  <TableCell>{sensorReading.readingTime}</TableCell>
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
