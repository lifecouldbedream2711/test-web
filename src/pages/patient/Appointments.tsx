import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Container,
  Box,
  Paper,
  Typography,
  Button,
  AppBar,
  Toolbar,
  IconButton,
  Tabs,
  Tab,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Divider,
  Grid,
} from '@mui/material';
import { ArrowBack, CalendarMonth, AccessTime, Cancel, Visibility } from '@mui/icons-material';
import { toast } from 'react-toastify';
import { useAuth } from '../../contexts/AuthContext';
import { patientService } from '../../services/patientService';
import { doctorService } from '../../services/doctorService';
import { serviceService } from '../../services/serviceService';
import { specialtyService } from '../../services/specialtyService';
import type { Appointment, Doctor, Service, Specialty } from '../../types';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;
  return (
    <div role="tabpanel" hidden={value !== index} {...other}>
      {value === index && <Box sx={{ py: 3 }}>{children}</Box>}
    </div>
  );
}

const statusLabels: Record<string, string> = {
  PENDING: 'Chờ duyệt',
  APPROVED: 'Đã duyệt',
  CHECKED_IN: 'Đã check-in',
  DONE: 'Hoàn tất',
  CANCELLED: 'Đã hủy',
  REJECTED: 'Từ chối',
  NO_SHOW: 'Không đến',
};

const statusColors: Record<string, 'warning' | 'info' | 'primary' | 'success' | 'error' | 'default'> = {
  PENDING: 'warning',
  APPROVED: 'info',
  CHECKED_IN: 'primary',
  DONE: 'success',
  CANCELLED: 'error',
  REJECTED: 'error',
  NO_SHOW: 'default',
};

