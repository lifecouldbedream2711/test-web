import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import {
  Box,
  Paper,
  Typography,
  TextField,
  Button,
  CircularProgress,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Divider,
} from '@mui/material';
import {
  Save,
  CheckCircle,
  Cancel,
  Delete,
  Add,
  ExpandMore,
} from '@mui/icons-material';
import { toast } from 'react-toastify';
import { useAuth } from '../../contexts/AuthContext';
import { appointmentService } from '../../services/appointmentService';
import { patientService } from '../../services/patientService';
import { serviceService } from '../../services/serviceService';
import { medicalRecordService } from '../../services/medicalRecordService';
import { prescriptionService } from '../../services/prescriptionService';
import type { Appointment, Patient, Service, Medication, MedicalRecord } from '../../types';

const medicalRecordSchema = yup.object().shape({
  symptoms: yup.string().required('Triệu chứng là bắt buộc'),
  diagnosis: yup.string().required('Chẩn đoán là bắt buộc'),
  notes: yup.string(),
});

const medicationSchema = yup.object().shape({
  name: yup.string().required('Tên thuốc là bắt buộc'),
  dosage: yup.string().required('Liều lượng là bắt buộc'),
  quantity: yup.number().required('Số lượng là bắt buộc').min(1, 'Số lượng phải lớn hơn 0'),
  usage: yup.string().required('Cách dùng là bắt buộc'),
  days: yup.number().required('Số ngày là bắt buộc').min(1, 'Số ngày phải lớn hơn 0'),
});

interface MedicalRecordForm {
  symptoms: string;
  diagnosis: string;
  notes?: string;
}

interface MedicationForm {
  name: string;
  dosage: string;
  quantity: number;
  usage: string;
  days: number;
}

