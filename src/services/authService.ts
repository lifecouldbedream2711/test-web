import { type LoginCredentials, type RegisterData, type User } from '../types';
import doctorsData from '../mocks/doctors.json';
import patientsData from '../mocks/patients.json';

const doctors = doctorsData as User[];
const patients = patientsData as User[];

const MOCK_PASSWORD = '123456';

export const authService = {
  login: async (credentials: LoginCredentials): Promise<{ token: string; user: User }> => {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        const allUsers = [...doctors, ...patients, {
          id: 'ADMIN001',
          email: 'admin@hospital.vn',
          name: 'Quản trị viên',
          phone: '0900000000',
          role: 'ADMIN' as const,
          status: 'ACTIVE' as const,
          createdAt: '2024-01-01T00:00:00Z'
        }];

        const user = allUsers.find(u => u.email === credentials.email);
        
        if (!user || credentials.password !== MOCK_PASSWORD) {
          reject(new Error('Email hoặc mật khẩu không đúng'));
          return;
        }

        const token = `mock_token_${user.id}_${Date.now()}`;
        resolve({ token, user });
      }, 500);
    });
  },

  register: async (data: RegisterData): Promise<{ token: string; user: User }> => {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        const allUsers = [...doctors, ...patients];
        const existingUser = allUsers.find(u => u.email === data.email);
        
        if (existingUser) {
          reject(new Error('Email đã được sử dụng'));
          return;
        }

        const newUser: User = {
          id: `P${Date.now()}`,
          email: data.email,
          name: data.name,
          phone: data.phone,
          role: 'PATIENT',
          dateOfBirth: data.dateOfBirth,
          gender: data.gender,
          address: data.address,
          status: 'ACTIVE',
          createdAt: new Date().toISOString(),
        };

        const token = `mock_token_${newUser.id}_${Date.now()}`;
        resolve({ token, user: newUser });
      }, 500);
    });
  },

  logout: async (): Promise<void> => {
    return new Promise((resolve) => {
      setTimeout(() => {
        localStorage.removeItem('auth_token');
        localStorage.removeItem('auth_user');
        resolve();
      }, 300);
    });
  },

  getCurrentUser: async (): Promise<User> => {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        const storedUser = localStorage.getItem('auth_user');
        if (storedUser) {
          resolve(JSON.parse(storedUser));
        } else {
          reject(new Error('Không tìm thấy thông tin người dùng'));
        }
      }, 300);
    });
  },

  refreshToken: async (): Promise<{ token: string }> => {
    return new Promise((resolve) => {
      setTimeout(() => {
        const token = `mock_token_refresh_${Date.now()}`;
        resolve({ token });
      }, 300);
    });
  },
};
