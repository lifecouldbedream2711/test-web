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
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  CircularProgress,
  TextField,
  Chip,
} from '@mui/material';
import { CheckCircle, Cancel } from '@mui/icons-material';
import { format } from 'date-fns';
import { vi } from 'date-fns/locale';
import { toast } from 'react-toastify';
import { appointmentService } from '../../services/appointmentService';
import { adminService } from '../../services/adminService';
import type { Appointment, Doctor, Patient, Service } from '../../types';

interface AppointmentWithDetails extends Appointment {
  patientName?: string;
  doctorName?: string;
  serviceName?: string;
}

const PendingApproval: React.FC = () => {
  const [appointments, setAppointments] = useState<AppointmentWithDetails[]>([]);
  const [loading, setLoading] = useState(true);
  const [openRejectDialog, setOpenRejectDialog] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);
  const [rejectionReason, setRejectionReason] = useState('');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  useEffect(() => {
    loadPendingAppointments();
  }, []);

  const loadPendingAppointments = async () => {
    try {
      setLoading(true);
      const [appointmentsData, doctors, patients, services] = await Promise.all([
        appointmentService.getAll({ status: 'PENDING' }),
        adminService.getAllDoctors(),
        adminService.getAllPatients(),
        adminService.getAllServices(),
      ]);

      const enrichedAppointments = appointmentsData.map((apt) => {
        const doctor = doctors.find((d: Doctor) => d.id === apt.doctorId);
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
    } catch (error) {
      toast.error('Không thể tải danh sách lịch hẹn');
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (appointmentId: string) => {
    if (!window.confirm('Bạn có chắc muốn duyệt lịch hẹn này?')) return;

    try {
      await appointmentService.updateStatus(appointmentId, 'APPROVED');
      toast.success('Đã duyệt lịch hẹn');
      loadPendingAppointments();
    } catch (error) {
      toast.error('Không thể duyệt lịch hẹn');
    }
  };

  const handleOpenRejectDialog = (appointment: Appointment) => {
    setSelectedAppointment(appointment);
    setRejectionReason('');
    setOpenRejectDialog(true);
  };

  const handleCloseRejectDialog = () => {
    setOpenRejectDialog(false);
    setSelectedAppointment(null);
    setRejectionReason('');
  };

  const handleReject = async () => {
    if (!selectedAppointment) return;
    if (!rejectionReason.trim()) {
      toast.error('Vui lòng nhập lý do từ chối');
      return;
    }

    try {
      await appointmentService.reject(selectedAppointment.id, rejectionReason);
      toast.success('Đã từ chối lịch hẹn');
      handleCloseRejectDialog();
      loadPendingAppointments();
    } catch (error) {
      toast.error('Không thể từ chối lịch hẹn');
    }
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      <Typography variant="h4" fontWeight="bold" mb={3}>
        Quản lý lịch hẹn chờ duyệt
      </Typography>

      <Paper sx={{ borderRadius: 2, p: 3 }}>
        {appointments.length === 0 ? (
          <Box py={8} textAlign="center">
            <Typography variant="h6" color="text.secondary">
              Không có lịch hẹn chờ duyệt
            </Typography>
          </Box>
        ) : (
          <>
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Bệnh nhân</TableCell>
                    <TableCell>Bác sĩ</TableCell>
                    <TableCell>Dịch vụ</TableCell>
                    <TableCell>Ngày giờ</TableCell>
                    <TableCell>Lý do</TableCell>
                    <TableCell align="right">Thao tác</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {appointments
                    .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                    .map((appointment) => (
                      <TableRow key={appointment.id} hover>
                        <TableCell>
                          <Typography fontWeight={500}>
                            {appointment.patientName || appointment.patientId}
                          </Typography>
                        </TableCell>
                        <TableCell>{appointment.doctorName || appointment.doctorId}</TableCell>
                        <TableCell>
                          <Chip
                            label={appointment.serviceName || appointment.serviceId}
                            size="small"
                            color="primary"
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
                          <Typography variant="body2">{appointment.reason}</Typography>
                        </TableCell>
                        <TableCell align="right">
                          <Button
                            variant="contained"
                            color="success"
                            size="small"
                            startIcon={<CheckCircle />}
                            onClick={() => handleApprove(appointment.id)}
                            sx={{ mr: 1 }}
                          >
                            Duyệt
                          </Button>
                          <Button
                            variant="outlined"
                            color="error"
                            size="small"
                            startIcon={<Cancel />}
                            onClick={() => handleOpenRejectDialog(appointment)}
                          >
                            Từ chối
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                </TableBody>
              </Table>
            </TableContainer>

            <TablePagination
              component="div"
              count={appointments.length}
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
          </>
        )}
      </Paper>

      <Dialog open={openRejectDialog} onClose={handleCloseRejectDialog} maxWidth="sm" fullWidth>
        <DialogTitle>Từ chối lịch hẹn</DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary" mb={2}>
            Vui lòng nhập lý do từ chối lịch hẹn
          </Typography>
          <TextField
            fullWidth
            multiline
            rows={4}
            label="Lý do từ chối"
            value={rejectionReason}
            onChange={(e) => setRejectionReason(e.target.value)}
            placeholder="Nhập lý do từ chối..."
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseRejectDialog}>Hủy</Button>
          <Button onClick={handleReject} variant="contained" color="error">
            Từ chối
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default PendingApproval;
