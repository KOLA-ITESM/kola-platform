import { useEffect, useState } from 'react'
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
  MenuItem, 
  TableContainer, 
  Table,
  TableHead,
    TableRow,
    TableCell,
    TableBody

} from '@mui/material'

const AddData = () => {
  const [sensors, setSensors] = useState([])

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
                  <Select labelId='select-sensor-label' id='select-sensor' label='Select Sensor'></Select>
                </FormControl>
              </Grid>
              <Grid item xs={12}>
                
                
                <TextField
                  fullWidth
                  
                  name='upload-file'
                  size='small'
                  type='file'
                  variant='outlined'
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
            <Button color='primary' variant='contained'>
              Add Data
            </Button>
          </Box>
        </Card>
      </Grid>
        <Grid item xs={6}>
            <Card>
                <CardHeader
                    title='Data'
                    titleTypographyProps={{ variant: 'h6' }}
                    subheader='All data for the sensor'
                />
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
                                
                            </TableBody>
                        </Table>
                    </TableContainer>
                </CardContent>
            </Card>
        </Grid>
    </Grid>
  )
}

export default AddData
