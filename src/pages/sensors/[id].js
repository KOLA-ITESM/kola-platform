import { useRouter } from 'next/router'

// ** MUI Imports
import Card from '@mui/material/Card'
import Grid from '@mui/material/Grid'
import CardHeader from '@mui/material/CardHeader'

import prisma from '../../../prisma'

const Sensor = ({ sensor }) => {
  return (
    <Grid container spacing={6}>
      <Grid item xs={12}>
        <Card>
          <CardHeader title={sensor.type} titleTypographyProps={{ variant: 'h6' }} />
        </Card>
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
