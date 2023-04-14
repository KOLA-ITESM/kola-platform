import { useRouter } from 'next/router'

// ** MUI Imports
import Card from '@mui/material/Card'
import Button from '@mui/material/Button'
import Typography from '@mui/material/Typography'
import CardContent from '@mui/material/CardContent'
import { styled, useTheme } from '@mui/material/styles'

// Styled component for the triangle shaped background image
const TriangleImg = styled('img')({
  right: 0,
  bottom: 0,
  height: 170,
  position: 'absolute'
})

const WelcomeCard = () => {
  // ** Hook
  const theme = useTheme()
  const imageSrc = theme.palette.mode === 'light' ? 'triangle-light.png' : 'triangle-dark.png'
  const router = useRouter()

  return (
    <Card sx={{ position: 'relative' }}>
      <CardContent>
        <Typography variant='h6'>Welcome to KOLA Dashboard!</Typography>
        <Typography variant='body2' sx={{ letterSpacing: '0.25px' }}>
          Where you can find an overview of KOLAs sensors and their data.
        </Typography>

        <Button size='small' variant='contained' sx={{ marginTop: '30px' }} onClick={() => router.push('/sensors')}>
          Go to Sensors
        </Button>
        <TriangleImg alt='triangle background' src={`/images/misc/${imageSrc}`} />
      </CardContent>
    </Card>
  )
}

export default WelcomeCard
