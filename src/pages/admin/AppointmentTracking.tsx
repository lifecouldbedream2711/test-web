import React, { useEffect, useState } from 'react';
import {
  Box,
  Paper,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  Button,
  CircularProgress,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Grid,
  Card,
  CardContent,
  Chip,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { vi } from 'date-fns/locale';
import { format } from 'date-fns';
import { Visibility, FileDownload } from '@mui/icons-material';
import { toast } from 'react-toastify';
import { appointmentService } from '../../services/appointmentService';
import { adminService } from '../../services/adminService';
import type { Appointment, AppointmentStatus, Doctor, Patient, Service } from '../../types';

interface AppointmentWithDetails extends Appointment {
  patientName?: string;
  doctorName?: string;
  serviceName?: string;
}

const AppointmentTracking: React.FC = () => {
  const [appointments, setAppointments] = useState<AppointmentWithDetails[]>([]);
  const [filteredAppointments, setFilteredAppointments] = useState<AppointmentWithDetails[]>([]);
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterDate, setFilterDate] = useState<Date | null>(null);
  const [filterStatus, setFilterStatus] = useState<AppointmentStatus | ''>('');
  const [filterDoctor, setFilterDoctor] = useState<string>('');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [selectedAppointment, setSelectedAppointment] = useState<AppointmentWithDetails | null>(null);
  const [openDetailDialog, setOpenDetailDialog] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    filterAppointments();
  }, [appointments, filterDate, filterStatus, filterDoctor]);

  const loadData = async () => {
    try {
      setLoading(true);
      const [appointmentsData, doctorsData, patients, services] = await Promise.all([
        appointmentService.getAll(),
        adminService.getAllDoctors(),
        adminService.getAllPatients(),
        adminService.getAllServices(),
      ]);

      const enrichedAppointments = appointmentsData.map((apt) => {
        const doctor = doctorsData.find((d: Doctor) => d.id === apt.doctorId);
        const patient = patients.find((p: Patient) => p.id === apt.patientId);
        const service = services.find((s: Service) => s.id === apt.serviceId);

        return {
          ...apt,
          doctorName: doctor?.name,
          patientName: patient?.name,
          serviceName: service?.name,
        };
      });

      setAppointments(enrichedAppointments);
      setDoctors(doctorsData);
    } catch (error) {
      toast.error('Không thể tải dữ liệu');
    } finally {
      setLoading(false);
    }
  };

  const filterAppointments = () => {
    let filtered = [...appointments];

    if (filterDate) {
      const dateStr = format(filterDate, 'yyyy-MM-dd');
      filtered = filtered.filter((apt) => apt.date === dateStr);
    }

    if (filterStatus) {
      filtered = filtered.filter((apt) => apt.status === filterStatus);
    }

    if (filterDoctor) {
      filtered = filtered.filter((apt) => apt.doctorId === filterDoctor);
    }

    setFilteredAppointments(filtered);
    setPage(0);
  };

  const getStatusStats = () => {
    const stats = {
      PENDING: 0,
      APPROVED: 0,
      CHECKED_IN: 0,
      DONE: 0,
      CANCELLED: 0,
      REJECTED: 0,
    };

    filteredAppointments.forEach((apt) => {
      if (stats.hasOwnProperty(apt.status)) {
        stats[apt.status as keyof typeof stats]++;
      }
    });

    return stats;
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, 'default' | 'warning' | 'success' | 'info' | 'error'> = {
      PENDING: 'warning',
      APPROVED: 'info',
      CHECKED_IN: 'success',
      DONE: 'success',
      CANCELLED: 'error',
      REJECTED: 'error',
    };
    return colors[status] || 'default';
  };

  const getStatusText = (status: string) => {
    const texts: Record<string, string> = {
      PENDING: 'Chờ duyệt',
      APPROVED: 'Đã duyệt',
      CHECKED_IN: 'Đã check-in',
      DONE: 'Hoàn thành',
      CANCELLED: 'Đã hủy',
      REJECTED: 'Từ chối',
    };
    return texts[status] || status;
  };

  const handleViewDetails = (appointment: AppointmentWithDetails) => {
    setSelectedAppointment(appointment);
    setOpenDetailDialog(true);
  };

  const handleCloseDetailDialog = () => {
    setOpenDetailDialog(false);
    setSelectedAppointment(null);
  };

  const handleExportReport = () => {
    toast.info('Chức năng đang phát triển');
  };

  const stats = getStatusStats();

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={vi}>
      <Box>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
          <Typography variant="h4" fontWeight="bold">
            Theo dõi lịch hẹn
          </Typography>
          <Button
            variant="outlined"
            startIcon={<FileDownload />}
            onClick={handleExportReport}
          >
            Xuất báo cáo
          </Button>
        </Box>

        <Grid container spacing={2} mb={3}>
          {[
            { label: 'Chờ duyệt', value: stats.PENDING, color: '#ed6c02' },
            { label: 'Đã duyệt', value: stats.APPROVED, color: '#0288d1' },
            { label: 'Đã check-in', value: stats.CHECKED_IN, color: '#2e7d32' },
            { label: 'Hoàn thành', value: stats.DONE, color: '#388e3c' },
            { label: 'Đã hủy', value: stats.CANCELLED, color: '#d32f2f' },
            { label: 'Từ chối', value: stats.REJECTED, color: '#c62828' },
          ].map((stat, index) => (
            <Grid size={{ xs: 6, sm: 4, md: 2 }} key={index}>
              <Card elevation={0} sx={{ border: '1px solid #e0e0e0' }}>
                <CardContent>
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    {stat.label}
                  </Typography>
                  <Typography variant="h4" fontWeight="bold" color={stat.color}>
                    {stat.value}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>

        <Paper sx={{ borderRadius: 2, p: 3, mb: 3 }}>
          <Typography variant="h6" mb={2}>
            Bộ lọc
          </Typography>
          <Grid container spacing={2}>
            <Grid size={{ xs: 12, md: 4 }}>
              <DatePicker
                label="Ngày"
                value={filterDate}
                onChange={(date) => setFilterDate(date)}
                slotProps={{ textField: { fullWidth: true } }}
              />
            </Grid>
            <Grid size={{ xs: 12, md: 4 }}>
              <FormControl fullWidth>
                <InputLabel>Trạng thái</InputLabel>
                <Select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value as AppointmentStatus | '')}
                  label="Trạng thái"
                >
                  <MenuItem value="">Tất cả</MenuItem>
                  <MenuItem value="PENDING">Chờ duyệt</MenuItem>
                  <MenuItem value="APPROVED">Đã duyệt</MenuItem>
                  <MenuItem value="CHECKED_IN">Đã check-in</MenuItem>
                  <MenuItem value="DONE">Hoàn thành</MenuItem>
                  <MenuItem value="CANCELLED">Đã hủy</MenuItem>
                  <MenuItem value="REJECTED">Từ chối</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid size={{ xs: 12, md: 4 }}>
              <FormControl fullWidth>
                <InputLabel>Bác sĩ</InputLabel>
                <Select
                  value={filterDoctor}
                  onChange={(e) => setFilterDoctor(e.target.value)}
                  label="Bác sĩ"
                >
                  <MenuItem value="">Tất cả</MenuItem>
                  {doctors.map((doctor) => (
                    <MenuItem key={doctor.id} value={doctor.id}>
                      {doctor.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
          </Grid>
        </Paper>

        <Paper sx={{ borderRadius: 2, p: 3 }}>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Mã</TableCell>
                  <TableCell>Bệnh nhân</TableCell>
                  <TableCell>Bác sĩ</TableCell>
                  <TableCell>Dịch vụ</TableCell>
                  <TableCell>Ngày giờ</TableCell>
                  <TableCell>Trạng thái</TableCell>
                  <TableCell align="right">Thao tác</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredAppointments
                  .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                  .map((appointment) => (
                    <TableRow key={appointment.id} hover>
                      <TableCell>
                        <Typography variant="body2" fontWeight={500}>
                          {appointment.id}
                        </Typography>
                      </TableCell>
                      <TableCell>{appointment.patientName || appointment.patientId}</TableCell>
                      <TableCell>{appointment.doctorName || appointment.doctorId}</TableCell>
                      <TableCell>
                        <Chip
                          label={appointment.serviceName || appointment.serviceId}
                          size="small"
                          variant="outlined"
                        />
                      </TableCell>
                      <TableCell>
                        {format(new Date(appointment.date), 'dd/MM/yyyy', { locale: vi })}
                        <br />
                        <Typography variant="caption" color="text.secondary">
                          {appointment.time}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={getStatusText(appointment.status)}
                          color={getStatusColor(appointment.status)}
                          size="small"
                        />
                      </TableCell>
                      <TableCell align="right">
                        <IconButton
                          size="small"
                          color="primary"
                          onClick={() => handleViewDetails(appointment)}
                        >
                          <Visibility />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))}
              </TableBody>
            </Table>
          </TableContainer>

          <TablePagination
            component="div"
            count={filteredAppointments.length}
            page={page}
            onPageChange={(_e, newPage) => setPage(newPage)}
            rowsPerPage={rowsPerPage}
            onRowsPerPageChange={(e) => {
              setRowsPerPage(parseInt(e.target.value, 10));
              setPage(0);
            }}
            labelRowsPerPage="Số dòng mỗi trang:"
            labelDisplayedRows={({ from, to, count }) => `${from}-${to} của ${count}`}
          />
        </Paper>

        <Dialog open={openDetailDialog} onClose={handleCloseDetailDialog} maxWidth="sm" fullWidth>
          <DialogTitle>Chi tiết lịch hẹn</DialogTitle>
          <DialogContent>
            {selectedAppointment && (
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
                <Box>
                  <Typography variant="caption" color="text.secondary">
                    Mã lịch hẹn
                  </Typography>
                  <Typography variant="body1" fontWeight={500}>
                    {selectedAppointment.id}
                  </Typography>
                </Box>
                <Box>
                  <Typography variant="caption" color="text.secondary">
                    Bệnh nhân
                  </Typography>
                  <Typography variant="body1" fontWeight={500}>
                    {selectedAppointment.patientName}
                  </Typography>
                </Box>
                <Box>
                  <Typography variant="caption" color="text.secondary">
                    Bác sĩ
                  </Typography>
                  <Typography variant="body1" fontWeight={500}>
                    {selectedAppointment.doctorName}
                  </Typography>
                </Box>
                <Box>
                  <Typography variant="caption" color="text.secondary">
                    Dịch vụ
                  </Typography>
                  <Typography variant="body1" fontWeight={500}>
                    {selectedAppointment.serviceName}
                  </Typography>
                </Box>
                <Box>
                  <Typography variant="caption" color="text.secondary">
                    Ngày giờ
                  </Typography>
                  <Typography variant="body1" fontWeight={500}>
                    {format(new Date(selectedAppointment.date), 'dd/MM/yyyy', { locale: vi })} -{' '}
                    {selectedAppointment.time}
                  </Typography>
                </Box>
                <Box>
                  <Typography variant="caption" color="text.secondary">
                    Lý do khám
                  </Typography>
                  <Typography variant="body1">{selectedAppointment.reason}</Typography>
                </Box>
                {selectedAppointment.notes && (
                  <Box>
                    <Typography variant="caption" color="text.secondary">
                      Ghi chú
                    </Typography>
                    <Typography variant="body1">{selectedAppointment.notes}</Typography>
                  </Box>
                )}
                {selectedAppointment.rejectionReason && (
                  <Box>
                    <Typography variant="caption" color="text.secondary">
                      Lý do từ chối
                    </Typography>
                    <Typography variant="body1" color="error">
                      {selectedAppointment.rejectionReason}
                    </Typography>
                  </Box>
                )}
                <Box>
                  <Typography variant="caption" color="text.secondary">
                    Trạng thái
                  </Typography>
                  <Box mt={0.5}>
                    <Chip
                      label={getStatusText(selectedAppointment.status)}
                      color={getStatusColor(selectedAppointment.status)}
                      size="small"
                    />
                  </Box>
                </Box>
              </Box>
            )}
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseDetailDialog}>Đóng</Button>
          </DialogActions>
        </Dialog>
      </Box>
    </LocalizationProvider>
  );
};

export default AppointmentTracking;
