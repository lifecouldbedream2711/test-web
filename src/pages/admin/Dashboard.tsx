import React, { useEffect, useState } from 'react';
import {
  Box,
  Grid,
  Paper,
  Typography,
  Card,
  CardContent,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  CircularProgress,
} from '@mui/material';
import {
  People,
  LocalHospital,
  EventNote,
  PendingActions,
} from '@mui/icons-material';
import { adminService } from '../../services/adminService';
import { appointmentService } from '../../services/appointmentService';
import { format } from 'date-fns';
import { vi } from 'date-fns/locale';
import type { Appointment } from '../../types';

interface DashboardStats {
  totalPatients: number;
  totalDoctors: number;
  totalAppointments: number;
  pendingAppointments: number;
  todayAppointments: number;
}

const Dashboard: React.FC = () => {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [recentAppointments, setRecentAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      const [statsData, appointmentsData] = await Promise.all([
        adminService.getDashboardStats(),
        appointmentService.getAll(),
      ]);
      setStats(statsData);
      setRecentAppointments(appointmentsData.slice(0, 10));
    } catch (error) {
      console.error('Error loading dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, 'default' | 'warning' | 'success' | 'info' | 'error'> = {
      PENDING: 'warning',
      APPROVED: 'info',
      CHECKED_IN: 'success',
      DONE: 'success',
      CANCELLED: 'error',
      REJECTED: 'error',
    };
    return colors[status] || 'default';
  };

  const getStatusText = (status: string) => {
    const texts: Record<string, string> = {
      PENDING: 'Chờ duyệt',
      APPROVED: 'Đã duyệt',
      CHECKED_IN: 'Đã check-in',
      DONE: 'Hoàn thành',
      CANCELLED: 'Đã hủy',
      REJECTED: 'Từ chối',
    };
    return texts[status] || status;
  };

  const statsCards = [
    {
      title: 'Lịch hẹn hôm nay',
      value: stats?.todayAppointments || 0,
      icon: <EventNote sx={{ fontSize: 40 }} />,
      color: '#1976d2',
      bgColor: '#e3f2fd',
    },
    {
      title: 'Chờ duyệt',
      value: stats?.pendingAppointments || 0,
      icon: <PendingActions sx={{ fontSize: 40 }} />,
      color: '#ed6c02',
      bgColor: '#fff4e5',
    },
    {
      title: 'Tổng bệnh nhân',
      value: stats?.totalPatients || 0,
      icon: <People sx={{ fontSize: 40 }} />,
      color: '#2e7d32',
      bgColor: '#e8f5e9',
    },
    {
      title: 'Tổng bác sĩ',
      value: stats?.totalDoctors || 0,
      icon: <LocalHospital sx={{ fontSize: 40 }} />,
      color: '#9c27b0',
      bgColor: '#f3e5f5',
    },
  ];

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      <Typography variant="h4" fontWeight="bold" mb={3}>
        Dashboard
      </Typography>

      <Grid container spacing={3} mb={4}>
        {statsCards.map((card, index) => (
          <Grid size={{ xs: 12, sm: 6, md: 3 }} key={index}>
            <Card
              elevation={0}
              sx={{
                border: '1px solid #e0e0e0',
                borderRadius: 2,
                transition: 'transform 0.2s, box-shadow 0.2s',
                '&:hover': {
                  transform: 'translateY(-4px)',
                  boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
                },
              }}
            >
              <CardContent>
                <Box display="flex" justifyContent="space-between" alignItems="flex-start">
                  <Box>
                    <Typography color="text.secondary" variant="body2" mb={1}>
                      {card.title}
                    </Typography>
                    <Typography variant="h4" fontWeight="bold" color={card.color}>
                      {card.value}
                    </Typography>
                  </Box>
                  <Box
                    sx={{
                      bgcolor: card.bgColor,
                      color: card.color,
                      p: 1.5,
                      borderRadius: 2,
                    }}
                  >
                    {card.icon}
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      <Paper sx={{ p: 3, borderRadius: 2 }}>
        <Typography variant="h6" fontWeight="bold" mb={3}>
          Lịch hẹn gần đây
        </Typography>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Mã lịch hẹn</TableCell>
                <TableCell>Ngày giờ</TableCell>
                <TableCell>Lý do</TableCell>
                <TableCell>Trạng thái</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {recentAppointments.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} align="center">
                    <Typography color="text.secondary">Không có lịch hẹn</Typography>
                  </TableCell>
                </TableRow>
              ) : (
                recentAppointments.map((appointment) => (
                  <TableRow key={appointment.id} hover>
                    <TableCell>{appointment.id}</TableCell>
                    <TableCell>
                      {format(new Date(appointment.date), 'dd/MM/yyyy', { locale: vi })} - {appointment.time}
                    </TableCell>
                    <TableCell>{appointment.reason}</TableCell>
                    <TableCell>
                      <Chip
                        label={getStatusText(appointment.status)}
                        color={getStatusColor(appointment.status)}
                        size="small"
                      />
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>
    </Box>
  );
};

export default Dashboard;
