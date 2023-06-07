import {
  Box,
  Button,
  Typography,
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

import { useEffect, useState } from 'react'

import { ToastContainer, toast } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'

import { DropzoneArea } from 'material-ui-dropzone'

import AWS from 'aws-sdk'

const AddMultimedia = () => {
  const [selectedSensor, setSelectedSensor] = useState('')
  const [sensors, setSensors] = useState([])
  const [readings, setReadings] = useState([])
  const [page, setPage] = useState(0)
  const [rowsPerPage, setRowsPerPage] = useState(10)
  const [files, setFiles] = useState([])

  const [fileReadingDates, setFileReadingDates] = useState({})

  const S3_BUCKET = process.env.NEXT_PUBLIC_S3_BUCKET
  const REGION = process.env.NEXT_PUBLIC_REGION
  const ACCESS_KEY = process.env.NEXT_PUBLIC_ACCESS_KEY
  const SECRET_ACCESS_KEY = process.env.NEXT_PUBLIC_SECRET_ACCESS_KEY

  const s3 = new AWS.S3({
    accessKeyId: ACCESS_KEY,
    secretAccessKey: SECRET_ACCESS_KEY,
    region: REGION,
    params: { Bucket: S3_BUCKET }
  })

  console.log({ s3 })

  const handleChangePage = (event, newPage) => {
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
        const sensorIds = result.sensors.map(sensor => ({
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

  const handleSensorSelection = async e => {
    e.preventDefault

    const response = await fetch(`/api/readings?sensorId=${e}`)

    if (response.ok) {
      const result = await response.json()

      // todo: cambiar a 200
      if (response.status !== 404) setReadings(result.readings)
      else setReadings([])
    } else {
      console.log('Error')
    }
  }

  const handleSubmit = async e => {
    e.preventDefault()

    const promises = []
    try {
      files.forEach(file => {
        const params = {
          Bucket: S3_BUCKET,
          Key: file.name,
          Body: file
        }
        promises.push(s3.upload(params).promise())
      })

      const results = await Promise.all(promises)

      // upload each image in resultUrls array to database through api
      for (let result of results) {
        const response = await fetch(`/api/readings?mediaUrl=true&sensorId=${selectedSensor}`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            mediaUrl: result.Location,
            readingDate: fileReadingDates[result.Key]
          })
        })

        if (!response.ok) throw new Error('Error uploading media files, please try again')
      }

      cleanValues()
      toast.success('Media files uploaded successfully!')
    } catch (error) {
      toast.error('Error uploading media files, please try again')
      console.log(error)
    }
  }

  const cleanValues = () => {
    setSelectedSensor('')
    setFiles([])
    setFileReadingDates({})
  }

  return (
    <Grid container spacing={3}>
      <Grid item xs={6}>
        <Card>
          <CardHeader
            title='Add multimedia'
            titleTypographyProps={{ variant: 'h6' }}
            subheader='Select the sensor you want to add multimedia to'
          />

          <CardContent>
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <FormControl fullWidth variant='outlined'>
                  <InputLabel id='select-sensor-label'>Select sensor</InputLabel>
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
                      return (
                        <MenuItem key={sensor.id} value={sensor.id}>
                          {sensor.name}
                        </MenuItem>
                      )
                    })}
                  </Select>
                </FormControl>
              </Grid>

              <Grid item xs={12}>
                <DropzoneArea
                  acceptedFiles={['image/*', 'audio/*']}
                  dropzoneText='Drag and drop an image or audio file here or click'
                  onChange={files => setFiles(files)}
                  filesLimit={10}
                  maxFileSize={5000000}
                  showPreviews={true}
                  showPreviewsInDropzone={false}
                  clearOnUnmount={true}
                />
              </Grid>

              <Divider />

              {files.length > 0 && (
                <Grid item xs={12}>
                  <Typography variant='h6' gutterBottom>
                    Specify date data for each file
                  </Typography>

                  {files.map(file => (
                    <div key={file.name} className='space-y-2 mb-2'>
                      <p>File: {file.name}</p>
                      <TextField
                        id='outlined-basic'
                        variant='outlined'
                        type='datetime-local'
                        onChange={e => {
                          setFileReadingDates(prevState => ({ ...prevState, [file.name]: e.target.value }))
                        }}
                      />
                    </div>
                  ))}
                </Grid>
              )}
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
              Upload data
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
                      <TableCell>{reading.readingTime}</TableCell>
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
          <ToastContainer />
        </Card>
      </Grid>
    </Grid>
  )
}

export default AddMultimedia
