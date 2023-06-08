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
import { toast } from 'react-hot-toast'

import mapboxgl from 'mapbox-gl'

import { useEffect, useRef, useState } from 'react'

mapboxgl.accessToken = 'pk.eyJ1Ijoic2ViZnJvbWxoIiwiYSI6ImNsZ2hkNmNodzAwMmkzZXA2cTJlMHlzY2UifQ.-0tFUeRnCr8jISRMn_CRvw'

const isValidCoordinates = (lat, lng) => {
  const latNum = parseFloat(lat)
  const lngNum = parseFloat(lng)

  if (isNaN(latNum) || isNaN(lngNum)) {
    return false
  }

  return latNum <= 90 && latNum >= -90 && lngNum <= 180 && lngNum >= -180
}

const AddSensors = () => {
  const mapContainer = useRef()
  const [map, setMap] = useState(null)
  const [marker, setMarker] = useState(null)

  const [sensorName, setSensorName] = useState('')
  const [latitude, setLatitude] = useState('')
  const [longitude, setLongitude] = useState('')
  const [sensors, setSensors] = useState('')
  const [location, setLocation] = useState('')
  const [sensorType, setSensorType] = useState('')

  const [loading, setLoading] = useState(false)

  useEffect(() => {
    const newMap = new mapboxgl.Map({
      container: mapContainer.current,
      style: 'mapbox://styles/mapbox/streets-v11',
      center: [0, 0],
      zoom: 10
    })

    const newMarker = new mapboxgl.Marker()
    setMarker(newMarker)
    setMap(newMap)

    return () => {
      newMap.remove()
    }
  }, [])

  useEffect(() => {
    if (map && latitude && longitude && isValidCoordinates(latitude, longitude)) {
      marker.setLngLat([longitude, latitude]).addTo(map)

      // center map on marker
      map.flyTo({
        center: [longitude, latitude],
        zoom: 15
      })
    }
  }, [marker, latitude, longitude])

  const handleLongitudeChange = e => {
    setLongitude(e.target.value)
  }

  const handleLatitudeChange = e => {
    setLatitude(e.target.value)
  }

  const handleSubmit = e => {
    e.preventDefault()
    setLoading(true)

    if (!sensors || !sensorName || !latitude || !longitude || !location || !sensorType) {
      toast.error('Please fill all the fields')
      return
    }

    if (!isValidCoordinates(latitude, longitude)) {
      toast.error('Invalid range for coordinates')
      return
    }

    const data = {
      name: sensorName,
      type: sensorType,
      location: location,
      latitude: latitude,
      longitude: longitude
    }

    const createSensor = async () => {
      const response = await fetch('/api/sensor?csv=false', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
      })

      if (!response.ok) {
        throw new Error('Error creating sensor, please try again')
      }

      return await response.json()
    }

    toast.promise(createSensor(), {
      loading: 'Creating sensor...',
      success: () => {
        setSensorName('')
        setLatitude('')
        setLongitude('')
        setSensors('')
        setLocation('')
        setSensorType('')
        setLoading(false)
        return 'Sensor created successfully'
      },
      error: 'Error creating sensor, please try again'
    })
  }

  const isSubmitDisabled = !sensors || !sensorName || !latitude || !longitude || !location || !sensorType || loading

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
                  variant='outlined'
                  value={sensors}
                  onChange={e => setSensors(e.target.value)}
                  required
                />
              </Grid>
              <Divider />
              <Grid item xs={6}>
                <TextField
                  fullWidth
                  label='Latitude'
                  name='latitude'
                  type='number'
                  variant='outlined'
                  value={latitude}
                  onChange={handleLatitudeChange}
                  required
                />
              </Grid>
              <Grid item xs={6}>
                <TextField
                  fullWidth
                  label='Longitude'
                  name='longitude'
                  type='number'
                  variant='outlined'
                  value={longitude}
                  onChange={handleLongitudeChange}
                  required
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label='Sensor name'
                  name='name'
                  required
                  variant='outlined'
                  value={sensorName}
                  onChange={e => setSensorName(e.target.value)}
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
                    <MenuItem value='TEXT'>Value (int , float)</MenuItem>
                    <MenuItem value='IMAGE'>Photo</MenuItem>
                    <MenuItem value='AUDIO'>Audio</MenuItem>
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
            <Button color='primary' variant='contained' onClick={handleSubmit} disabled={isSubmitDisabled}>
              Add Data
            </Button>
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
