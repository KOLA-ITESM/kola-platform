import {
  Box,
  Button,
  Card,
  CardContent,
  CardHeader,
  Divider,
  Grid,
  FormControl,
  Select,
  InputLabel,
  MenuItem,
  TableContainer,
  Table,
  TextField,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  TablePagination
} from '@mui/material'
import { SensorType } from '@prisma/client'
import { toast } from 'react-hot-toast'

import { useEffect, useState } from 'react'

const AddData = () => {
  const [fileCsv, setFileCsv] = useState(null)
  const [selectedSensor, setSelectedSensor] = useState('')
  const [sensors, setSensors] = useState([])
  const [readings, setReadings] = useState([])
  const [page, setPage] = useState(0)
  const [rowsPerPage, setRowsPerPage] = useState(10)

  const [loading, setLoading] = useState(false)

  const handleChangePage = (_, newPage) => {
    setPage(newPage)
  }

  const handleChangeRowsPerPage = event => {
    setRowsPerPage(+event.target.value)
    setPage(0)
  }

  useEffect(() => {
    async function fetchData() {
      const response = await fetch('/api/sensor?all=true', {
        method: 'GET'
      })

      if (response.ok) {
        const result = await response.json()
        const sensorIds = result.sensors
          .filter(sensor => sensor.type === SensorType.TEXT)
          .map(sensor => ({
            id: sensor.id,
            name: sensor.name
          }))
        setSensors(sensorIds)
      } else {
        console.log('Error')
      }
    }

    fetchData()
  }, [])

  const handleSensorSelection = async id => {
    const response = await fetch(`/api/readings?sensorId=${id}`)

    if (response.ok) {
      const result = await response.json()

      if (response.status !== 404) setReadings(result.readings)
      else setReadings([])
    } else {
      console.log('Error')
    }
  }

  const handleSubmit = async e => {
    e.preventDefault()
    setLoading(true)

    if (!fileCsv || !selectedSensor) {
      toast.error('Please fill all the fields')
      return
    }

    const createReadings = async () => {
      const response = await fetch(`/api/readings?csv=true&sensorId=${selectedSensor}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'text/csv'
        },
        body: fileCsv
      })

      if (!response.ok) throw new Error('Error creating readings')

      return await response.json()
    }

    toast.promise(createReadings(), {
      loading: 'Creating readings...',
      success: () => {
        cleanValues()
        handleSensorSelection(selectedSensor)
        setLoading(false)
        return 'Readings created successfully'
      },
      error: 'Error creating readings'
    })
  }

  const cleanValues = () => {
    setSelectedSensor('')
    setFileCsv(null)
  }

  const isSubmitDisabled = !fileCsv || !selectedSensor || loading

  return (
    <Grid container spacing={3}>
      <Grid item xs={6}>
        <Card>
          <CardHeader
            title='Add data'
            titleTypographyProps={{ variant: 'h6' }}
            subheader='Select the sensor you want to add data to'
          />

          <CardContent>
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <FormControl fullWidth variant='outlined'>
                  <InputLabel id='select-sensor-label'>Select Sensor</InputLabel>
                  <Select
                    labelId='select-sensor-label'
                    id='select-sensor'
                    label='Select Sensor'
                    required
                    value={selectedSensor}
                    onChange={e => {
                      setSelectedSensor(e.target.value), handleSensorSelection(e.target.value)
                    }}
                  >
                    {sensors.map(sensor => {
                      return <MenuItem value={sensor.id}>{sensor.name}</MenuItem>
                    })}
                  </Select>
                </FormControl>
              </Grid>

              <Grid item xs={12}>
                <TextField
                  fullWidth
                  name='upload-file'
                  size='small'
                  type='file'
                  variant='outlined'
                  required
                  onChange={e => setFileCsv(e.target.files[0])}
                />
              </Grid>
              <Divider />
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
        <Card>
          <CardHeader title='Data' titleTypographyProps={{ variant: 'h6' }} subheader='All data for the sensor' />
          <Divider />
          <CardContent>
            <TableContainer sx={{ maxHeight: 600 }}>
              <Table stickyHeader aria-label='sticky table'>
                <TableHead>
                  <TableRow>
                    <TableCell>ID</TableCell>
                    <TableCell>Time</TableCell>
                    <TableCell>Value</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {readings.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map(reading => (
                    <TableRow hover role='checkbox' tabIndex={-1} key={reading.id} className='cursor-pointer'>
                      <TableCell>{reading.readingId}</TableCell>
                      <TableCell>{new Date(reading.readingTime).toUTCString()}</TableCell>
                      <TableCell>{reading.readingValues}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
            <TablePagination
              rowsPerPageOptions={[10]}
              component='div'
              count={readings.length}
              rowsPerPage={rowsPerPage}
              page={page}
              onPageChange={handleChangePage}
              onRowsPerPageChange={handleChangeRowsPerPage}
            />
          </CardContent>
        </Card>
      </Grid>
    </Grid>
  )
}

export default AddData
