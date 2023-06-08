import Link from 'next/link'

// ** MUI Imports
import Card from '@mui/material/Card'
import Grid from '@mui/material/Grid'
import CardHeader from '@mui/material/CardHeader'

import {
  TableContainer,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  TablePagination,
  FormControl,
  InputLabel,
  Select
} from '@mui/material'

import prisma from '../../../prisma'
import { useState } from 'react'

const getEmojiFromType = type => {
  switch (type) {
    case 'AUDIO':
      return '🔊'
    case 'IMAGE':
      return '📷'
    default:
      return '📝'
  }
}

const Sensors = ({ sensors }) => {
  const [page, setPage] = useState(0)
  const [rowsPerPage, setRowsPerPage] = useState(10)
  const [filterType, setFilterType] = useState('all')

  const handleChangePage = (_, newPage) => {
    setPage(newPage)
  }

  const handleChangeRowsPerPage = event => {
    setRowsPerPage(+event.target.value)
    setPage(0)
  }

  const handleFilterChange = event => {
    setFilterType(event.target.value)
  }

  const filteredSensors = sensors.filter(sensor => filterType === 'all' || sensor.type === filterType)

  return (
    <Grid container spacing={6}>
      <Grid item xs={12}>
        <Card>
          <CardHeader title='Sensors' titleTypographyProps={{ variant: 'h6' }} />

          <div className='px-3 pb-5'>
            <FormControl>
              <InputLabel htmlFor='filter-type'>Type</InputLabel>
              <Select
                native
                value={filterType}
                onChange={handleFilterChange}
                inputProps={{
                  name: 'type',
                  id: 'filter-type'
                }}
                style={{
                  marginTop: 15
                }}
              >
                <option value='all'>All</option>
                <option value='TEXT'>Text</option>
                <option value='IMAGE'>Image</option>
                <option value='AUDIO'>Audio</option>
              </Select>
            </FormControl>
          </div>

          <TableContainer sx={{ maxHeight: 600 }}>
            <Table stickyHeader aria-label='sticky table'>
              <TableHead>
                <TableRow>
                  <TableCell>ID</TableCell>
                  <TableCell>Name</TableCell>
                  <TableCell>Type</TableCell>
                  <TableCell>Location</TableCell>
                  <TableCell>Latitude</TableCell>
                  <TableCell>Longitude</TableCell>
                  <TableCell>Status</TableCell>
                </TableRow>
              </TableHead>

              <TableBody>
                {filteredSensors.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map(sensor => (
                  <Link key={sensor.id} href={`/sensors/${sensor.id}`}>
                    <TableRow hover role='checkbox' tabIndex={-1} key={sensor.id} className='cursor-pointer'>
                      <TableCell>{sensor.id}</TableCell>
                      <TableCell>{sensor.name}</TableCell>
                      <TableCell>{getEmojiFromType(sensor.type)}</TableCell>
                      <TableCell>{sensor.location}</TableCell>
                      <TableCell>{sensor.latitude}</TableCell>
                      <TableCell>{sensor.longitude}</TableCell>
                      <TableCell>
                        {sensor.status === 'active' ? (
                          <div className='flex items-center justify-center space-x-2'>
                            <div className='w-2 h-2 rounded-full bg-emerald-500 inline-block' />
                            <p className='text-emerald-500'>Active</p>
                          </div>
                        ) : (
                          <div className='flex items-center justify-center space-x-2'>
                            <div className='w-2 h-2 rounded-full bg-red-500 inline-block' />
                            <p className='text-red-500'>Inactive</p>
                          </div>
                        )}
                      </TableCell>
                    </TableRow>
                  </Link>
                ))}
              </TableBody>
            </Table>
          </TableContainer>

          <TablePagination
            rowsPerPageOptions={[10]}
            component='div'
            count={sensors.length}
            rowsPerPage={rowsPerPage}
            page={page}
            onPageChange={handleChangePage}
            onRowsPerPageChange={handleChangeRowsPerPage}
          />
        </Card>
      </Grid>
    </Grid>
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

export default Sensors
