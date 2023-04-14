// ** MUI Imports
import Card from '@mui/material/Card'
import Grid from '@mui/material/Grid'
import CardHeader from '@mui/material/CardHeader'
import { TableContainer, Table, TableHead, TableBody, TableRow, TableCell, TablePagination } from '@mui/material'

import prisma from '../../../prisma'
import { useState } from 'react'

const Sensors = ({ sensors }) => {
  const [page, setPage] = useState(0)
  const [rowsPerPage, setRowsPerPage] = useState(10)

  const handleChangePage = (event, newPage) => {
    setPage(newPage)
  }

  const handleChangeRowsPerPage = event => {
    setRowsPerPage(+event.target.value)
    setPage(0)
  }

  return (
    <Grid container spacing={6}>
      <Grid item xs={12}>
        <Card>
          <CardHeader title='Sensors' titleTypographyProps={{ variant: 'h6' }} />

          <TableContainer sx={{ maxHeight: 600 }}>
            <Table stickyHeader aria-label='sticky table'>
              <TableHead>
                <TableRow>
                  <TableCell>ID</TableCell>
                  <TableCell>Type</TableCell>
                  <TableCell>Location</TableCell>
                  <TableCell>Status</TableCell>
                </TableRow>
              </TableHead>

              <TableBody>
                {sensors.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map(sensor => (
                  <TableRow hover role='checkbox' tabIndex={-1} key={sensor.id}>
                    <TableCell>{sensor.id}</TableCell>
                    <TableCell>{sensor.type}</TableCell>
                    <TableCell>{sensor.location}</TableCell>
                    <TableCell>
                      {sensor.status === 'active' ? (
                        <div className='flex items-center justify-center space-x-2'>
                          <div className='w-2 h-2 rounded-full bg-emerald-500 inline-block' />
                          <p className='text-emerald-500'>Active</p>
                        </div>
                      ) : (
                        <span className='chip chip-danger'>Inactive</span>
                      )}
                    </TableCell>
                  </TableRow>
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