const Examination: React.FC = () => {
  const { appointment_id } = useParams<{ appointment_id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [loading, setLoading] = useState(true);
  const [appointment, setAppointment] = useState<Appointment | null>(null);
  const [patient, setPatient] = useState<Patient | null>(null);
  const [service, setService] = useState<Service | null>(null);
  const [patientHistory, setPatientHistory] = useState<MedicalRecord[]>([]);
  const [medications, setMedications] = useState<Medication[]>([]);
  const [savedMedicalRecordId, setSavedMedicalRecordId] = useState<string | null>(null);

  const [openMedicationDialog, setOpenMedicationDialog] = useState(false);
  const [openCompleteDialog, setOpenCompleteDialog] = useState(false);
  const [openNoShowDialog, setOpenNoShowDialog] = useState(false);
  const [saving, setSaving] = useState(false);

  const { control: recordControl, handleSubmit: handleRecordSubmit, formState: { errors: recordErrors } } = useForm<MedicalRecordForm>({
    resolver: yupResolver(medicalRecordSchema) as any,
    defaultValues: {
      symptoms: '',
      diagnosis: '',
      notes: '',
    },
  });

  const { control: medControl, handleSubmit: handleMedSubmit, formState: { errors: medErrors }, reset: resetMedForm } = useForm<MedicationForm>({
    resolver: yupResolver(medicationSchema),
    defaultValues: {
      name: '',
      dosage: '',
      quantity: 1,
      usage: '',
      days: 1,
    },
  });

  useEffect(() => {
    if (appointment_id) {
      loadAppointmentDetails();
    }
  }, [appointment_id]);

  const loadAppointmentDetails = async () => {
    if (!appointment_id) return;

    setLoading(true);
    try {
      const apt = await appointmentService.getById(appointment_id);
      const pat = await patientService.getProfile(apt.patientId);
      const svc = await serviceService.getById(apt.serviceId);
      const history = await medicalRecordService.getByPatient(apt.patientId);

      setAppointment(apt);
      setPatient(pat);
      setService(svc);
      setPatientHistory(history);

      const existingRecord = await medicalRecordService.getByAppointment(appointment_id);
      if (existingRecord) {
        setSavedMedicalRecordId(existingRecord.id);
      }
    } catch (error) {
      toast.error('Không thể tải thông tin cuộc hẹn');
      navigate('/doctor/dashboard');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveMedicalRecord = async (data: MedicalRecordForm) => {
    if (!appointment || !user?.id) return;

    setSaving(true);
    try {
      const record = await medicalRecordService.create({
        appointmentId: appointment.id,
        patientId: appointment.patientId,
        doctorId: user.id,
        symptoms: data.symptoms,
        diagnosis: data.diagnosis,
        notes: data.notes,
        date: appointment.date,
      });

      setSavedMedicalRecordId(record.id);
      toast.success('Lưu hồ sơ bệnh án thành công!');
    } catch (error) {
      toast.error('Không thể lưu hồ sơ bệnh án');
    } finally {
      setSaving(false);
    }
  };

  const handleAddMedication = (data: MedicationForm) => {
    setMedications([...medications, data]);
    resetMedForm();
    setOpenMedicationDialog(false);
    toast.success('Đã thêm thuốc');
  };

  const handleDeleteMedication = (index: number) => {
    setMedications(medications.filter((_, i) => i !== index));
    toast.success('Đã xóa thuốc');
  };

  const handleSavePrescription = async () => {
    if (!savedMedicalRecordId) {
      toast.error('Vui lòng lưu hồ sơ bệnh án trước');
      return;
    }

    if (medications.length === 0) {
      toast.error('Vui lòng thêm ít nhất một loại thuốc');
      return;
    }

    setSaving(true);
    try {
      await prescriptionService.create({
        medicalRecordId: savedMedicalRecordId,
        medications: medications,
      });
      toast.success('Lưu đơn thuốc thành công!');
    } catch (error) {
      toast.error('Không thể lưu đơn thuốc');
    } finally {
      setSaving(false);
    }
  };

  const handleComplete = async () => {
    if (!savedMedicalRecordId) {
      toast.error('Vui lòng lưu hồ sơ bệnh án trước khi hoàn tất');
      return;
    }

    if (!appointment_id) return;

    setSaving(true);
    try {
      await appointmentService.complete(appointment_id);
      toast.success('Hoàn tất khám bệnh!');
      navigate('/doctor/dashboard');
    } catch (error) {
      toast.error('Không thể hoàn tất khám bệnh');
    } finally {
      setSaving(false);
      setOpenCompleteDialog(false);
    }
  };

  const handleNoShow = async () => {
    if (!appointment_id) return;

    setSaving(true);
    try {
      await appointmentService.noShow(appointment_id);
      toast.success('Đã đánh dấu bệnh nhân không đến');
      navigate('/doctor/dashboard');
    } catch (error) {
      toast.error('Không thể cập nhật trạng thái');
    } finally {
      setSaving(false);
      setOpenNoShowDialog(false);
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

  const calculateAge = (dateOfBirth?: string) => {
    if (!dateOfBirth) return 'N/A';
    const today = new Date();
    const birthDate = new Date(dateOfBirth);
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age;
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    );
  }

  if (!appointment || !patient || !service) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <Typography>Không tìm thấy thông tin cuộc hẹn</Typography>
      </Box>
    );
  }

  return (
    <Box>
      <Typography variant="h4" fontWeight="bold" mb={3}>
        Khám bệnh
      </Typography>

      {/* Section 1: Patient Information */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" fontWeight="bold" mb={2}>
          Thông tin bệnh nhân
        </Typography>
        <Box display="flex" flexWrap="wrap" gap={2}>
          <Box sx={{ minWidth: 200 }}>
            <Typography variant="body2" color="text.secondary">Họ tên</Typography>
            <Typography variant="body1" fontWeight="bold">{patient.name}</Typography>
          </Box>
          <Box sx={{ minWidth: 200 }}>
            <Typography variant="body2" color="text.secondary">Tuổi</Typography>
            <Typography variant="body1">{calculateAge(patient.dateOfBirth)} tuổi</Typography>
          </Box>
          <Box sx={{ minWidth: 200 }}>
            <Typography variant="body2" color="text.secondary">Giới tính</Typography>
            <Typography variant="body1">
              {patient.gender === 'MALE' ? 'Nam' : patient.gender === 'FEMALE' ? 'Nữ' : 'Khác'}
            </Typography>
          </Box>
          <Box sx={{ minWidth: 200 }}>
            <Typography variant="body2" color="text.secondary">Số điện thoại</Typography>
            <Typography variant="body1">{patient.phone}</Typography>
          </Box>
        </Box>

        <Divider sx={{ my: 2 }} />

        <Typography variant="subtitle1" fontWeight="bold" mb={1}>
          Thông tin cuộc hẹn
        </Typography>
        <Box display="flex" flexWrap="wrap" gap={2}>
          <Box sx={{ minWidth: 200 }}>
            <Typography variant="body2" color="text.secondary">Ngày khám</Typography>
            <Typography variant="body1">{formatDate(appointment.date)}</Typography>
          </Box>
          <Box sx={{ minWidth: 200 }}>
            <Typography variant="body2" color="text.secondary">Giờ</Typography>
            <Typography variant="body1">{appointment.time}</Typography>
          </Box>
          <Box sx={{ minWidth: 200 }}>
            <Typography variant="body2" color="text.secondary">Dịch vụ</Typography>
            <Typography variant="body1">{service.name}</Typography>
          </Box>
          <Box sx={{ minWidth: 200 }}>
            <Typography variant="body2" color="text.secondary">Lý do khám</Typography>
            <Typography variant="body1">{appointment.reason}</Typography>
          </Box>
        </Box>

        <Divider sx={{ my: 2 }} />

        <Typography variant="subtitle1" fontWeight="bold" mb={1}>
          Lịch sử khám bệnh
        </Typography>
        {patientHistory.length === 0 ? (
          <Typography color="text.secondary">Chưa có lịch sử khám bệnh</Typography>
        ) : (
          <Box>
            {patientHistory.slice(0, 3).map((record) => (
              <Accordion key={record.id}>
                <AccordionSummary expandIcon={<ExpandMore />}>
                  <Typography>
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
            ))}
          </Box>
        )}
      </Paper>

      <Box display="flex" gap={3} flexDirection={{ xs: 'column', md: 'row' }}>
        {/* Section 2: Medical Record Form */}
        <Box sx={{ flex: 1 }}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" fontWeight="bold" mb={2}>
              Hồ sơ bệnh án
            </Typography>
            <form onSubmit={handleRecordSubmit(handleSaveMedicalRecord)}>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <Controller
                  name="symptoms"
                  control={recordControl}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      fullWidth
                      label="Triệu chứng"
                      multiline
                      rows={3}
                      error={!!recordErrors.symptoms}
                      helperText={recordErrors.symptoms?.message}
                      disabled={!!savedMedicalRecordId}
                    />
                  )}
                />

                <Controller
                  name="diagnosis"
                  control={recordControl}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      fullWidth
                      label="Chẩn đoán"
                      multiline
                      rows={3}
                      error={!!recordErrors.diagnosis}
                      helperText={recordErrors.diagnosis?.message}
                      disabled={!!savedMedicalRecordId}
                    />
                  )}
                />

                <Controller
                  name="notes"
                  control={recordControl}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      fullWidth
                      label="Ghi chú"
                      multiline
                      rows={2}
                      error={!!recordErrors.notes}
                      helperText={recordErrors.notes?.message}
                      disabled={!!savedMedicalRecordId}
                    />
                  )}
                />

                <Button
                  type="submit"
                  variant="contained"
                  startIcon={<Save />}
                  disabled={saving || !!savedMedicalRecordId}
                  fullWidth
                >
                  {savedMedicalRecordId ? 'Đã lưu hồ sơ' : 'Lưu hồ sơ'}
                </Button>
              </Box>
            </form>
          </Paper>
        </Box>

        {/* Section 3: Prescription Form */}
        <Box sx={{ flex: 1 }}>
          <Paper sx={{ p: 3 }}>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
              <Typography variant="h6" fontWeight="bold">
                Đơn thuốc
              </Typography>
              <Button
                variant="outlined"
                startIcon={<Add />}
                onClick={() => setOpenMedicationDialog(true)}
              >
                Thêm thuốc
              </Button>
            </Box>

            {medications.length === 0 ? (
              <Typography color="text.secondary" textAlign="center" py={4}>
                Chưa có thuốc nào
              </Typography>
            ) : (
              <TableContainer>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell><strong>Tên thuốc</strong></TableCell>
                      <TableCell><strong>Liều lượng</strong></TableCell>
                      <TableCell><strong>SL</strong></TableCell>
                      <TableCell><strong>Cách dùng</strong></TableCell>
                      <TableCell><strong>Số ngày</strong></TableCell>
                      <TableCell></TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {medications.map((med, index) => (
                      <TableRow key={index}>
                        <TableCell>{med.name}</TableCell>
                        <TableCell>{med.dosage}</TableCell>
                        <TableCell>{med.quantity}</TableCell>
                        <TableCell>{med.usage}</TableCell>
                        <TableCell>{med.days}</TableCell>
                        <TableCell>
                          <IconButton
                            size="small"
                            color="error"
                            onClick={() => handleDeleteMedication(index)}
                          >
                            <Delete />
                          </IconButton>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            )}

            <Button
              variant="contained"
              startIcon={<Save />}
              onClick={handleSavePrescription}
              disabled={saving || medications.length === 0 || !savedMedicalRecordId}
              fullWidth
              sx={{ mt: 2 }}
            >
              Lưu đơn thuốc
            </Button>
          </Paper>
        </Box>
      </Box>

      {/* Section 4: Actions */}
      <Paper sx={{ p: 3, mt: 3 }}>
        <Box display="flex" gap={2} flexDirection={{ xs: 'column', sm: 'row' }}>
          <Button
            variant="contained"
            color="success"
            startIcon={<CheckCircle />}
            onClick={() => setOpenCompleteDialog(true)}
            disabled={!savedMedicalRecordId || saving}
            fullWidth
            size="large"
          >
            Hoàn tất khám
          </Button>
          <Button
            variant="outlined"
            color="inherit"
            startIcon={<Cancel />}
            onClick={() => setOpenNoShowDialog(true)}
            disabled={saving}
            fullWidth
            size="large"
          >
            Đánh dấu không đến
          </Button>
        </Box>
      </Paper>

      {/* Medication Dialog */}
      <Dialog
        open={openMedicationDialog}
        onClose={() => setOpenMedicationDialog(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Thêm thuốc</DialogTitle>
        <form onSubmit={handleMedSubmit(handleAddMedication)}>
          <DialogContent dividers>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <Controller
                name="name"
                control={medControl}
                render={({ field }) => (
                  <TextField
                    {...field}
                    fullWidth
                    label="Tên thuốc"
                    error={!!medErrors.name}
                    helperText={medErrors.name?.message}
                  />
                )}
              />

              <Controller
                name="dosage"
                control={medControl}
                render={({ field }) => (
                  <TextField
                    {...field}
                    fullWidth
                    label="Liều lượng"
                    placeholder="VD: 500mg"
                    error={!!medErrors.dosage}
                    helperText={medErrors.dosage?.message}
                  />
                )}
              />

              <Controller
                name="quantity"
                control={medControl}
                render={({ field }) => (
                  <TextField
                    {...field}
                    fullWidth
                    label="Số lượng"
                    type="number"
                    error={!!medErrors.quantity}
                    helperText={medErrors.quantity?.message}
                  />
                )}
              />

              <Controller
                name="usage"
                control={medControl}
                render={({ field }) => (
                  <TextField
                    {...field}
                    fullWidth
                    label="Cách dùng"
                    placeholder="VD: Uống sau ăn, ngày 2 lần"
                    error={!!medErrors.usage}
                    helperText={medErrors.usage?.message}
                  />
                )}
              />

              <Controller
                name="days"
                control={medControl}
                render={({ field }) => (
                  <TextField
                    {...field}
                    fullWidth
                    label="Số ngày"
                    type="number"
                    error={!!medErrors.days}
                    helperText={medErrors.days?.message}
                  />
                )}
              />
            </Box>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setOpenMedicationDialog(false)}>Hủy</Button>
            <Button type="submit" variant="contained">Thêm</Button>
          </DialogActions>
        </form>
      </Dialog>

      {/* Complete Confirmation Dialog */}
      <Dialog open={openCompleteDialog} onClose={() => setOpenCompleteDialog(false)}>
        <DialogTitle>Xác nhận hoàn tất</DialogTitle>
        <DialogContent>
          <Typography>
            Bạn có chắc chắn muốn hoàn tất khám bệnh cho bệnh nhân này?
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenCompleteDialog(false)} disabled={saving}>
            Hủy
          </Button>
          <Button onClick={handleComplete} variant="contained" color="success" disabled={saving}>
            {saving ? <CircularProgress size={24} /> : 'Xác nhận'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* No Show Confirmation Dialog */}
      <Dialog open={openNoShowDialog} onClose={() => setOpenNoShowDialog(false)}>
        <DialogTitle>Xác nhận không đến</DialogTitle>
        <DialogContent>
          <Typography>
            Bạn có chắc chắn muốn đánh dấu bệnh nhân này không đến khám?
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenNoShowDialog(false)} disabled={saving}>
            Hủy
          </Button>
          <Button onClick={handleNoShow} variant="outlined" disabled={saving}>
            {saving ? <CircularProgress size={24} /> : 'Xác nhận'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Examination;
