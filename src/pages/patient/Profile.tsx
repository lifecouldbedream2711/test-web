import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import {
  Container,
  Box,
  Paper,
  Typography,
  TextField,
  Button,
  MenuItem,
  CircularProgress,
  AppBar,
  Toolbar,
  IconButton,
  Avatar,
  Grid,
} from '@mui/material';
import { ArrowBack, Save } from '@mui/icons-material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { vi } from 'date-fns/locale';
import { toast } from 'react-toastify';
import { useAuth } from '../../contexts/AuthContext';
import { patientService } from '../../services/patientService';

const schema = yup.object().shape({
  name: yup.string().required('Họ tên là bắt buộc'),
  phone: yup.string()
    .matches(/^[0-9]{10}$/, 'Số điện thoại không hợp lệ')
    .required('Số điện thoại là bắt buộc'),
  address: yup.string(),
  dateOfBirth: yup.date().nullable().required('Ngày sinh là bắt buộc'),
  gender: yup.string().required('Giới tính là bắt buộc'),
});

interface ProfileFormData {
  name: string;
  phone: string;
  address?: string;
  dateOfBirth: Date | null;
  gender: string;
}

const Profile: React.FC = () => {
  const navigate = useNavigate();
  const { user, updateUser } = useAuth();
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);

  const { control, handleSubmit, reset, formState: { errors } } = useForm<ProfileFormData>({
    resolver: yupResolver(schema) as any,
    defaultValues: {
      name: '',
      phone: '',
      address: '',
      dateOfBirth: null,
      gender: '',
    },
  });

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    if (!user?.id) return;
    
    setInitialLoading(true);
    try {
      const profile = await patientService.getProfile(user.id);
      reset({
        name: profile.name,
        phone: profile.phone,
        address: profile.address || '',
        dateOfBirth: profile.dateOfBirth ? new Date(profile.dateOfBirth) : null,
        gender: profile.gender || '',
      });
    } catch (error) {
      console.error('Error loading profile:', error);
      toast.error('Không thể tải thông tin cá nhân');
    } finally {
      setInitialLoading(false);
    }
  };

  const onSubmit = async (data: ProfileFormData) => {
    if (!user?.id) return;
    
    setLoading(true);
    try {
      const updatedProfile = await patientService.updateProfile(user.id, {
        name: data.name,
        phone: data.phone,
        address: data.address,
        dateOfBirth: data.dateOfBirth ? data.dateOfBirth.toISOString().split('T')[0] : undefined,
        gender: data.gender as 'MALE' | 'FEMALE' | 'OTHER',
      });
      updateUser(updatedProfile);
      toast.success('Cập nhật thông tin thành công!');
    } catch (error) {
      console.error('Error updating profile:', error);
      toast.error('Không thể cập nhật thông tin');
    } finally {
      setLoading(false);
    }
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
              Thông tin cá nhân
            </Typography>
          </Toolbar>
        </AppBar>

        <Container maxWidth="md" sx={{ py: 4 }}>
          {initialLoading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
              <CircularProgress />
            </Box>
          ) : (
            <Paper elevation={3} sx={{ p: 4, borderRadius: 2 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 4 }}>
                <Avatar sx={{ width: 80, height: 80, bgcolor: 'primary.main', mr: 3 }}>
                  {user?.name?.charAt(0)}
                </Avatar>
                <Box>
                  <Typography variant="h5" fontWeight="bold">
                    {user?.name}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {user?.email}
                  </Typography>
                </Box>
              </Box>

              <form onSubmit={handleSubmit(onSubmit)}>
                <Grid container spacing={3}>
                  <Grid size={12}>
                    <Controller
                      name="name"
                      control={control}
                      render={({ field }) => (
                        <TextField
                          {...field}
                          fullWidth
                          label="Họ và tên"
                          error={!!errors.name}
                          helperText={errors.name?.message}
                        />
                      )}
                    />
                  </Grid>

                  <Grid size={{ xs: 12, sm: 6 }}>
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
                  </Grid>

                  <Grid size={{ xs: 12, sm: 6 }}>
                    <Controller
                      name="gender"
                      control={control}
                      render={({ field }) => (
                        <TextField
                          {...field}
                          fullWidth
                          select
                          label="Giới tính"
                          error={!!errors.gender}
                          helperText={errors.gender?.message}
                        >
                          <MenuItem value="MALE">Nam</MenuItem>
                          <MenuItem value="FEMALE">Nữ</MenuItem>
                          <MenuItem value="OTHER">Khác</MenuItem>
                        </TextField>
                      )}
                    />
                  </Grid>

                  <Grid size={{ xs: 12, sm: 6 }}>
                    <Controller
                      name="dateOfBirth"
                      control={control}
                      render={({ field }) => (
                        <DatePicker
                          {...field}
                          label="Ngày sinh"
                          format="dd/MM/yyyy"
                          slotProps={{
                            textField: {
                              fullWidth: true,
                              error: !!errors.dateOfBirth,
                              helperText: errors.dateOfBirth?.message,
                            },
                          }}
                        />
                      )}
                    />
                  </Grid>

                  <Grid size={12}>
                    <Controller
                      name="address"
                      control={control}
                      render={({ field }) => (
                        <TextField
                          {...field}
                          fullWidth
                          label="Địa chỉ"
                          multiline
                          rows={2}
                          error={!!errors.address}
                          helperText={errors.address?.message}
                        />
                      )}
                    />
                  </Grid>

                  <Grid size={12}>
                    <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
                      <Button
                        variant="outlined"
                        onClick={() => navigate('/patient/dashboard')}
                      >
                        Hủy
                      </Button>
                      <Button
                        type="submit"
                        variant="contained"
                        startIcon={<Save />}
                        disabled={loading}
                      >
                        {loading ? <CircularProgress size={24} /> : 'Lưu thay đổi'}
                      </Button>
                    </Box>
                  </Grid>
                </Grid>
              </form>
            </Paper>
          )}
        </Container>
      </Box>
    </LocalizationProvider>
  );
};

export default Profile;
