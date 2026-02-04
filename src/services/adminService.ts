import { type User, type Doctor, type Patient, type Specialty, type Service, type Shift, type Appointment, type MedicalRecord, type Prescription } from '../types';
import doctorsData from '../mocks/doctors.json';
import patientsData from '../mocks/patients.json';
import specialtiesData from '../mocks/specialties.json';
import servicesData from '../mocks/services.json';
import shiftsData from '../mocks/shifts.json';
import appointmentsData from '../mocks/appointments.json';
import medicalRecordsData from '../mocks/medicalRecords.json';
import prescriptionsData from '../mocks/prescriptions.json';

const doctors = doctorsData as Doctor[];
const patients = patientsData as Patient[];
const specialties = specialtiesData as Specialty[];
const services = servicesData as Service[];
const shifts = shiftsData as Shift[];
const appointments = appointmentsData as Appointment[];
const medicalRecords = medicalRecordsData as MedicalRecord[];
const prescriptions = prescriptionsData as Prescription[];

export const adminService = {
  getDashboardStats: async (): Promise<{
    totalPatients: number;
    totalDoctors: number;
    totalAppointments: number;
    pendingAppointments: number;
    todayAppointments: number;
  }> => {
    return new Promise((resolve) => {
      setTimeout(() => {
        const today = new Date().toISOString().split('T')[0];
        resolve({
          totalPatients: patients.length,
          totalDoctors: doctors.length,
          totalAppointments: appointments.length,
          pendingAppointments: appointments.filter(a => a.status === 'PENDING').length,
          todayAppointments: appointments.filter(a => a.date === today).length,
        });
      }, 300);
    });
  },

  getAllUsers: async (role?: string): Promise<User[]> => {
    return new Promise((resolve) => {
      setTimeout(() => {
        let users: User[] = [...doctors, ...patients];
        if (role) {
          users = users.filter(u => u.role === role);
        }
        resolve(users);
      }, 300);
    });
  },

  getUserById: async (userId: string): Promise<User> => {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        const user = [...doctors, ...patients].find(u => u.id === userId);
        if (user) {
          resolve(user);
        } else {
          reject(new Error('Không tìm thấy người dùng'));
        }
      }, 300);
    });
  },

  updateUserStatus: async (userId: string, status: 'ACTIVE' | 'INACTIVE' | 'SUSPENDED'): Promise<User> => {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        const user = [...doctors, ...patients].find(u => u.id === userId);
        if (user) {
          const updatedUser = { ...user, status };
          resolve(updatedUser);
        } else {
          reject(new Error('Không tìm thấy người dùng'));
        }
      }, 500);
    });
  },

  getAllDoctors: async (): Promise<Doctor[]> => {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve(doctors as Doctor[]);
      }, 300);
    });
  },

  getAllPatients: async (): Promise<Patient[]> => {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve(patients as Patient[]);
      }, 300);
    });
  },

  getAllSpecialties: async (): Promise<Specialty[]> => {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve(specialties);
      }, 300);
    });
  },

  getAllServices: async (): Promise<Service[]> => {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve(services);
      }, 300);
    });
  },

  getAllShifts: async (): Promise<Shift[]> => {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve(shifts);
      }, 300);
    });
  },

  getAllAppointments: async (): Promise<Appointment[]> => {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve(appointments);
      }, 300);
    });
  },

  getAllMedicalRecords: async (): Promise<MedicalRecord[]> => {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve(medicalRecords);
      }, 300);
    });
  },

  getAllPrescriptions: async (): Promise<Prescription[]> => {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve(prescriptions);
      }, 300);
    });
  },

  createDoctor: async (data: Omit<Doctor, 'id' | 'role' | 'createdAt' | 'updatedAt'>): Promise<Doctor> => {
    return new Promise((resolve) => {
      setTimeout(() => {
        const newDoctor: Doctor = {
          ...data,
          id: `D${Date.now()}`,
          role: 'DOCTOR',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
        resolve(newDoctor);
      }, 500);
    });
  },

  updateDoctor: async (doctorId: string, data: Partial<Doctor>): Promise<Doctor> => {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        const doctor = doctors.find(d => d.id === doctorId);
        if (doctor) {
          const updatedDoctor: Doctor = {
            ...(doctor as Doctor),
            ...data,
            updatedAt: new Date().toISOString(),
          };
          resolve(updatedDoctor);
        } else {
          reject(new Error('Không tìm thấy bác sĩ'));
        }
      }, 500);
    });
  },

  deleteDoctor: async (doctorId: string): Promise<void> => {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        const doctor = doctors.find(d => d.id === doctorId);
        if (doctor) {
          resolve();
        } else {
          reject(new Error('Không tìm thấy bác sĩ'));
        }
      }, 500);
    });
  },
};
