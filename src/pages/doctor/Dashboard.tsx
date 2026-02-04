import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Paper,
  Typography,
  Button,
  Tabs,
  Tab,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  ButtonGroup,
  TextField,
} from '@mui/material';
import {
  ExpandMore,
  Visibility,
  CalendarToday,
} from '@mui/icons-material';
import { toast } from 'react-toastify';
import { useAuth } from '../../contexts/AuthContext';
import { appointmentService } from '../../services/appointmentService';
import { patientService } from '../../services/patientService';
import { serviceService } from '../../services/serviceService';
import { medicalRecordService } from '../../services/medicalRecordService';
import type { Appointment, Patient, MedicalRecord } from '../../types';

interface AppointmentWithDetails extends Appointment {
  patientName?: string;
  serviceName?: string;
}

const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [appointments, setAppointments] = useState<AppointmentWithDetails[]>([]);
  const [filteredAppointments, setFilteredAppointments] = useState<AppointmentWithDetails[]>([]);
  const [activeTab, setActiveTab] = useState<'APPROVED' | 'CHECKED_IN' | 'DONE'>('APPROVED');
  const [dateFilter, setDateFilter] = useState<'today' | 'week' | 'custom'>('today');
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const [patientHistory, setPatientHistory] = useState<MedicalRecord[]>([]);
  const [openPatientModal, setOpenPatientModal] = useState(false);
  const [loadingPatient, setLoadingPatient] = useState(false);

  useEffect(() => {
    loadAppointments();
  }, [user]);

  useEffect(() => {
    filterAppointments();
  }, [appointments, activeTab, dateFilter, startDate, endDate]);

  const loadAppointments = async () => {
    if (!user?.id) return;

    setLoading(true);
    try {
      const data = await appointmentService.getAll({ doctorId: user.id });
      
      const appointmentsWithDetails = await Promise.all(
        data.map(async (apt) => {
          try {
            const patient = await patientService.getProfile(apt.patientId);
            const service = await serviceService.getById(apt.serviceId);
            return {
              ...apt,
              patientName: patient.name,
              serviceName: service.name,
            };
          } catch {
            return apt;
          }
        })
      );

      setAppointments(appointmentsWithDetails);
    } catch (error) {
      toast.error('Không thể tải danh sách lịch hẹn');
    } finally {
      setLoading(false);
    }
  };

  const filterAppointments = () => {
    let filtered = appointments.filter(apt => apt.status === activeTab);

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (dateFilter === 'today') {
      const todayStr = today.toISOString().split('T')[0];
      filtered = filtered.filter(apt => apt.date === todayStr);
    } else if (dateFilter === 'week') {
      const weekStart = new Date(today);
      weekStart.setDate(today.getDate() - today.getDay());
      const weekEnd = new Date(weekStart);
      weekEnd.setDate(weekStart.getDate() + 6);

      const weekStartStr = weekStart.toISOString().split('T')[0];
      const weekEndStr = weekEnd.toISOString().split('T')[0];

      filtered = filtered.filter(apt => apt.date >= weekStartStr && apt.date <= weekEndStr);
    } else if (dateFilter === 'custom' && startDate && endDate) {
      filtered = filtered.filter(apt => apt.date >= startDate && apt.date <= endDate);
    }

    filtered.sort((a, b) => {
      const dateCompare = a.date.localeCompare(b.date);
      if (dateCompare !== 0) return dateCompare;
      return a.time.localeCompare(b.time);
    });

    setFilteredAppointments(filtered);
  };

  const handleViewPatient = async (patientId: string) => {
    setLoadingPatient(true);
    setOpenPatientModal(true);
    try {
      const patient = await patientService.getProfile(patientId);
      const history = await medicalRecordService.getByPatient(patientId);
      setSelectedPatient(patient);
      setPatientHistory(history);
    } catch (error) {
      toast.error('Không thể tải thông tin bệnh nhân');
    } finally {
      setLoadingPatient(false);
    }
  };

  const handleClosePatientModal = () => {
    setOpenPatientModal(false);
    setSelectedPatient(null);
    setPatientHistory([]);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'APPROVED': return 'info';
      case 'CHECKED_IN': return 'warning';
      case 'DONE': return 'success';
      default: return 'default';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'APPROVED': return 'Đã duyệt';
      case 'CHECKED_IN': return 'Đã check-in';
      case 'DONE': return 'Hoàn tất';
      default: return status;
    }
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('vi-VN', { 
      day: '2-digit', 
      month: '2-digit', 
      year: 'numeric' 
    });
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
        Lịch hẹn của tôi
      </Typography>

      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" mb={2}>Lọc theo thời gian</Typography>
        <Box display="flex" flexWrap="wrap" gap={2} alignItems="center">
          <ButtonGroup variant="outlined">
            <Button
              variant={dateFilter === 'today' ? 'contained' : 'outlined'}
              onClick={() => setDateFilter('today')}
            >
              Hôm nay
            </Button>
            <Button
              variant={dateFilter === 'week' ? 'contained' : 'outlined'}
              onClick={() => setDateFilter('week')}
            >
              Tuần này
            </Button>
            <Button
              variant={dateFilter === 'custom' ? 'contained' : 'outlined'}
              onClick={() => setDateFilter('custom')}
            >
              Tùy chỉnh
            </Button>
          </ButtonGroup>

          {dateFilter === 'custom' && (
            <>
              <TextField
                label="Từ ngày"
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                InputLabelProps={{ shrink: true }}
                size="small"
              />
              <TextField
                label="Đến ngày"
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                InputLabelProps={{ shrink: true }}
                size="small"
              />
            </>
          )}
        </Box>
      </Paper>

      <Paper sx={{ p: 3 }}>
        <Tabs value={activeTab} onChange={(_, val) => setActiveTab(val)} sx={{ mb: 3 }}>
          <Tab label="Đã duyệt" value="APPROVED" />
          <Tab label="Đã check-in" value="CHECKED_IN" />
          <Tab label="Hoàn tất" value="DONE" />
        </Tabs>

        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell><strong>Ngày</strong></TableCell>
                <TableCell><strong>Giờ</strong></TableCell>
                <TableCell><strong>Bệnh nhân</strong></TableCell>
                <TableCell><strong>Dịch vụ</strong></TableCell>
                <TableCell><strong>Trạng thái</strong></TableCell>
                <TableCell align="right"><strong>Thao tác</strong></TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredAppointments.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} align="center" sx={{ py: 4 }}>
                    <Typography color="text.secondary">
                      Không có lịch hẹn nào
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : (
                filteredAppointments.map((apt) => (
                  <TableRow key={apt.id} hover>
                    <TableCell>{formatDate(apt.date)}</TableCell>
                    <TableCell>{apt.time}</TableCell>
                    <TableCell>{apt.patientName || 'N/A'}</TableCell>
                    <TableCell>{apt.serviceName || 'N/A'}</TableCell>
                    <TableCell>
                      <Chip 
                        label={getStatusText(apt.status)} 
                        color={getStatusColor(apt.status)} 
                        size="small" 
                      />
                    </TableCell>
                    <TableCell align="right">
                      <Button
                        size="small"
                        variant="outlined"
                        startIcon={<Visibility />}
                        onClick={() => handleViewPatient(apt.patientId)}
                        sx={{ mr: 1 }}
                      >
                        Xem chi tiết BN
                      </Button>
                      {apt.status === 'CHECKED_IN' && (
                        <Button
                          size="small"
                          variant="contained"
                          startIcon={<CalendarToday />}
                          onClick={() => navigate(`/doctor/examination/${apt.id}`)}
                        >
                          Khám bệnh
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>

      <Dialog
        open={openPatientModal}
        onClose={handleClosePatientModal}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          <Typography variant="h6" fontWeight="bold">
            Thông tin bệnh nhân
          </Typography>
        </DialogTitle>
        <DialogContent dividers>
          {loadingPatient ? (
            <Box display="flex" justifyContent="center" py={4}>
              <CircularProgress />
            </Box>
          ) : selectedPatient ? (
            <Box>
              <Box display="flex" flexWrap="wrap" gap={2} mb={3}>
                <Box sx={{ minWidth: 200 }}>
                  <Typography variant="body2" color="text.secondary">Họ tên</Typography>
                  <Typography variant="body1" fontWeight="bold">{selectedPatient.name}</Typography>
                </Box>
                <Box sx={{ minWidth: 200 }}>
                  <Typography variant="body2" color="text.secondary">Ngày sinh</Typography>
                  <Typography variant="body1">{selectedPatient.dateOfBirth ? formatDate(selectedPatient.dateOfBirth) : 'N/A'}</Typography>
                </Box>
                <Box sx={{ minWidth: 200 }}>
                  <Typography variant="body2" color="text.secondary">Giới tính</Typography>
                  <Typography variant="body1">
                    {selectedPatient.gender === 'MALE' ? 'Nam' : selectedPatient.gender === 'FEMALE' ? 'Nữ' : 'Khác'}
                  </Typography>
                </Box>
                <Box sx={{ minWidth: 200 }}>
                  <Typography variant="body2" color="text.secondary">Số điện thoại</Typography>
                  <Typography variant="body1">{selectedPatient.phone}</Typography>
                </Box>
                <Box sx={{ flex: '1 1 100%' }}>
                  <Typography variant="body2" color="text.secondary">Địa chỉ</Typography>
                  <Typography variant="body1">{selectedPatient.address || 'N/A'}</Typography>
                </Box>
              </Box>

              <Typography variant="h6" fontWeight="bold" mb={2}>
                Lịch sử khám bệnh
              </Typography>

              {patientHistory.length === 0 ? (
                <Typography color="text.secondary" textAlign="center" py={2}>
                  Chưa có lịch sử khám bệnh
                </Typography>
              ) : (
                patientHistory.map((record) => (
                  <Accordion key={record.id}>
                    <AccordionSummary expandIcon={<ExpandMore />}>
                      <Typography fontWeight="bold">
                        {formatDate(record.date)} - {record.diagnosis}
                      </Typography>
                    </AccordionSummary>
                    <AccordionDetails>
                      <Box>
                        <Typography variant="body2" color="text.secondary" mb={1}>
                          <strong>Triệu chứng:</strong>
                        </Typography>
                        <Typography variant="body2" mb={2}>{record.symptoms}</Typography>

                        <Typography variant="body2" color="text.secondary" mb={1}>
                          <strong>Chẩn đoán:</strong>
                        </Typography>
                        <Typography variant="body2" mb={2}>{record.diagnosis}</Typography>

                        {record.notes && (
                          <>
                            <Typography variant="body2" color="text.secondary" mb={1}>
                              <strong>Ghi chú:</strong>
                            </Typography>
                            <Typography variant="body2">{record.notes}</Typography>
                          </>
                        )}
                      </Box>
                    </AccordionDetails>
                  </Accordion>
                ))
              )}
            </Box>
          ) : null}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClosePatientModal}>Đóng</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Dashboard;
