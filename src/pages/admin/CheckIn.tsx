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
  Button,
  CircularProgress,
  TextField,
  InputAdornment,
  Chip,
} from '@mui/material';
import { Search, CheckCircle } from '@mui/icons-material';
import { format } from 'date-fns';
import { toast } from 'react-toastify';
import { appointmentService } from '../../services/appointmentService';
import { adminService } from '../../services/adminService';
import type { Appointment, Doctor, Patient, Service } from '../../types';

interface AppointmentWithDetails extends Appointment {
  patientName?: string;
  patientPhone?: string;
  doctorName?: string;
  serviceName?: string;
}

const CheckIn: React.FC = () => {
  const [appointments, setAppointments] = useState<AppointmentWithDetails[]>([]);
  const [filteredAppointments, setFilteredAppointments] = useState<AppointmentWithDetails[]>([]);
  const [loading, setLoading] = useState(true);
  const [searching, setSearching] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    loadTodayAppointments();
  }, []);

  const loadTodayAppointments = async () => {
    try {
      setLoading(true);
      const today = format(new Date(), 'yyyy-MM-dd');
      const [appointmentsData, doctors, patients, services] = await Promise.all([
        appointmentService.getAll({ status: 'APPROVED', startDate: today, endDate: today }),
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
          patientPhone: patient?.phone,
          serviceName: service?.name,
        };
      });

      setAppointments(enrichedAppointments);
      setFilteredAppointments(enrichedAppointments);
    } catch (error) {
      toast.error('Không thể tải danh sách lịch hẹn');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = () => {
    if (!searchTerm.trim()) {
      setFilteredAppointments(appointments);
      return;
    }

    setSearching(true);
    const search = searchTerm.toLowerCase().trim();
    const filtered = appointments.filter(
      (apt) =>
        apt.patientName?.toLowerCase().includes(search) ||
        apt.patientPhone?.includes(search)
    );
    setFilteredAppointments(filtered);
    setSearching(false);
  };

  const handleCheckIn = async (appointmentId: string) => {
    if (!window.confirm('Xác nhận check-in cho bệnh nhân này?')) return;

    try {
      await appointmentService.updateStatus(appointmentId, 'CHECKED_IN');
      toast.success('Check-in thành công');
      loadTodayAppointments();
    } catch (error) {
      toast.error('Không thể check-in');
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
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
        Check-in bệnh nhân
      </Typography>

      <Paper sx={{ borderRadius: 2, p: 3, mb: 3 }}>
        <Box display="flex" gap={2}>
          <TextField
            fullWidth
            placeholder="Tìm kiếm theo tên hoặc số điện thoại..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onKeyPress={handleKeyPress}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Search />
                </InputAdornment>
              ),
            }}
          />
          <Button
            variant="contained"
            onClick={handleSearch}
            disabled={searching}
            sx={{ minWidth: 120 }}
          >
            {searching ? <CircularProgress size={24} /> : 'Tìm kiếm'}
          </Button>
        </Box>
      </Paper>

      <Paper sx={{ borderRadius: 2, p: 3 }}>
        <Typography variant="h6" fontWeight="bold" mb={2}>
          Lịch hẹn hôm nay ({filteredAppointments.length})
        </Typography>

        {filteredAppointments.length === 0 ? (
          <Box py={8} textAlign="center">
            <Typography variant="h6" color="text.secondary">
              {searchTerm ? 'Không tìm thấy lịch hẹn' : 'Không có lịch hẹn hôm nay'}
            </Typography>
          </Box>
        ) : (
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Bệnh nhân</TableCell>
                  <TableCell>Số điện thoại</TableCell>
                  <TableCell>Bác sĩ</TableCell>
                  <TableCell>Dịch vụ</TableCell>
                  <TableCell>Giờ hẹn</TableCell>
                  <TableCell align="right">Thao tác</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredAppointments.map((appointment) => (
                  <TableRow key={appointment.id} hover>
                    <TableCell>
                      <Typography fontWeight={500}>
                        {appointment.patientName || appointment.patientId}
                      </Typography>
                    </TableCell>
                    <TableCell>{appointment.patientPhone}</TableCell>
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
                      <Typography fontWeight={500}>{appointment.time}</Typography>
                    </TableCell>
                    <TableCell align="right">
                      <Button
                        variant="contained"
                        color="success"
                        size="small"
                        startIcon={<CheckCircle />}
                        onClick={() => handleCheckIn(appointment.id)}
                      >
                        Check-in
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </Paper>
    </Box>
  );
};

export default CheckIn;
