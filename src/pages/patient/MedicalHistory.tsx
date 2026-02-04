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
  Card,
  CardContent,
  CircularProgress,
  Chip,
  Grid,
} from '@mui/material';
import { ArrowBack, Visibility, CalendarMonth, Person } from '@mui/icons-material';
import { toast } from 'react-toastify';
import { useAuth } from '../../contexts/AuthContext';
import { patientService } from '../../services/patientService';
import { doctorService } from '../../services/doctorService';
import { serviceService } from '../../services/serviceService';
import { specialtyService } from '../../services/specialtyService';
import type { MedicalRecord, Doctor, Service, Specialty, Appointment } from '../../types';

const MedicalHistory: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [medicalRecords, setMedicalRecords] = useState<MedicalRecord[]>([]);
  const [appointments, setAppointments] = useState<Record<string, Appointment>>({});
  const [doctors, setDoctors] = useState<Record<string, Doctor>>({});
  const [services, setServices] = useState<Record<string, Service>>({});
  const [specialties, setSpecialties] = useState<Record<string, Specialty>>({});

  useEffect(() => {
    loadMedicalHistory();
  }, []);

  const loadMedicalHistory = async () => {
    if (!user?.id) return;
    
    setLoading(true);
    try {
      const [recordsData, appointmentsData, allDoctors, allServices, allSpecialties] = await Promise.all([
        patientService.getMedicalHistory(user.id),
        patientService.getAppointments(user.id),
        doctorService.getAll(),
        serviceService.getAll(),
        specialtyService.getAll(),
      ]);
      
      setMedicalRecords(recordsData);
      
      const appointmentsMap: Record<string, Appointment> = {};
      appointmentsData.forEach(a => { appointmentsMap[a.id] = a; });
      setAppointments(appointmentsMap);
      
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
      console.error('Error loading medical history:', error);
      toast.error('Không thể tải lịch sử khám bệnh');
    } finally {
      setLoading(false);
    }
  };

  const handleViewDetail = (recordId: string) => {
    navigate(`/patient/medical-history/${recordId}`);
  };

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: '#f5f5f5' }}>
      <AppBar position="static" elevation={2}>
        <Toolbar>
          <IconButton edge="start" color="inherit" onClick={() => navigate('/patient/dashboard')}>
            <ArrowBack />
          </IconButton>
          <Typography variant="h6" sx={{ flexGrow: 1, ml: 2, fontWeight: 'bold' }}>
            Lịch sử khám bệnh
          </Typography>
        </Toolbar>
      </AppBar>

      <Container maxWidth="lg" sx={{ py: 4 }}>
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
            <CircularProgress />
          </Box>
        ) : medicalRecords.length === 0 ? (
          <Paper sx={{ p: 4, textAlign: 'center' }}>
            <Typography variant="h6" color="text.secondary">
              Chưa có hồ sơ bệnh án nào
            </Typography>
          </Paper>
        ) : (
          <Grid container spacing={3}>
            {medicalRecords.map((record) => {
              const appointment = appointments[record.appointmentId];
              const doctor = appointment ? doctors[appointment.doctorId] : null;
              const service = appointment ? services[appointment.serviceId] : null;
              const specialty = service ? specialties[service.specialtyId] : null;
              
              return (
                <Grid size={{ xs: 12, md: 6 }} key={record.id}>
                  <Card sx={{ height: '100%' }}>
                    <CardContent>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', mb: 2 }}>
                        <Box>
                          <Chip
                            label="Đã khám"
                            color="success"
                            size="small"
                            sx={{ mb: 1 }}
                          />
                          <Typography variant="h6" fontWeight="bold">
                            {specialty?.name || 'N/A'}
                          </Typography>
                        </Box>
                        <Typography variant="body2" color="text.secondary">
                          #{record.id}
                        </Typography>
                      </Box>

                      <Box sx={{ mb: 2 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                          <CalendarMonth sx={{ fontSize: 20, mr: 1, color: 'text.secondary' }} />
                          <Typography variant="body2">
                            {new Date(record.date).toLocaleDateString('vi-VN')}
                          </Typography>
                        </Box>
                        <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                          <Person sx={{ fontSize: 20, mr: 1, color: 'text.secondary' }} />
                          <Typography variant="body2">
                            Bác sĩ: <strong>{doctor?.name || 'N/A'}</strong>
                          </Typography>
                        </Box>
                      </Box>

                      <Typography variant="body2" color="text.secondary" mb={1}>
                        Dịch vụ:
                      </Typography>
                      <Typography variant="body1" fontWeight="bold" mb={2}>
                        {service?.name || 'N/A'}
                      </Typography>

                      <Typography variant="body2" color="text.secondary" mb={1}>
                        Triệu chứng:
                      </Typography>
                      <Typography
                        variant="body2"
                        sx={{
                          mb: 2,
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          display: '-webkit-box',
                          WebkitLineClamp: 2,
                          WebkitBoxOrient: 'vertical',
                        }}
                      >
                        {record.symptoms}
                      </Typography>

                      <Button
                        fullWidth
                        variant="outlined"
                        startIcon={<Visibility />}
                        onClick={() => handleViewDetail(record.id)}
                      >
                        Xem chi tiết
                      </Button>
                    </CardContent>
                  </Card>
                </Grid>
              );
            })}
          </Grid>
        )}
      </Container>
    </Box>
  );
};

export default MedicalHistory;
