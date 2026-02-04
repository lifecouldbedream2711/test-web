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
  IconButton,
  Chip,
  CircularProgress,
  TextField,
  FormControlLabel,
  Checkbox,
} from '@mui/material';
import {
  Add,
  Edit,
  Delete,
  LocalHospital,
} from '@mui/icons-material';
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { toast } from 'react-toastify';
import { adminService } from '../../services/adminService';
import type { Doctor, Specialty } from '../../types';

const doctorSchema = yup.object().shape({
  email: yup.string().email('Email không hợp lệ').required('Email là bắt buộc'),
  name: yup.string().required('Họ tên là bắt buộc'),
  phone: yup.string().required('Số điện thoại là bắt buộc'),
  expertise: yup.string().required('Chuyên môn là bắt buộc'),
  experience: yup.number().min(0, 'Kinh nghiệm không hợp lệ').required('Kinh nghiệm là bắt buộc'),
});

interface DoctorFormData {
  email: string;
  name: string;
  phone: string;
  expertise: string;
  experience: number;
}

const Doctors: React.FC = () => {
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [specialties, setSpecialties] = useState<Specialty[]>([]);
  const [loading, setLoading] = useState(true);
  const [openDialog, setOpenDialog] = useState(false);
  const [openSpecialtyDialog, setOpenSpecialtyDialog] = useState(false);
  const [selectedDoctor, setSelectedDoctor] = useState<Doctor | null>(null);
  const [selectedSpecialties, setSelectedSpecialties] = useState<string[]>([]);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  const { control, handleSubmit, reset, formState: { errors } } = useForm<DoctorFormData>({
    resolver: yupResolver(doctorSchema),
    defaultValues: {
      email: '',
      name: '',
      phone: '',
      expertise: '',
      experience: 0,
    },
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [doctorsData, specialtiesData] = await Promise.all([
        adminService.getAllDoctors(),
        adminService.getAllSpecialties(),
      ]);
      setDoctors(doctorsData);
      setSpecialties(specialtiesData);
    } catch (error) {
      toast.error('Không thể tải dữ liệu');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenDialog = () => {
    reset();
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    reset();
  };

  const onSubmit = async (data: DoctorFormData) => {
    try {
      await adminService.createDoctor({
        ...data,
        status: 'ACTIVE',
        specialties: [],
      });
      toast.success('Bác sĩ đã được thêm thành công');
      handleCloseDialog();
      loadData();
    } catch (error) {
      toast.error('Không thể thêm bác sĩ');
    }
  };

  const handleDelete = async (doctorId: string) => {
    if (!window.confirm('Bạn có chắc muốn xóa bác sĩ này?')) return;
    try {
      await adminService.deleteDoctor(doctorId);
      toast.success('Đã xóa bác sĩ');
      loadData();
    } catch (error) {
      toast.error('Không thể xóa bác sĩ');
    }
  };

  const handleOpenSpecialtyDialog = (doctor: Doctor) => {
    setSelectedDoctor(doctor);
    setSelectedSpecialties(doctor.specialties || []);
    setOpenSpecialtyDialog(true);
  };

  const handleCloseSpecialtyDialog = () => {
    setOpenSpecialtyDialog(false);
    setSelectedDoctor(null);
    setSelectedSpecialties([]);
  };

  const handleSaveSpecialties = async () => {
    if (!selectedDoctor) return;
    try {
      await adminService.updateDoctor(selectedDoctor.id, {
        specialties: selectedSpecialties,
      });
      toast.success('Đã cập nhật chuyên khoa');
      handleCloseSpecialtyDialog();
      loadData();
    } catch (error) {
      toast.error('Không thể cập nhật chuyên khoa');
    }
  };

  const toggleSpecialty = (specialtyId: string) => {
    setSelectedSpecialties((prev) =>
      prev.includes(specialtyId)
        ? prev.filter((id) => id !== specialtyId)
        : [...prev, specialtyId]
    );
  };

  const getSpecialtyName = (specialtyId: string) => {
    const specialty = specialties.find((s) => s.id === specialtyId);
    return specialty?.name || specialtyId;
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
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4" fontWeight="bold">
          Quản lý bác sĩ
        </Typography>
        <Button variant="contained" startIcon={<Add />} onClick={handleOpenDialog}>
          Thêm bác sĩ
        </Button>
      </Box>

      <Paper sx={{ borderRadius: 2, p: 3 }}>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Họ tên</TableCell>
                <TableCell>Email</TableCell>
                <TableCell>Số điện thoại</TableCell>
                <TableCell>Chuyên khoa</TableCell>
                <TableCell>Kinh nghiệm</TableCell>
                <TableCell align="right">Thao tác</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {doctors
                .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                .map((doctor) => (
                  <TableRow key={doctor.id} hover>
                    <TableCell>{doctor.name}</TableCell>
                    <TableCell>{doctor.email}</TableCell>
                    <TableCell>{doctor.phone}</TableCell>
                    <TableCell>
                      <Box display="flex" gap={0.5} flexWrap="wrap">
                        {doctor.specialties && doctor.specialties.length > 0 ? (
                          doctor.specialties.map((specialtyId) => (
                            <Chip
                              key={specialtyId}
                              label={getSpecialtyName(specialtyId)}
                              size="small"
                              color="primary"
                              variant="outlined"
                            />
                          ))
                        ) : (
                          <Typography variant="body2" color="text.secondary">
                            Chưa gán
                          </Typography>
                        )}
                      </Box>
                    </TableCell>
                    <TableCell>{doctor.experience} năm</TableCell>
                    <TableCell align="right">
                      <IconButton
                        size="small"
                        color="primary"
                        onClick={() => handleOpenSpecialtyDialog(doctor)}
                      >
                        <LocalHospital />
                      </IconButton>
                      <IconButton size="small" color="primary">
                        <Edit />
                      </IconButton>
                      <IconButton
                        size="small"
                        color="error"
                        onClick={() => handleDelete(doctor.id)}
                      >
                        <Delete />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
            </TableBody>
          </Table>
        </TableContainer>

        <TablePagination
          component="div"
          count={doctors.length}
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

      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <form onSubmit={handleSubmit(onSubmit)}>
          <DialogTitle>Thêm bác sĩ mới</DialogTitle>
          <DialogContent>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
              <Controller
                name="email"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    fullWidth
                    label="Email"
                    type="email"
                    error={!!errors.email}
                    helperText={errors.email?.message}
                  />
                )}
              />
              <Controller
                name="name"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    fullWidth
                    label="Họ tên"
                    error={!!errors.name}
                    helperText={errors.name?.message}
                  />
                )}
              />
              <Controller
                name="phone"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    fullWidth
                    label="Số điện thoại"
                    error={!!errors.phone}
                    helperText={errors.phone?.message}
                  />
                )}
              />
              <Controller
                name="expertise"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    fullWidth
                    label="Chuyên môn"
                    error={!!errors.expertise}
                    helperText={errors.expertise?.message}
                  />
                )}
              />
              <Controller
                name="experience"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    fullWidth
                    label="Kinh nghiệm (năm)"
                    type="number"
                    error={!!errors.experience}
                    helperText={errors.experience?.message}
                  />
                )}
              />
            </Box>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseDialog}>Hủy</Button>
            <Button type="submit" variant="contained">
              Thêm
            </Button>
          </DialogActions>
        </form>
      </Dialog>

      <Dialog
        open={openSpecialtyDialog}
        onClose={handleCloseSpecialtyDialog}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Gán chuyên khoa cho bác sĩ</DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary" mb={2}>
            Bác sĩ: {selectedDoctor?.name}
          </Typography>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
            {specialties.map((specialty) => (
              <FormControlLabel
                key={specialty.id}
                control={
                  <Checkbox
                    checked={selectedSpecialties.includes(specialty.id)}
                    onChange={() => toggleSpecialty(specialty.id)}
                  />
                }
                label={specialty.name}
              />
            ))}
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseSpecialtyDialog}>Hủy</Button>
          <Button onClick={handleSaveSpecialties} variant="contained">
            Lưu
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Doctors;
