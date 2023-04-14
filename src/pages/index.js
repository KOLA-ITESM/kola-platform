// ** MUI Imports
import Grid from '@mui/material/Grid'

// ** Icons Imports
import Poll from 'mdi-material-ui/Poll'
import CurrencyUsd from 'mdi-material-ui/CurrencyUsd'
import HelpCircleOutline from 'mdi-material-ui/HelpCircleOutline'
import BriefcaseVariantOutline from 'mdi-material-ui/BriefcaseVariantOutline'

// ** Custom Components Imports
import CardStatisticsVerticalComponent from 'src/@core/components/card-statistics/card-stats-vertical'

// ** Styled Component Import
import ApexChartWrapper from 'src/@core/styles/libs/react-apexcharts'

// ** Demo Components Imports
import WelcomeCard from 'src/views/dashboard/WelcomeCard'
import StatisticsCard from 'src/views/dashboard/StatisticsCard'

import prisma from '../../prisma'

const Dashboard = ({ sensors }) => {
  return (
    <ApexChartWrapper>
      <Grid container spacing={6}>
        <Grid item xs={12} md={4}>
          <WelcomeCard />
        </Grid>
        <Grid item xs={12} md={8}>
          <StatisticsCard sensors={sensors} />
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