const Appointments: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [tabValue, setTabValue] = useState(0);
  const [loading, setLoading] = useState(true);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [doctors, setDoctors] = useState<Record<string, Doctor>>({});
  const [services, setServices] = useState<Record<string, Service>>({});
  const [specialties, setSpecialties] = useState<Record<string, Specialty>>({});
  
  const [detailDialogOpen, setDetailDialogOpen] = useState(false);
  const [cancelDialogOpen, setCancelDialogOpen] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);

  useEffect(() => {
    loadAppointments();
  }, []);

  const loadAppointments = async () => {
    if (!user?.id) return;
    
    setLoading(true);
    try {
      const appointmentsData = await patientService.getAppointments(user.id);
      setAppointments(appointmentsData);
      
      const [allDoctors, allServices, allSpecialties] = await Promise.all([
        doctorService.getAll(),
        serviceService.getAll(),
        specialtyService.getAll(),
      ]);
      
      const doctorsMap: Record<string, Doctor> = {};
      allDoctors.forEach(d => { doctorsMap[d.id] = d; });
      setDoctors(doctorsMap);
      
      const servicesMap: Record<string, Service> = {};
      allServices.forEach(s => { servicesMap[s.id] = s; });
      setServices(servicesMap);
      
      const specialtiesMap: Record<string, Specialty> = {};
      allSpecialties.forEach(s => { specialtiesMap[s.id] = s; });
      setSpecialties(specialtiesMap);
    } catch (error) {
      console.error('Error loading appointments:', error);
      toast.error('Không thể tải danh sách lịch hẹn');
    } finally {
      setLoading(false);
    }
  };

  const handleViewDetail = (appointment: Appointment) => {
    setSelectedAppointment(appointment);
    setDetailDialogOpen(true);
  };

  const handleCancelClick = (appointment: Appointment) => {
    setSelectedAppointment(appointment);
    setCancelDialogOpen(true);
  };

  const handleCancelConfirm = async () => {
    if (!selectedAppointment) return;
    
    try {
      await patientService.cancelAppointment(selectedAppointment.id);
      toast.success('Hủy lịch hẹn thành công');
      setCancelDialogOpen(false);
      loadAppointments();
    } catch (error) {
      console.error('Error canceling appointment:', error);
      toast.error('Không thể hủy lịch hẹn');
    }
  };

  const filterAppointmentsByStatus = (status: string[]) => {
    return appointments.filter(a => status.includes(a.status));
  };

  const renderAppointmentCard = (appointment: Appointment) => {
    const doctor = doctors[appointment.doctorId];
    const service = services[appointment.serviceId];
    const specialty = service ? specialties[service.specialtyId] : null;
    
    return (
      <Card key={appointment.id} sx={{ mb: 2 }}>
        <CardContent>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', mb: 2 }}>
            <Box>
              <Chip
                label={statusLabels[appointment.status]}
                color={statusColors[appointment.status]}
                size="small"
                sx={{ mb: 1 }}
              />
              <Typography variant="h6" fontWeight="bold">
                {specialty?.name || 'N/A'}
              </Typography>
            </Box>
            <Typography variant="body2" color="text.secondary">
              #{appointment.id}
            </Typography>
          </Box>

          <Grid container spacing={2}>
            <Grid size={{ xs: 12, sm: 6 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <CalendarMonth sx={{ fontSize: 20, mr: 1, color: 'text.secondary' }} />
                <Typography variant="body2">
                  {new Date(appointment.date).toLocaleDateString('vi-VN')}
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <AccessTime sx={{ fontSize: 20, mr: 1, color: 'text.secondary' }} />
                <Typography variant="body2">{appointment.time}</Typography>
              </Box>
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <Typography variant="body2" color="text.secondary">
                Bác sĩ: <strong>{doctor?.name || 'N/A'}</strong>
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Dịch vụ: <strong>{service?.name || 'N/A'}</strong>
              </Typography>
            </Grid>
          </Grid>

          <Divider sx={{ my: 2 }} />

          <Box sx={{ display: 'flex', gap: 1, justifyContent: 'flex-end' }}>
            <Button
              size="small"
              variant="outlined"
              startIcon={<Visibility />}
              onClick={() => handleViewDetail(appointment)}
            >
              Xem chi tiết
            </Button>
            {['PENDING', 'APPROVED'].includes(appointment.status) && (
              <Button
                size="small"
                variant="outlined"
                color="error"
                startIcon={<Cancel />}
                onClick={() => handleCancelClick(appointment)}
              >
                Hủy lịch
              </Button>
            )}
          </Box>
        </CardContent>
      </Card>
    );
  };

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: '#f5f5f5' }}>
      <AppBar position="static" elevation={2}>
        <Toolbar>
          <IconButton edge="start" color="inherit" onClick={() => navigate('/patient/dashboard')}>
            <ArrowBack />
          </IconButton>
          <Typography variant="h6" sx={{ flexGrow: 1, ml: 2, fontWeight: 'bold' }}>
            Lịch hẹn của tôi
          </Typography>
        </Toolbar>
      </AppBar>

      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Paper sx={{ mb: 3 }}>
          <Tabs value={tabValue} onChange={(_, v) => setTabValue(v)} variant="scrollable" scrollButtons="auto">
            <Tab label="Chờ duyệt" />
            <Tab label="Đã duyệt" />
            <Tab label="Đã check-in" />
            <Tab label="Hoàn tất" />
            <Tab label="Đã hủy" />
          </Tabs>
        </Paper>

        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
            <CircularProgress />
          </Box>
        ) : (
          <>
            <TabPanel value={tabValue} index={0}>
              {filterAppointmentsByStatus(['PENDING']).length === 0 ? (
                <Typography variant="body1" color="text.secondary" textAlign="center" py={4}>
                  Không có lịch hẹn nào
                </Typography>
              ) : (
                filterAppointmentsByStatus(['PENDING']).map(renderAppointmentCard)
              )}
            </TabPanel>

            <TabPanel value={tabValue} index={1}>
              {filterAppointmentsByStatus(['APPROVED']).length === 0 ? (
                <Typography variant="body1" color="text.secondary" textAlign="center" py={4}>
                  Không có lịch hẹn nào
                </Typography>
              ) : (
                filterAppointmentsByStatus(['APPROVED']).map(renderAppointmentCard)
              )}
            </TabPanel>

            <TabPanel value={tabValue} index={2}>
              {filterAppointmentsByStatus(['CHECKED_IN']).length === 0 ? (
                <Typography variant="body1" color="text.secondary" textAlign="center" py={4}>
                  Không có lịch hẹn nào
                </Typography>
              ) : (
                filterAppointmentsByStatus(['CHECKED_IN']).map(renderAppointmentCard)
              )}
            </TabPanel>

            <TabPanel value={tabValue} index={3}>
              {filterAppointmentsByStatus(['DONE']).length === 0 ? (
                <Typography variant="body1" color="text.secondary" textAlign="center" py={4}>
                  Không có lịch hẹn nào
                </Typography>
              ) : (
                filterAppointmentsByStatus(['DONE']).map(renderAppointmentCard)
              )}
            </TabPanel>

            <TabPanel value={tabValue} index={4}>
              {filterAppointmentsByStatus(['CANCELLED', 'REJECTED', 'NO_SHOW']).length === 0 ? (
                <Typography variant="body1" color="text.secondary" textAlign="center" py={4}>
                  Không có lịch hẹn nào
                </Typography>
              ) : (
                filterAppointmentsByStatus(['CANCELLED', 'REJECTED', 'NO_SHOW']).map(renderAppointmentCard)
              )}
            </TabPanel>
          </>
        )}
      </Container>

      <Dialog open={detailDialogOpen} onClose={() => setDetailDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Chi tiết lịch hẹn</DialogTitle>
        <DialogContent>
          {selectedAppointment && (
            <Grid container spacing={2}>
              <Grid size={12}>
                <Typography variant="body2" color="text.secondary">Mã lịch hẹn:</Typography>
                <Typography variant="body1" fontWeight="bold">{selectedAppointment.id}</Typography>
              </Grid>
              <Grid size={12}>
                <Typography variant="body2" color="text.secondary">Trạng thái:</Typography>
                <Chip
                  label={statusLabels[selectedAppointment.status]}
                  color={statusColors[selectedAppointment.status]}
                  size="small"
                />
              </Grid>
              <Grid size={12}>
                <Typography variant="body2" color="text.secondary">Chuyên khoa:</Typography>
                <Typography variant="body1" fontWeight="bold">
                  {services[selectedAppointment.serviceId] ? specialties[services[selectedAppointment.serviceId].specialtyId]?.name : 'N/A'}
                </Typography>
              </Grid>
              <Grid size={12}>
                <Typography variant="body2" color="text.secondary">Dịch vụ:</Typography>
                <Typography variant="body1" fontWeight="bold">
                  {services[selectedAppointment.serviceId]?.name || 'N/A'}
                </Typography>
              </Grid>
              <Grid size={12}>
                <Typography variant="body2" color="text.secondary">Bác sĩ:</Typography>
                <Typography variant="body1" fontWeight="bold">
                  {doctors[selectedAppointment.doctorId]?.name || 'N/A'}
                </Typography>
              </Grid>
              <Grid size={6}>
                <Typography variant="body2" color="text.secondary">Ngày khám:</Typography>
                <Typography variant="body1" fontWeight="bold">
                  {new Date(selectedAppointment.date).toLocaleDateString('vi-VN')}
                </Typography>
              </Grid>
              <Grid size={6}>
                <Typography variant="body2" color="text.secondary">Giờ khám:</Typography>
                <Typography variant="body1" fontWeight="bold">{selectedAppointment.time}</Typography>
              </Grid>
              <Grid size={12}>
                <Typography variant="body2" color="text.secondary">Lý do khám:</Typography>
                <Typography variant="body1">{selectedAppointment.reason || 'Không có'}</Typography>
              </Grid>
              {selectedAppointment.notes && (
                <Grid size={12}>
                  <Typography variant="body2" color="text.secondary">Ghi chú:</Typography>
                  <Typography variant="body1">{selectedAppointment.notes}</Typography>
                </Grid>
              )}
              {selectedAppointment.rejectionReason && (
                <Grid size={12}>
                  <Typography variant="body2" color="text.secondary">Lý do từ chối:</Typography>
                  <Typography variant="body1" color="error">{selectedAppointment.rejectionReason}</Typography>
                </Grid>
              )}
            </Grid>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDetailDialogOpen(false)}>Đóng</Button>
        </DialogActions>
      </Dialog>

      <Dialog open={cancelDialogOpen} onClose={() => setCancelDialogOpen(false)}>
        <DialogTitle>Xác nhận hủy lịch hẹn</DialogTitle>
        <DialogContent>
          <Typography variant="body1">
            Bạn có chắc chắn muốn hủy lịch hẹn này không?
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setCancelDialogOpen(false)}>Không</Button>
          <Button onClick={handleCancelConfirm} color="error" variant="contained">
            Hủy lịch
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Appointments;
