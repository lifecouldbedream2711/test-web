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
  Switch,
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
import { specialtyService } from '../../services/specialtyService';
import type { Specialty } from '../../types';

const schema = yup.object().shape({
  name: yup.string().required('Tên chuyên khoa là bắt buộc'),
  description: yup.string().required('Mô tả là bắt buộc'),
});

interface SpecialtyFormData {
  name: string;
  description: string;
}

const Specialties: React.FC = () => {
  const [specialties, setSpecialties] = useState<Specialty[]>([]);
  const [loading, setLoading] = useState(true);
  const [openDialog, setOpenDialog] = useState(false);
  const [editingSpecialty, setEditingSpecialty] = useState<Specialty | null>(null);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  const { control, handleSubmit, reset, formState: { errors } } = useForm<SpecialtyFormData>({
    resolver: yupResolver(schema),
    defaultValues: {
      name: '',
      description: '',
    },
  });

  useEffect(() => {
    loadSpecialties();
  }, []);

  const loadSpecialties = async () => {
    try {
      setLoading(true);
      const data = await specialtyService.getAll();
      setSpecialties(data);
    } catch (error) {
      toast.error('Không thể tải danh sách chuyên khoa');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenDialog = (specialty?: Specialty) => {
    if (specialty) {
      setEditingSpecialty(specialty);
      reset({
        name: specialty.name,
        description: specialty.description,
      });
    } else {
      setEditingSpecialty(null);
      reset({
        name: '',
        description: '',
      });
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setEditingSpecialty(null);
    reset();
  };

  const onSubmit = async (data: SpecialtyFormData) => {
    try {
      if (editingSpecialty) {
        await specialtyService.update(editingSpecialty.id, data);
        toast.success('Đã cập nhật chuyên khoa');
      } else {
        await specialtyService.create({
          ...data,
          status: 'ACTIVE',
        });
        toast.success('Chuyên khoa đã được thêm thành công');
      }
      handleCloseDialog();
      loadSpecialties();
    } catch (error) {
      toast.error(editingSpecialty ? 'Không thể cập nhật chuyên khoa' : 'Không thể thêm chuyên khoa');
    }
  };

  const handleDelete = async (specialtyId: string) => {
    if (!window.confirm('Bạn có chắc muốn xóa chuyên khoa này?')) return;
    try {
      await specialtyService.delete(specialtyId);
      toast.success('Đã xóa chuyên khoa');
      loadSpecialties();
    } catch (error) {
      toast.error('Không thể xóa chuyên khoa');
    }
  };

  const handleToggleStatus = async (specialty: Specialty) => {
    try {
      const newStatus = specialty.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE';
      await specialtyService.update(specialty.id, { status: newStatus });
      toast.success(`Đã ${newStatus === 'ACTIVE' ? 'kích hoạt' : 'vô hiệu hóa'} chuyên khoa`);
      loadSpecialties();
    } catch (error) {
      toast.error('Không thể cập nhật trạng thái');
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
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4" fontWeight="bold">
          Quản lý chuyên khoa
        </Typography>
        <Button variant="contained" startIcon={<Add />} onClick={() => handleOpenDialog()}>
          Thêm chuyên khoa
        </Button>
      </Box>

      <Paper sx={{ borderRadius: 2, p: 3 }}>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Tên chuyên khoa</TableCell>
                <TableCell>Mô tả</TableCell>
                <TableCell>Trạng thái</TableCell>
                <TableCell align="right">Thao tác</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {specialties
                .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                .map((specialty) => (
                  <TableRow key={specialty.id} hover>
                    <TableCell>
                      <Typography fontWeight={500}>{specialty.name}</Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" color="text.secondary">
                        {specialty.description}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Box display="flex" alignItems="center" gap={1}>
                        <Switch
                          checked={specialty.status === 'ACTIVE'}
                          onChange={() => handleToggleStatus(specialty)}
                          size="small"
                        />
                        <Chip
                          label={specialty.status === 'ACTIVE' ? 'Hoạt động' : 'Vô hiệu hóa'}
                          color={specialty.status === 'ACTIVE' ? 'success' : 'default'}
                          size="small"
                        />
                      </Box>
                    </TableCell>
                    <TableCell align="right">
                      <IconButton
                        size="small"
                        color="primary"
                        onClick={() => handleOpenDialog(specialty)}
                      >
                        <Edit />
                      </IconButton>
                      <IconButton
                        size="small"
                        color="error"
                        onClick={() => handleDelete(specialty.id)}
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
          count={specialties.length}
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
            {editingSpecialty ? 'Cập nhật chuyên khoa' : 'Thêm chuyên khoa mới'}
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
                    label="Tên chuyên khoa"
                    error={!!errors.name}
                    helperText={errors.name?.message}
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
                    error={!!errors.description}
                    helperText={errors.description?.message}
                  />
                )}
              />
            </Box>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseDialog}>Hủy</Button>
            <Button type="submit" variant="contained">
              {editingSpecialty ? 'Cập nhật' : 'Thêm'}
            </Button>
          </DialogActions>
        </form>
      </Dialog>
    </Box>
  );
};

export default Specialties;
