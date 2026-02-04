import React from 'react';
import Drawer from '@mui/material/Drawer';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import Toolbar from '@mui/material/Toolbar';
import Divider from '@mui/material/Divider';
import DashboardIcon from '@mui/icons-material/Dashboard';
import PeopleIcon from '@mui/icons-material/People';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import LocalHospitalIcon from '@mui/icons-material/LocalHospital';
import MedicalServicesIcon from '@mui/icons-material/MedicalServices';
import ScheduleIcon from '@mui/icons-material/Schedule';
import FolderIcon from '@mui/icons-material/Folder';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

const DRAWER_WIDTH = 240;

interface MenuItem {
  text: string;
  icon: React.ReactElement;
  path: string;
  roles: string[];
}

const menuItems: MenuItem[] = [
  { text: 'Dashboard', icon: <DashboardIcon />, path: '/admin/dashboard', roles: ['ADMIN'] },
  { text: 'Người dùng', icon: <PeopleIcon />, path: '/admin/users', roles: ['ADMIN'] },
  { text: 'Bác sĩ', icon: <LocalHospitalIcon />, path: '/admin/doctors', roles: ['ADMIN'] },
  { text: 'Chuyên khoa', icon: <MedicalServicesIcon />, path: '/admin/specialties', roles: ['ADMIN'] },
  { text: 'Dịch vụ', icon: <MedicalServicesIcon />, path: '/admin/services', roles: ['ADMIN'] },
  { text: 'Ca làm việc', icon: <ScheduleIcon />, path: '/admin/shifts', roles: ['ADMIN'] },
  { text: 'Lịch hẹn', icon: <CalendarTodayIcon />, path: '/admin/appointments', roles: ['ADMIN'] },
  
  { text: 'Dashboard', icon: <DashboardIcon />, path: '/doctor/dashboard', roles: ['DOCTOR'] },
  { text: 'Lịch làm việc', icon: <ScheduleIcon />, path: '/doctor/schedule', roles: ['DOCTOR'] },
  { text: 'Lịch hẹn', icon: <CalendarTodayIcon />, path: '/doctor/appointments', roles: ['DOCTOR'] },
  { text: 'Bệnh án', icon: <FolderIcon />, path: '/doctor/medical-records', roles: ['DOCTOR'] },
];

interface SidebarProps {
  open: boolean;
  onClose?: () => void;
  variant?: 'permanent' | 'temporary';
}

export const Sidebar: React.FC<SidebarProps> = ({ 
  open, 
  onClose,
  variant = 'permanent' 
}) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();

  const filteredMenuItems = menuItems.filter(item => 
    user && item.roles.includes(user.role)
  );

  const handleNavigation = (path: string) => {
    navigate(path);
    if (onClose) onClose();
  };

  const drawer = (
    <>
      <Toolbar />
      <Divider />
      <List>
        {filteredMenuItems.map((item) => (
          <ListItem key={item.path} disablePadding>
            <ListItemButton 
              selected={location.pathname === item.path}
              onClick={() => handleNavigation(item.path)}
            >
              <ListItemIcon>
                {item.icon}
              </ListItemIcon>
              <ListItemText primary={item.text} />
            </ListItemButton>
          </ListItem>
        ))}
      </List>
    </>
  );

  return (
    <Drawer
      variant={variant}
      open={open}
      onClose={onClose}
      sx={{
        width: DRAWER_WIDTH,
        flexShrink: 0,
        '& .MuiDrawer-paper': {
          width: DRAWER_WIDTH,
          boxSizing: 'border-box',
        },
      }}
    >
      {drawer}
    </Drawer>
  );
};
