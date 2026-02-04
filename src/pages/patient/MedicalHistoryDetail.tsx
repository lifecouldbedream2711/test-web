import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  Container,
  Box,
  Paper,
  Typography,
  Button,
  AppBar,
  Toolbar,
  IconButton,
  Divider,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  CircularProgress,
  Chip,
  Grid,
} from '@mui/material';
import {
  ArrowBack,
  Download,
  CalendarMonth,
  Person,
  LocalHospital,
  MedicalServices,
} from '@mui/icons-material';
import { toast } from 'react-toastify';
import { patientService } from '../../services/patientService';
import { doctorService } from '../../services/doctorService';
import { serviceService } from '../../services/serviceService';
import { specialtyService } from '../../services/specialtyService';
import { appointmentService } from '../../services/appointmentService';
import { prescriptionService } from '../../services/prescriptionService';
import type { MedicalRecord, Doctor, Service, Specialty, Prescription } from '../../types';

const MedicalHistoryDetail: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const [loading, setLoading] = useState(true);
  const [medicalRecord, setMedicalRecord] = useState<MedicalRecord | null>(null);
  const [doctor, setDoctor] = useState<Doctor | null>(null);
  const [service, setService] = useState<Service | null>(null);
  const [specialty, setSpecialty] = useState<Specialty | null>(null);
  const [prescription, setPrescription] = useState<Prescription | null>(null);

  useEffect(() => {
    loadMedicalRecordDetail();
  }, [id]);

  const loadMedicalRecordDetail = async () => {
    if (!id) return;
    
    setLoading(true);
    try {
      const record = await patientService.getMedicalRecord(id);
      setMedicalRecord(record);
      
      const appointmentData = await appointmentService.getById(record.appointmentId);
      
      const [doctorData, serviceData, prescriptionData] = await Promise.all([
        doctorService.getById(record.doctorId),
        serviceService.getById(appointmentData.serviceId),
        prescriptionService.getByMedicalRecordId(record.id),
      ]);
      
      setDoctor(doctorData);
      setService(serviceData);
      setPrescription(prescriptionData);
      
      if (serviceData) {
        const specialtyData = await specialtyService.getById(serviceData.specialtyId);
        setSpecialty(specialtyData);
      }
    } catch (error) {
      console.error('Error loading medical record detail:', error);
      toast.error('Không thể tải chi tiết hồ sơ bệnh án');
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadRecord = () => {
    toast.info('Chức năng đang phát triển');
  };

  const handleDownloadPrescription = () => {
    toast.info('Chức năng đang phát triển');
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (!medicalRecord) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}>
        <Typography variant="h6" color="text.secondary">
          Không tìm thấy hồ sơ bệnh án
        </Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: '#f5f5f5' }}>
      <AppBar position="static" elevation={2}>
        <Toolbar>
          <IconButton edge="start" color="inherit" onClick={() => navigate('/patient/medical-history')}>
            <ArrowBack />
          </IconButton>
          <Typography variant="h6" sx={{ flexGrow: 1, ml: 2, fontWeight: 'bold' }}>
            Chi tiết hồ sơ bệnh án
          </Typography>
        </Toolbar>
      </AppBar>

      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Paper sx={{ p: 4, mb: 3 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', mb: 3 }}>
            <Box>
              <Typography variant="h5" fontWeight="bold" mb={1}>
                Hồ sơ bệnh án #{medicalRecord.id}
              </Typography>
              <Chip label="Đã hoàn thành" color="success" />
            </Box>
            <Box sx={{ display: 'flex', gap: 1 }}>
              <Button
                variant="outlined"
                startIcon={<Download />}
                onClick={handleDownloadRecord}
              >
                Tải hồ sơ PDF
              </Button>
            </Box>
          </Box>

          <Divider sx={{ my: 3 }} />

          <Typography variant="h6" fontWeight="bold" mb={2}>
            Thông tin lịch hẹn
          </Typography>
          <Grid container spacing={2} mb={4}>
            <Grid size={{ xs: 12, md: 6 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <CalendarMonth sx={{ mr: 1, color: 'text.secondary' }} />
                <Box>
                  <Typography variant="body2" color="text.secondary">
                    Ngày khám
                  </Typography>
                  <Typography variant="body1" fontWeight="bold">
                    {new Date(medicalRecord.date).toLocaleDateString('vi-VN')}
                  </Typography>
                </Box>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <Person sx={{ mr: 1, color: 'text.secondary' }} />
                <Box>
                  <Typography variant="body2" color="text.secondary">
                    Bác sĩ khám
                  </Typography>
                  <Typography variant="body1" fontWeight="bold">
                    {doctor?.name || 'N/A'}
                  </Typography>
                </Box>
              </Box>
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <LocalHospital sx={{ mr: 1, color: 'text.secondary' }} />
                <Box>
                  <Typography variant="body2" color="text.secondary">
                    Chuyên khoa
                  </Typography>
                  <Typography variant="body1" fontWeight="bold">
                    {specialty?.name || 'N/A'}
                  </Typography>
                </Box>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <MedicalServices sx={{ mr: 1, color: 'text.secondary' }} />
                <Box>
                  <Typography variant="body2" color="text.secondary">
                    Dịch vụ
                  </Typography>
                  <Typography variant="body1" fontWeight="bold">
                    {service?.name || 'N/A'}
                  </Typography>
                </Box>
              </Box>
            </Grid>
          </Grid>

          <Divider sx={{ my: 3 }} />

          <Typography variant="h6" fontWeight="bold" mb={2}>
            Hồ sơ bệnh án
          </Typography>
          <Grid container spacing={3} mb={4}>
            <Grid size={12}>
              <Paper sx={{ p: 3, bgcolor: '#f9f9f9' }}>
                <Typography variant="body2" color="text.secondary" mb={1}>
                  Triệu chứng
                </Typography>
                <Typography variant="body1" mb={3}>
                  {medicalRecord.symptoms}
                </Typography>

                <Typography variant="body2" color="text.secondary" mb={1}>
                  Chẩn đoán
                </Typography>
                <Typography variant="body1" fontWeight="bold" mb={3}>
                  {medicalRecord.diagnosis}
                </Typography>

                {medicalRecord.notes && (
                  <>
                    <Typography variant="body2" color="text.secondary" mb={1}>
                      Ghi chú
                    </Typography>
                    <Typography variant="body1">
                      {medicalRecord.notes}
                    </Typography>
                  </>
                )}
              </Paper>
            </Grid>
          </Grid>

          {prescription && prescription.medications && prescription.medications.length > 0 && (
            <>
              <Divider sx={{ my: 3 }} />

              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h6" fontWeight="bold">
                  Đơn thuốc
                </Typography>
                <Button
                  variant="outlined"
                  startIcon={<Download />}
                  onClick={handleDownloadPrescription}
                >
                  Tải đơn thuốc PDF
                </Button>
              </Box>

              <TableContainer component={Paper} sx={{ mb: 3 }}>
                <Table>
                  <TableHead>
                    <TableRow sx={{ bgcolor: '#f5f5f5' }}>
                      <TableCell><strong>Tên thuốc</strong></TableCell>
                      <TableCell><strong>Liều dùng</strong></TableCell>
                      <TableCell align="center"><strong>Số lượng</strong></TableCell>
                      <TableCell><strong>Cách dùng</strong></TableCell>
                      <TableCell align="center"><strong>Số ngày</strong></TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {prescription.medications.map((med, index) => (
                      <TableRow key={index}>
                        <TableCell>{med.name}</TableCell>
                        <TableCell>{med.dosage}</TableCell>
                        <TableCell align="center">{med.quantity}</TableCell>
                        <TableCell>{med.usage}</TableCell>
                        <TableCell align="center">{med.days}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>

              {prescription.notes && (
                <Paper sx={{ p: 2, bgcolor: '#fff3e0' }}>
                  <Typography variant="body2" color="text.secondary" mb={1}>
                    <strong>Lưu ý:</strong>
                  </Typography>
                  <Typography variant="body2">
                    {prescription.notes}
                  </Typography>
                </Paper>
              )}
            </>
          )}
        </Paper>

        <Box sx={{ display: 'flex', justifyContent: 'center' }}>
          <Button
            variant="outlined"
            onClick={() => navigate('/patient/medical-history')}
          >
            Quay lại danh sách
          </Button>
        </Box>
      </Container>
    </Box>
  );
};

export default MedicalHistoryDetail;
