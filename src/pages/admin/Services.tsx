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
  MenuItem,
  FormControl,
  InputLabel,
  Select,
} from '@mui/material';
import {
  Add,
  Edit,
  Delete,
} from '@mui/icons-material';
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { toast } from 'react-toastify';
import { adminService } from '../../services/adminService';
import { serviceService } from '../../services/serviceService';
import type { Service, Specialty } from '../../types';

const schema = yup.object({
  name: yup.string().required('Tên dịch vụ là bắt buộc'),
  specialtyId: yup.string().required('Chuyên khoa là bắt buộc'),
  price: yup.number().min(0, 'Giá không hợp lệ').required('Giá là bắt buộc'),
  duration: yup.number().min(1, 'Thời gian không hợp lệ').required('Thời gian là bắt buộc'),
  description: yup.string().optional().default(''),
});

interface ServiceFormData {
  name: string;
  specialtyId: string;
  price: number;
  duration: number;
  description: string;
}

const Services: React.FC = () => {
  const [services, setServices] = useState<Service[]>([]);
  const [specialties, setSpecialties] = useState<Specialty[]>([]);
  const [filteredServices, setFilteredServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [openDialog, setOpenDialog] = useState(false);
  const [editingService, setEditingService] = useState<Service | null>(null);
  const [filterSpecialty, setFilterSpecialty] = useState<string>('');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  const { control, handleSubmit, reset, formState: { errors } } = useForm<ServiceFormData>({
    resolver: yupResolver(schema),
    defaultValues: {
      name: '',
      specialtyId: '',
      price: 0,
      duration: 30,
      description: '',
    },
  });

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    filterServices();
  }, [services, filterSpecialty]);

  const loadData = async () => {
    try {
      setLoading(true);
      const [servicesData, specialtiesData] = await Promise.all([
        adminService.getAllServices(),
        adminService.getAllSpecialties(),
      ]);
      setServices(servicesData);
      setSpecialties(specialtiesData);
    } catch (error) {
      toast.error('Không thể tải dữ liệu');
    } finally {
      setLoading(false);
    }
  };

  const filterServices = () => {
    if (filterSpecialty) {
      setFilteredServices(services.filter((s) => s.specialtyId === filterSpecialty));
    } else {
      setFilteredServices(services);
    }
    setPage(0);
  };

  const handleOpenDialog = (service?: Service) => {
    if (service) {
      setEditingService(service);
      reset({
        name: service.name,
        specialtyId: service.specialtyId,
        price: service.price,
        duration: service.duration,
        description: service.description || '',
      });
    } else {
      setEditingService(null);
      reset({
        name: '',
        specialtyId: '',
        price: 0,
        duration: 30,
        description: '',
      });
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setEditingService(null);
    reset();
  };

  const onSubmit = async (data: ServiceFormData) => {
    try {
      if (editingService) {
        await serviceService.update(editingService.id, data);
        toast.success('Đã cập nhật dịch vụ');
      } else {
        await serviceService.create({
          ...data,
          status: 'ACTIVE',
        });
        toast.success('Dịch vụ đã được thêm thành công');
      }
      handleCloseDialog();
      loadData();
    } catch (error) {
      toast.error(editingService ? 'Không thể cập nhật dịch vụ' : 'Không thể thêm dịch vụ');
    }
  };

  const handleDelete = async (serviceId: string) => {
    if (!window.confirm('Bạn có chắc muốn xóa dịch vụ này?')) return;
    try {
      await serviceService.delete(serviceId);
      toast.success('Đã xóa dịch vụ');
      loadData();
    } catch (error) {
      toast.error('Không thể xóa dịch vụ');
    }
  };

  const getSpecialtyName = (specialtyId: string) => {
    const specialty = specialties.find((s) => s.id === specialtyId);
    return specialty?.name || specialtyId;
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(price);
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
          Quản lý dịch vụ
        </Typography>
        <Button variant="contained" startIcon={<Add />} onClick={() => handleOpenDialog()}>
          Thêm dịch vụ
        </Button>
      </Box>

      <Paper sx={{ borderRadius: 2, p: 3 }}>
        <Box mb={3}>
          <FormControl sx={{ minWidth: 250 }}>
            <InputLabel>Lọc theo chuyên khoa</InputLabel>
            <Select
              value={filterSpecialty}
              onChange={(e) => setFilterSpecialty(e.target.value)}
              label="Lọc theo chuyên khoa"
            >
              <MenuItem value="">Tất cả</MenuItem>
              {specialties.map((specialty) => (
                <MenuItem key={specialty.id} value={specialty.id}>
                  {specialty.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Box>

        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Tên dịch vụ</TableCell>
                <TableCell>Chuyên khoa</TableCell>
                <TableCell>Giá</TableCell>
                <TableCell>Thời gian</TableCell>
                <TableCell>Trạng thái</TableCell>
                <TableCell align="right">Thao tác</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredServices
                .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                .map((service) => (
                  <TableRow key={service.id} hover>
                    <TableCell>
                      <Typography fontWeight={500}>{service.name}</Typography>
                      {service.description && (
                        <Typography variant="caption" color="text.secondary">
                          {service.description}
                        </Typography>
                      )}
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={getSpecialtyName(service.specialtyId)}
                        size="small"
                        color="primary"
                        variant="outlined"
                      />
                    </TableCell>
                    <TableCell>
                      <Typography fontWeight={500}>{formatPrice(service.price)}</Typography>
                    </TableCell>
                    <TableCell>{service.duration} phút</TableCell>
                    <TableCell>
                      <Chip
                        label={service.status === 'ACTIVE' ? 'Hoạt động' : 'Vô hiệu hóa'}
                        color={service.status === 'ACTIVE' ? 'success' : 'default'}
                        size="small"
                      />
                    </TableCell>
                    <TableCell align="right">
                      <IconButton
                        size="small"
                        color="primary"
                        onClick={() => handleOpenDialog(service)}
                      >
                        <Edit />
                      </IconButton>
                      <IconButton
                        size="small"
                        color="error"
                        onClick={() => handleDelete(service.id)}
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
          count={filteredServices.length}
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
          <DialogTitle>
            {editingService ? 'Cập nhật dịch vụ' : 'Thêm dịch vụ mới'}
          </DialogTitle>
          <DialogContent>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
              <Controller
                name="name"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    fullWidth
                    label="Tên dịch vụ"
                    error={!!errors.name}
                    helperText={errors.name?.message}
                  />
                )}
              />
              <Controller
                name="specialtyId"
                control={control}
                render={({ field }) => (
                  <FormControl fullWidth error={!!errors.specialtyId}>
                    <InputLabel>Chuyên khoa</InputLabel>
                    <Select {...field} label="Chuyên khoa">
                      {specialties.map((specialty) => (
                        <MenuItem key={specialty.id} value={specialty.id}>
                          {specialty.name}
                        </MenuItem>
                      ))}
                    </Select>
                    {errors.specialtyId && (
                      <Typography variant="caption" color="error" sx={{ mt: 0.5, ml: 2 }}>
                        {errors.specialtyId.message}
                      </Typography>
                    )}
                  </FormControl>
                )}
              />
              <Controller
                name="price"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    fullWidth
                    label="Giá (VND)"
                    type="number"
                    error={!!errors.price}
                    helperText={errors.price?.message}
                  />
                )}
              />
              <Controller
                name="duration"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    fullWidth
                    label="Thời gian (phút)"
                    type="number"
                    error={!!errors.duration}
                    helperText={errors.duration?.message}
                  />
                )}
              />
              <Controller
                name="description"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    fullWidth
                    label="Mô tả"
                    multiline
                    rows={3}
                  />
                )}
              />
            </Box>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseDialog}>Hủy</Button>
            <Button type="submit" variant="contained">
              {editingService ? 'Cập nhật' : 'Thêm'}
            </Button>
          </DialogActions>
        </form>
      </Dialog>
    </Box>
  );
};

export default Services;
