import {
  Box,
  Button,
  Card,
  CardContent,
  CardHeader,
  Divider,
  Grid,
  TextField,
  FormControl,
  Select,
  InputLabel,
  MenuItem
} from '@mui/material'

import mapboxgl from 'mapbox-gl'

import { useEffect, useRef, useState } from 'react'

import { ToastContainer } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'
import { toast } from 'react-toastify'

mapboxgl.accessToken = 'pk.eyJ1Ijoic2ViZnJvbWxoIiwiYSI6ImNsZ2hkNmNodzAwMmkzZXA2cTJlMHlzY2UifQ.-0tFUeRnCr8jISRMn_CRvw'

const AddSensors = () => {
  const mapContainer = useRef()
  const [map, setMap] = useState(null)
  const [marker, setMarker] = useState(null)
  const [latitude, setLatitude] = useState('')
  const [longitude, setLongitude] = useState('')
  const [sensors, setSensors] = useState('')
  const [location, setLocation] = useState('')
  const [sensorType, setSensorType] = useState('')

  useEffect(() => {
    const newMap = new mapboxgl.Map({
      container: mapContainer.current,
      style: 'mapbox://styles/mapbox/streets-v11',
      center: [0, 0],
      zoom: 10
    })

    setMap(newMap)

    return () => {
      newMap.remove()
    }
  }, [])

  useEffect(() => {
    if (map && marker) {
      marker.setLngLat([longitude, latitude]).addTo(map)
    }
  }, [map, marker, latitude, longitude])

  const handleLongitudeChange = e => {
    setLongitude(e.target.value)
  }
  
  const handleLatitudeChange = e => {
    setLatitude(e.target.value)
  }
  

  const handleSubmit = async e => {
    e.preventDefault()

    if (!sensors || !latitude || !longitude || !location || !sensorType) {
      toast.error('Please fill all the fields')
      return
    }

    const data = {
      type: sensorType,
      location: location,
      latitude: latitude,
      longitude: longitude
    }

    const response = await fetch('/api/sensor?csv=false', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(data)
    })

    if (response.ok) {
      const result = await response.json()
      toast.success('Sensor created successfully')
      console.log(result)
    } else {
      toast.error('Error creating sensor')
      console.log('Error')
    }
  }

  return (
    <Grid container spacing={3}>
      <Grid item xs={6}>
        <Card>
          <CardHeader title='Add Sensor' titleTypographyProps={{ variant: 'h6' }} />
          <CardContent>
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label='Sensor ID'
                  name='sensorType'
                  required
                  variant='outlined'
                  value={sensors}
                  onChange={e => setSensors(e.target.value)}
                />
              </Grid>
              <Divider />
              <Grid item xs={6}>
                <TextField
                  fullWidth
                  label='Latitude'
                  name='latitude'
                  required
                  variant='outlined'
                  value={latitude}
                  onChange={handleLatitudeChange}
                />
              </Grid>
              <Grid item xs={6}>
                <TextField
                  fullWidth
                  label='Longitude'
                  name='longitude'
                  required
                  variant='outlined'
                  value={longitude}
                  onChange={handleLongitudeChange}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label='Location Description'
                  name='location'
                  required
                  variant='outlined'
                  value={location}
                  onChange={e => setLocation(e.target.value)}
                  multiline
                  rows={2}
                />
              </Grid>
              <Grid item xs={12}>
                <FormControl fullWidth>
                  <InputLabel id='sensorType'>Sensor Type</InputLabel>
                  <Select
                    labelId='sensorType'
                    id='sensorType'
                    label='Sensor Type'
                    required
                    value={sensorType}
                    onChange={e => setSensorType(e.target.value)}
                  >
                    <MenuItem value='Number'>Value (int , float)</MenuItem>
                    <MenuItem value='Photo'>Photo</MenuItem>
                    <MenuItem value='Audio'>Audio</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
            </Grid>
          </CardContent>
          <Divider />
          <Box
            sx={{
              display: 'flex',
              justifyContent: 'flex-end',
              p: 2
            }}
          >
            <Button color='primary' variant='contained' onClick={handleSubmit}>
              Add Sensor
            </Button>
            <ToastContainer />
          </Box>
        </Card>
      </Grid>

      <Grid item xs={6}>
        <div ref={mapContainer} style={{ width: '100%', height: '350px' }} className='rounded-lg' />
      </Grid>
    </Grid>
  )
}

export default AddSensors
