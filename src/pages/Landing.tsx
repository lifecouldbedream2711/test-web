import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, Container, Typography, Card, CardContent, CardActionArea } from '@mui/material';
import PersonIcon from '@mui/icons-material/Person';
import LocalHospitalIcon from '@mui/icons-material/LocalHospital';
import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings';

const Landing: React.FC = () => {
  const navigate = useNavigate();

  const roles = [
    {
      title: 'Bệnh nhân',
      description: 'Đặt lịch khám và quản lý lịch sử khám bệnh',
      icon: <PersonIcon sx={{ fontSize: 60 }} />,
      path: '/patient/login',
      color: '#2196f3',
    },
    {
      title: 'Bác sĩ',
      description: 'Quản lý lịch khám và hồ sơ bệnh nhân',
      icon: <LocalHospitalIcon sx={{ fontSize: 60 }} />,
      path: '/doctor/login',
      color: '#4caf50',
    },
    {
      title: 'Quản trị viên',
      description: 'Quản lý hệ thống và dữ liệu',
      icon: <AdminPanelSettingsIcon sx={{ fontSize: 60 }} />,
      path: '/admin/login',
      color: '#ff9800',
    },
  ];

  return (
    <Box
      sx={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        display: 'flex',
        alignItems: 'center',
        py: 4,
      }}
    >
      <Container maxWidth="lg">
        <Box sx={{ textAlign: 'center', mb: 6 }}>
          <Typography
            variant="h2"
            component="h1"
            sx={{
              color: 'white',
              fontWeight: 700,
              mb: 2,
              textShadow: '2px 2px 4px rgba(0,0,0,0.2)',
            }}
          >
            Hệ thống Đặt lịch Khám bệnh
          </Typography>
          <Typography
            variant="h5"
            sx={{
              color: 'rgba(255,255,255,0.9)',
              fontWeight: 300,
            }}
          >
            Chọn vai trò của bạn để tiếp tục
          </Typography>
        </Box>

        <Box
          sx={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: 4,
            justifyContent: 'center',
          }}
        >
          {roles.map((role) => (
            <Box
              key={role.title}
              sx={{
                flex: '1 1 300px',
                maxWidth: '350px',
                minWidth: '280px',
              }}
            >
              <Card
                sx={{
                  height: '100%',
                  transition: 'transform 0.3s ease, box-shadow 0.3s ease',
                  '&:hover': {
                    transform: 'translateY(-8px)',
                    boxShadow: '0 12px 24px rgba(0,0,0,0.3)',
                  },
                }}
              >
                <CardActionArea
                  onClick={() => navigate(role.path)}
                  sx={{
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    py: 4,
                  }}
                >
                  <CardContent sx={{ textAlign: 'center' }}>
                    <Box
                      sx={{
                        color: role.color,
                        mb: 2,
                      }}
                    >
                      {role.icon}
                    </Box>
                    <Typography
                      variant="h5"
                      component="h2"
                      sx={{ fontWeight: 600, mb: 1, color: role.color }}
                    >
                      {role.title}
                    </Typography>
                    <Typography variant="body1" color="text.secondary">
                      {role.description}
                    </Typography>
                  </CardContent>
                </CardActionArea>
              </Card>
            </Box>
          ))}
        </Box>

        <Box sx={{ mt: 6, textAlign: 'center' }}>
          <Typography
            variant="body2"
            sx={{
              color: 'rgba(255,255,255,0.8)',
            }}
          >
            Chưa có tài khoản?{' '}
            <Box
              component="span"
              onClick={() => navigate('/patient/register')}
              sx={{
                color: 'white',
                fontWeight: 600,
                cursor: 'pointer',
                textDecoration: 'underline',
                '&:hover': {
                  textDecoration: 'none',
                },
              }}
            >
              Đăng ký ngay
            </Box>
          </Typography>
        </Box>
      </Container>
    </Box>
  );
};

export default Landing;
