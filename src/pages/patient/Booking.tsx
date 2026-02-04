import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Container,
  Box,
  Paper,
  Typography,
  Button,
  Card,
  CardActionArea,
  Stepper,
  Step,
  StepLabel,
  AppBar,
  Toolbar,
  IconButton,
  CircularProgress,
  TextField,
  Avatar,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Grid,
} from '@mui/material';
import {
  ArrowBack,
  ArrowForward,
  CheckCircle,
  LocalHospital,
  AccessTime,
} from '@mui/icons-material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { vi } from 'date-fns/locale';
import { toast } from 'react-toastify';
import { useAuth } from '../../contexts/AuthContext';
import { specialtyService } from '../../services/specialtyService';
import { serviceService } from '../../services/serviceService';
import { doctorService } from '../../services/doctorService';
import { shiftService } from '../../services/shiftService';
import { appointmentService } from '../../services/appointmentService';
import type { Specialty, Service, Doctor, Shift, Slot } from '../../types';

const steps = ['Chọn chuyên khoa', 'Chọn dịch vụ & Bác sĩ', 'Chọn ngày & ca', 'Xác nhận'];

const Booking: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [activeStep, setActiveStep] = useState(0);
  const [loading, setLoading] = useState(false);
  
  const [specialties, setSpecialties] = useState<Specialty[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [shifts, setShifts] = useState<Shift[]>([]);
  const [slots, setSlots] = useState<Slot[]>([]);
  
  const [selectedSpecialty, setSelectedSpecialty] = useState<Specialty | null>(null);
  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const [selectedDoctor, setSelectedDoctor] = useState<Doctor | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedShift, setSelectedShift] = useState<Shift | null>(null);
  const [selectedSlot, setSelectedSlot] = useState<Slot | null>(null);
  const [reason, setReason] = useState('');
  
  const [successDialogOpen, setSuccessDialogOpen] = useState(false);

  useEffect(() => {
    loadSpecialties();
  }, []);

  useEffect(() => {
    if (selectedSpecialty) {
      loadServicesAndDoctors();
    }
  }, [selectedSpecialty]);

  useEffect(() => {
    if (selectedDoctor && selectedDate) {
      loadShifts();
    }
  }, [selectedDoctor, selectedDate]);

  useEffect(() => {
    if (selectedShift) {
      loadSlots();
    }
  }, [selectedShift]);

  const loadSpecialties = async () => {
    setLoading(true);
    try {
      const data = await specialtyService.getAll();
      setSpecialties(data);
    } catch (error) {
      toast.error('Không thể tải danh sách chuyên khoa');
    } finally {
      setLoading(false);
    }
  };

  const loadServicesAndDoctors = async () => {
    if (!selectedSpecialty) return;
    setLoading(true);
    try {
      const [servicesData, doctorsData] = await Promise.all([
        serviceService.getBySpecialty(selectedSpecialty.id),
        doctorService.getBySpecialty(selectedSpecialty.id),
      ]);
      setServices(servicesData);
      setDoctors(doctorsData);
    } catch (error) {
      toast.error('Không thể tải dữ liệu');
    } finally {
      setLoading(false);
    }
  };

  const loadShifts = async () => {
    if (!selectedDoctor || !selectedDate) return;
    setLoading(true);
    try {
      const dateStr = selectedDate.toISOString().split('T')[0];
      const shiftsData = await shiftService.getByDoctor(selectedDoctor.id, dateStr, dateStr);
      setShifts(shiftsData.filter(s => s.status === 'OPEN' && s.bookedCount < s.maxPatient));
    } catch (error) {
      toast.error('Không thể tải ca làm việc');
    } finally {
      setLoading(false);
    }
  };

  const loadSlots = async () => {
    if (!selectedShift) return;
    setLoading(true);
    try {
      const slotsData = await shiftService.getSlots(selectedShift.id);
      setSlots(slotsData);
    } catch (error) {
      toast.error('Không thể tải khung giờ');
    } finally {
      setLoading(false);
    }
  };

  const handleNext = () => {
    if (activeStep === 0 && !selectedSpecialty) {
      toast.warning('Vui lòng chọn chuyên khoa');
      return;
    }
    if (activeStep === 1 && (!selectedService || !selectedDoctor)) {
      toast.warning('Vui lòng chọn dịch vụ và bác sĩ');
      return;
    }
    if (activeStep === 2 && (!selectedDate || !selectedShift)) {
      toast.warning('Vui lòng chọn ngày và ca khám');
      return;
    }
    setActiveStep((prev) => prev + 1);
  };

  const handleBack = () => {
    setActiveStep((prev) => prev - 1);
  };

  const handleConfirm = async () => {
    if (!user || !selectedService || !selectedDoctor || !selectedShift || !selectedSlot || !selectedDate) {
      toast.error('Thiếu thông tin đặt lịch');
      return;
    }

    setLoading(true);
    try {
      await appointmentService.create({
        patientId: user.id,
        doctorId: selectedDoctor.id,
        serviceId: selectedService.id,
        shiftId: selectedShift.id,
        slotId: selectedSlot.id,
        date: selectedDate.toISOString().split('T')[0],
        time: selectedSlot.startTime,
        reason: reason || 'Không có',
      });
      setSuccessDialogOpen(true);
    } catch (error) {
      toast.error('Không thể đặt lịch');
    } finally {
      setLoading(false);
    }
  };

  const handleSuccessDialogClose = () => {
    setSuccessDialogOpen(false);
    navigate('/patient/appointments');
  };

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={vi}>
      <Box sx={{ minHeight: '100vh', bgcolor: '#f5f5f5' }}>
        <AppBar position="static" elevation={2}>
          <Toolbar>
            <IconButton edge="start" color="inherit" onClick={() => navigate('/patient/dashboard')}>
              <ArrowBack />
            </IconButton>
            <Typography variant="h6" sx={{ flexGrow: 1, ml: 2, fontWeight: 'bold' }}>
              Đặt lịch khám
            </Typography>
          </Toolbar>
        </AppBar>

        <Container maxWidth="lg" sx={{ py: 4 }}>
          <Paper sx={{ p: 3, mb: 3 }}>
            <Stepper activeStep={activeStep} alternativeLabel>
              {steps.map((label) => (
                <Step key={label}>
                  <StepLabel>{label}</StepLabel>
                </Step>
              ))}
            </Stepper>
          </Paper>

          <Paper sx={{ p: 4, minHeight: 400 }}>
            {loading ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
                <CircularProgress />
              </Box>
            ) : (
              <>
                {activeStep === 0 && (
                  <Box>
                    <Typography variant="h5" fontWeight="bold" mb={3}>
                      Chọn chuyên khoa
                    </Typography>
                    <Grid container spacing={3}>
                      {specialties.map((specialty) => (
                        <Grid size={{ xs: 12, sm: 6, md: 4 }} key={specialty.id}>
                          <Card
                            sx={{
                              border: selectedSpecialty?.id === specialty.id ? 2 : 0,
                              borderColor: 'primary.main',
                              boxShadow: selectedSpecialty?.id === specialty.id ? 4 : 1,
                            }}
                          >
                            <CardActionArea
                              onClick={() => setSelectedSpecialty(specialty)}
                              sx={{ p: 2 }}
                            >
                              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                                <LocalHospital sx={{ fontSize: 40, color: 'primary.main', mr: 2 }} />
                                <Typography variant="h6" fontWeight="bold">
                                  {specialty.name}
                                </Typography>
                              </Box>
                              <Typography variant="body2" color="text.secondary">
                                {specialty.description}
                              </Typography>
                            </CardActionArea>
                          </Card>
                        </Grid>
                      ))}
                    </Grid>
                  </Box>
                )}

                {activeStep === 1 && (
                  <Box>
                    <Typography variant="h5" fontWeight="bold" mb={3}>
                      Chọn dịch vụ
                    </Typography>
                    <Grid container spacing={2} mb={4}>
                      {services.map((service) => (
                        <Grid size={{ xs: 12, sm: 6 }} key={service.id}>
                          <Card
                            sx={{
                              border: selectedService?.id === service.id ? 2 : 0,
                              borderColor: 'primary.main',
                            }}
                          >
                            <CardActionArea onClick={() => setSelectedService(service)} sx={{ p: 2 }}>
                              <Typography variant="h6" fontWeight="bold" mb={1}>
                                {service.name}
                              </Typography>
                              <Box sx={{ display: 'flex', gap: 2 }}>
                                <Chip label={`${service.price.toLocaleString()} VNĐ`} color="primary" size="small" />
                                <Chip label={`${service.duration} phút`} size="small" />
                              </Box>
                            </CardActionArea>
                          </Card>
                        </Grid>
                      ))}
                    </Grid>

                    <Typography variant="h5" fontWeight="bold" mb={3}>
                      Chọn bác sĩ
                    </Typography>
                    <Grid container spacing={3}>
                      {doctors.map((doctor) => (
                        <Grid size={{ xs: 12, sm: 6, md: 4 }} key={doctor.id}>
                          <Card
                            sx={{
                              border: selectedDoctor?.id === doctor.id ? 2 : 0,
                              borderColor: 'primary.main',
                            }}
                          >
                            <CardActionArea onClick={() => setSelectedDoctor(doctor)} sx={{ p: 2 }}>
                              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                                <Avatar sx={{ width: 60, height: 60, mr: 2 }}>
                                  {doctor.name.charAt(0)}
                                </Avatar>
                                <Box>
                                  <Typography variant="h6" fontWeight="bold">
                                    {doctor.name}
                                  </Typography>
                                  <Typography variant="body2" color="text.secondary">
                                    {doctor.expertise}
                                  </Typography>
                                </Box>
                              </Box>
                              <Typography variant="body2" color="text.secondary">
                                Kinh nghiệm: {doctor.experience} năm
                              </Typography>
                            </CardActionArea>
                          </Card>
                        </Grid>
                      ))}
                    </Grid>
                  </Box>
                )}

                {activeStep === 2 && (
                  <Box>
                    <Typography variant="h5" fontWeight="bold" mb={3}>
                      Chọn ngày khám
                    </Typography>
                    <Box sx={{ mb: 4 }}>
                      <DatePicker
                        label="Ngày khám"
                        value={selectedDate}
                        onChange={setSelectedDate}
                        minDate={new Date()}
                        format="dd/MM/yyyy"
                        slotProps={{ textField: { fullWidth: true } }}
                      />
                    </Box>

                    {selectedDate && (
                      <>
                        <Typography variant="h5" fontWeight="bold" mb={3}>
                          Chọn ca khám
                        </Typography>
                        {shifts.length === 0 ? (
                          <Typography variant="body1" color="text.secondary">
                            Không có ca khám nào khả dụng trong ngày này
                          </Typography>
                        ) : (
                          <Grid container spacing={2}>
                            {shifts.map((shift) => (
                              <Grid size={{ xs: 12, sm: 6, md: 4 }} key={shift.id}>
                                <Card
                                  sx={{
                                    border: selectedShift?.id === shift.id ? 2 : 0,
                                    borderColor: 'primary.main',
                                  }}
                                >
                                  <CardActionArea onClick={() => setSelectedShift(shift)} sx={{ p: 2 }}>
                                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                                      <AccessTime sx={{ mr: 1, color: 'primary.main' }} />
                                      <Typography variant="h6" fontWeight="bold">
                                        {shift.startTime} - {shift.endTime}
                                      </Typography>
                                    </Box>
                                    <Typography variant="body2" color="text.secondary">
                                      Còn {shift.maxPatient - shift.bookedCount} chỗ
                                    </Typography>
                                  </CardActionArea>
                                </Card>
                              </Grid>
                            ))}
                          </Grid>
                        )}
                      </>
                    )}
                  </Box>
                )}

                {activeStep === 3 && (
                  <Box>
                    <Typography variant="h5" fontWeight="bold" mb={3}>
                      Chọn giờ khám
                    </Typography>
                    <Grid container spacing={2} mb={4}>
                      {slots
                        .filter(slot => slot.isAvailable)
                        .map((slot) => (
                          <Grid size={{ xs: 6, sm: 4, md: 3 }} key={slot.id}>
                            <Button
                              fullWidth
                              variant={selectedSlot?.id === slot.id ? 'contained' : 'outlined'}
                              onClick={() => setSelectedSlot(slot)}
                              sx={{ py: 1.5 }}
                            >
                              {slot.startTime} - {slot.endTime}
                            </Button>
                          </Grid>
                        ))}
                    </Grid>

                    <Typography variant="h6" fontWeight="bold" mb={2}>
                      Lý do khám (tùy chọn)
                    </Typography>
                    <TextField
                      fullWidth
                      multiline
                      rows={4}
                      placeholder="Nhập lý do khám..."
                      value={reason}
                      onChange={(e) => setReason(e.target.value)}
                      sx={{ mb: 4 }}
                    />

                    <Paper sx={{ p: 3, bgcolor: '#f5f5f5' }}>
                      <Typography variant="h6" fontWeight="bold" mb={2}>
                        Thông tin đặt lịch
                      </Typography>
                      <Grid container spacing={2}>
                        <Grid size={12}>
                          <Typography variant="body2" color="text.secondary">Chuyên khoa:</Typography>
                          <Typography variant="body1" fontWeight="bold">{selectedSpecialty?.name}</Typography>
                        </Grid>
                        <Grid size={12}>
                          <Typography variant="body2" color="text.secondary">Dịch vụ:</Typography>
                          <Typography variant="body1" fontWeight="bold">{selectedService?.name}</Typography>
                        </Grid>
                        <Grid size={12}>
                          <Typography variant="body2" color="text.secondary">Bác sĩ:</Typography>
                          <Typography variant="body1" fontWeight="bold">{selectedDoctor?.name}</Typography>
                        </Grid>
                        <Grid size={12}>
                          <Typography variant="body2" color="text.secondary">Ngày khám:</Typography>
                          <Typography variant="body1" fontWeight="bold">
                            {selectedDate?.toLocaleDateString('vi-VN')}
                          </Typography>
                        </Grid>
                        <Grid size={12}>
                          <Typography variant="body2" color="text.secondary">Giờ khám:</Typography>
                          <Typography variant="body1" fontWeight="bold">
                            {selectedSlot ? `${selectedSlot.startTime} - ${selectedSlot.endTime}` : ''}
                          </Typography>
                        </Grid>
                        <Grid size={12}>
                          <Typography variant="body2" color="text.secondary">Giá dịch vụ:</Typography>
                          <Typography variant="h6" color="primary" fontWeight="bold">
                            {selectedService?.price.toLocaleString()} VNĐ
                          </Typography>
                        </Grid>
                      </Grid>
                    </Paper>
                  </Box>
                )}
              </>
            )}

            <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 4 }}>
              <Button
                disabled={activeStep === 0}
                onClick={handleBack}
                startIcon={<ArrowBack />}
              >
                Quay lại
              </Button>
              {activeStep < steps.length - 1 ? (
                <Button
                  variant="contained"
                  onClick={handleNext}
                  endIcon={<ArrowForward />}
                >
                  Tiếp theo
                </Button>
              ) : (
                <Button
                  variant="contained"
                  onClick={handleConfirm}
                  disabled={!selectedSlot || loading}
                  endIcon={<CheckCircle />}
                >
                  {loading ? <CircularProgress size={24} /> : 'Xác nhận đặt lịch'}
                </Button>
              )}
            </Box>
          </Paper>
        </Container>

        <Dialog open={successDialogOpen} onClose={handleSuccessDialogClose}>
          <DialogTitle>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <CheckCircle sx={{ fontSize: 60, color: 'success.main' }} />
            </Box>
          </DialogTitle>
          <DialogContent>
            <Typography variant="h6" textAlign="center" mb={2}>
              Đặt lịch thành công!
            </Typography>
            <Typography variant="body2" textAlign="center" color="text.secondary">
              Lịch hẹn của bạn đã được tạo và đang chờ duyệt. Bạn sẽ nhận được thông báo khi lịch hẹn được xác nhận.
            </Typography>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleSuccessDialogClose} variant="contained" fullWidth>
              Xem lịch hẹn
            </Button>
          </DialogActions>
        </Dialog>
      </Box>
    </LocalizationProvider>
  );
};

export default Booking;
