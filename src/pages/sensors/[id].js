import { useEffect, useRef } from 'react'

// ** MUI Imports
import Grid from '@mui/material/Grid'
import { Typography } from '@mui/material'

import mapboxgl from 'mapbox-gl'
import prisma from '../../../prisma'

mapboxgl.accessToken = 'pk.eyJ1Ijoic2ViZnJvbWxoIiwiYSI6ImNsZ2hkNmNodzAwMmkzZXA2cTJlMHlzY2UifQ.-0tFUeRnCr8jISRMn_CRvw'

const Sensor = ({ sensor }) => {
  const mapContainer = useRef()

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
        <div ref={mapContainer} style={{ width: '100%', height: '300px' }} className='rounded-lg'></div>
      </Grid>
      <Grid item xs={8}>
        <Typography variant='h6'>Sensor Data</Typography>
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

  return {
    props: {
      sensor
    }
  }
}

export default Sensor
