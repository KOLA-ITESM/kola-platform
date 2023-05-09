import { useEffect, useRef, useState } from 'react'
import { Line } from 'react-chartjs-2';

// ** MUI Imports
import Grid from '@mui/material/Grid'
import { Typography } from '@mui/material'
import { TableContainer, Table, TableHead, TableBody, TableRow, TableCell, TablePagination } from '@mui/material'


import mapboxgl from 'mapbox-gl'
import prisma from '../../../prisma'
import { parseCoordinate } from 'src/@core/utils/parse-coordinates'

mapboxgl.accessToken = 'pk.eyJ1Ijoic2ViZnJvbWxoIiwiYSI6ImNsZ2hkNmNodzAwMmkzZXA2cTJlMHlzY2UifQ.-0tFUeRnCr8jISRMn_CRvw'

function formatReadingTime(readingTime) {
  const date = new Date(readingTime);

  // Format the time
  const hoursUTC = date.getUTCHours();
  const hours12 = (hoursUTC % 12) || 12;
  const minutes = date.getUTCMinutes().toString().padStart(2, '0');
  const amPm = hoursUTC < 12 ? 'AM' : 'PM';
  const time = `${hours12}:${minutes} ${amPm}`;

  // Format the date
  const month = (date.getUTCMonth() + 1).toString().padStart(2, '0');
  const day = date.getUTCDate().toString().padStart(2, '0');
  const year = date.getUTCFullYear();
  const formattedDate = `${month}/${day}/${year}`;

  return `${time}, ${formattedDate}`;
}


const transformSensorReadings = (sensorReadings) => {
  const labels = [];
  const data = [];

  sensorReadings.forEach((reading) => {
    labels.push(formatReadingTime(reading.readingTime));
    data.push(parseFloat(reading.readingValues));
  });

  return {
    labels,
    datasets: [
      {
        fill: true,
        label: "Sensor Readings",
        data,
        backgroundColor: "rgba(75, 192, 192, 0.2)",
        borderColor: "rgba(75, 192, 192, 1)",
        borderWidth: 1,
      },
    ],
  };
};

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

  console.log(sensorReadings)

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
        <TableContainer style={{ backgroundColor: "white", borderRadius: "5px" }}>
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

      <Grid item xs={12} style={{
        backgroundColor: "white",
        padding: "1rem",
        borderRadius: "10px",
      }}>
        {sensorReadings && <Line options={{
          responsive: true,
          plugins: {
            legend: {
              position: 'top',
            },
            title: {
              display: true,
              text: 'Chart.js Line Chart',
            },
          },
        }} data={transformSensorReadings(sensorReadings)} />}
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
