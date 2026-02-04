import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Container,
  Paper,
  Typography,
  Button,
  AppBar,
  Toolbar,
  Card,
  CardContent,
  Avatar,
  CircularProgress,
  Grid,
} from '@mui/material';
import {
  CalendarMonth,
  Add,
  History,
  Person,
  Logout,
  PendingActions,
  CheckCircle,
  Done,
} from '@mui/icons-material';
import { useAuth } from '../../contexts/AuthContext';
import { patientService } from '../../services/patientService';
import { toast } from 'react-toastify';
import type { Appointment } from '../../types';

const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    pending: 0,
    approved: 0,
    done: 0,
  });
  const [appointments, setAppointments] = useState<Appointment[]>([]);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    if (!user?.id) return;
    
    setLoading(true);
    try {
      const appointmentsData = await patientService.getAppointments(user.id);
      setAppointments(appointmentsData);
      
      const pending = appointmentsData.filter(a => a.status === 'PENDING').length;
      const approved = appointmentsData.filter(a => a.status === 'APPROVED').length;
      const done = appointmentsData.filter(a => a.status === 'DONE').length;
      
      setStats({ pending, approved, done });
    } catch (error) {
      console.error('Error loading dashboard data:', error);
      toast.error('Không thể tải dữ liệu');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    logout();
    toast.success('Đã đăng xuất');
    navigate('/patient/login');
  };

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: '#f5f5f5' }}>
      <AppBar position="static" elevation={2}>
        <Toolbar>
          <Typography variant="h6" sx={{ flexGrow: 1, fontWeight: 'bold' }}>
            Hệ thống đặt lịch khám
          </Typography>
          
          <Button color="inherit" startIcon={<CalendarMonth />} onClick={() => navigate('/patient/appointments')}>
            Lịch hẹn của tôi
          </Button>
          <Button color="inherit" startIcon={<Add />} onClick={() => navigate('/patient/booking')}>
            Đặt lịch khám
          </Button>
          <Button color="inherit" startIcon={<History />} onClick={() => navigate('/patient/medical-history')}>
            Lịch sử khám
          </Button>
          <Button color="inherit" startIcon={<Person />} onClick={() => navigate('/patient/profile')}>
            Thông tin cá nhân
          </Button>
          <Button color="inherit" startIcon={<Logout />} onClick={handleLogout}>
            Đăng xuất
          </Button>
        </Toolbar>
      </AppBar>

      <Container maxWidth="lg" sx={{ py: 4 }}>
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
            <CircularProgress />
          </Box>
        ) : (
          <>
            <Paper sx={{ p: 4, mb: 4, background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', color: 'white' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <Avatar sx={{ width: 64, height: 64, bgcolor: 'white', color: 'primary.main', mr: 2 }}>
                  {user?.name?.charAt(0)}
                </Avatar>
                <Box>
                  <Typography variant="h4" fontWeight="bold">
                    Xin chào, {user?.name}!
                  </Typography>
                  <Typography variant="body1" sx={{ opacity: 0.9 }}>
                    {user?.email}
                  </Typography>
                </Box>
              </Box>
            </Paper>

            <Grid container spacing={3} sx={{ mb: 4 }}>
              <Grid size={{ xs: 12, sm: 4 }}>
                <Card sx={{ bgcolor: '#fff3e0', boxShadow: 3 }}>
                  <CardContent>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                      <PendingActions sx={{ fontSize: 40, color: '#ff9800', mr: 2 }} />
                      <Box>
                        <Typography variant="h4" fontWeight="bold" color="#ff9800">
                          {stats.pending}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          Chờ duyệt
                        </Typography>
                      </Box>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>

              <Grid size={{ xs: 12, sm: 4 }}>
                <Card sx={{ bgcolor: '#e3f2fd', boxShadow: 3 }}>
                  <CardContent>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                      <CheckCircle sx={{ fontSize: 40, color: '#2196f3', mr: 2 }} />
                      <Box>
                        <Typography variant="h4" fontWeight="bold" color="#2196f3">
                          {stats.approved}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          Đã duyệt
                        </Typography>
                      </Box>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>

              <Grid size={{ xs: 12, sm: 4 }}>
                <Card sx={{ bgcolor: '#e8f5e9', boxShadow: 3 }}>
                  <CardContent>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                      <Done sx={{ fontSize: 40, color: '#4caf50', mr: 2 }} />
                      <Box>
                        <Typography variant="h4" fontWeight="bold" color="#4caf50">
                          {stats.done}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          Hoàn tất
                        </Typography>
                      </Box>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>

            <Grid container spacing={3}>
              <Grid size={{ xs: 12, sm: 6 }}>
                <Button
                  fullWidth
                  variant="contained"
                  size="large"
                  startIcon={<Add />}
                  onClick={() => navigate('/patient/booking')}
                  sx={{ py: 2, fontSize: '1.1rem' }}
                >
                  Đặt lịch mới
                </Button>
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <Button
                  fullWidth
                  variant="outlined"
                  size="large"
                  startIcon={<CalendarMonth />}
                  onClick={() => navigate('/patient/appointments')}
                  sx={{ py: 2, fontSize: '1.1rem' }}
                >
                  Xem lịch hẹn
                </Button>
              </Grid>
            </Grid>

            {appointments.length > 0 && (
              <Box sx={{ mt: 4 }}>
                <Typography variant="h5" fontWeight="bold" mb={2}>
                  Lịch hẹn sắp tới
                </Typography>
                {appointments
                  .filter(a => ['PENDING', 'APPROVED'].includes(a.status))
                  .slice(0, 3)
                  .map(appointment => (
                    <Card key={appointment.id} sx={{ mb: 2 }}>
                      <CardContent>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <Box>
                            <Typography variant="h6" fontWeight="bold">
                              {new Date(appointment.date).toLocaleDateString('vi-VN')} - {appointment.time}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                              Lý do: {appointment.reason || 'Không có'}
                            </Typography>
                          </Box>
                          <Button
                            variant="outlined"
                            size="small"
                            onClick={() => navigate('/patient/appointments')}
                          >
                            Chi tiết
                          </Button>
                        </Box>
                      </CardContent>
                    </Card>
                  ))}
              </Box>
            )}
          </>
        )}
      </Container>
    </Box>
  );
};

export default Dashboard;
