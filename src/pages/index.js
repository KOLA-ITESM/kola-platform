import { useEffect, useRef, useState } from 'react'
import mapboxgl from 'mapbox-gl'

// ** MUI Imports
import Grid from '@mui/material/Grid'

// ** Styled Component Import
import ApexChartWrapper from 'src/@core/styles/libs/react-apexcharts'

// ** Demo Components Imports
import WelcomeCard from 'src/views/dashboard/WelcomeCard'
import StatisticsCard from 'src/views/dashboard/StatisticsCard'

import prisma from '../../prisma'
import { parseCoordinate } from 'src/@core/utils/parse-coordinates'

mapboxgl.accessToken = 'pk.eyJ1Ijoic2ViZnJvbWxoIiwiYSI6ImNsZ2hkNmNodzAwMmkzZXA2cTJlMHlzY2UifQ.-0tFUeRnCr8jISRMn_CRvw'

const Dashboard = ({ sensors }) => {
  const mapContainer = useRef()

  useEffect(() => {
    // generate a list of all sensor coordinates and store in array
    const sensorCoordinates = sensors.map(sensor => [parseCoordinate(sensor.longitude), parseCoordinate(sensor.latitude)])

    const map = new mapboxgl.Map({
      container: mapContainer.current,
      style: 'mapbox://styles/mapbox/streets-v11',
      center: sensorCoordinates[0],
      zoom: 10
    })

    // add a marker for each sensor
    sensorCoordinates.forEach(sensorCoordinate => {
      new mapboxgl.Marker().setLngLat(sensorCoordinate).addTo(map)
    })

    return () => {
      map.remove()
    }
  }, [])

  return (
    <ApexChartWrapper>
      <Grid container spacing={6}>
        <Grid item xs={12} md={4}>
          <WelcomeCard />
        </Grid>
        <Grid item xs={12} md={8}>
          <StatisticsCard sensors={sensors} />
        </Grid>

        <Grid item xs={12}>
          <div ref={mapContainer} style={{ width: '100%', height: '500px' }} className='rounded-lg' />
        </Grid>
      </Grid>
    </ApexChartWrapper>
  )
}

export const getServerSideProps = async () => {
  const sensors = await prisma.sensor.findMany({})

  return {
    props: {
      sensors
    }
  }
}

export default Dashboard
