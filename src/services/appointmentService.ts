import { type Appointment, type AppointmentStatus } from '../types';
import appointmentsData from '../mocks/appointments.json';

const appointments = appointmentsData as Appointment[];

interface CreateAppointmentData {
  patientId: string;
  doctorId: string;
  serviceId: string;
  shiftId: string;
  slotId: string;
  date: string;
  time: string;
  reason: string;
}

export const appointmentService = {
  getAll: async (filters?: { 
    status?: AppointmentStatus; 
    doctorId?: string; 
    patientId?: string;
    startDate?: string;
    endDate?: string;
  }): Promise<Appointment[]> => {
    return new Promise((resolve) => {
      setTimeout(() => {
        let filtered = [...appointments];
        
        if (filters?.status) {
          filtered = filtered.filter(a => a.status === filters.status);
        }
        if (filters?.doctorId) {
          filtered = filtered.filter(a => a.doctorId === filters.doctorId);
        }
        if (filters?.patientId) {
          filtered = filtered.filter(a => a.patientId === filters.patientId);
        }
        if (filters?.startDate) {
          filtered = filtered.filter(a => a.date >= filters.startDate!);
        }
        if (filters?.endDate) {
          filtered = filtered.filter(a => a.date <= filters.endDate!);
        }
        
        filtered.sort((a, b) => {
          const dateCompare = b.date.localeCompare(a.date);
          if (dateCompare !== 0) return dateCompare;
          return b.time.localeCompare(a.time);
        });
        
        resolve(filtered);
      }, 300);
    });
  },

  getById: async (appointmentId: string): Promise<Appointment> => {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        const appointment = appointments.find(a => a.id === appointmentId);
        if (appointment) {
          resolve(appointment);
        } else {
          reject(new Error('Không tìm thấy lịch hẹn'));
        }
      }, 300);
    });
  },

  create: async (data: CreateAppointmentData): Promise<Appointment> => {
    return new Promise((resolve) => {
      setTimeout(() => {
        const newAppointment: Appointment = {
          ...data,
          id: `APT${Date.now()}`,
          status: 'PENDING',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
        resolve(newAppointment);
      }, 500);
    });
  },

  update: async (appointmentId: string, data: Partial<Appointment>): Promise<Appointment> => {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        const appointment = appointments.find(a => a.id === appointmentId);
        if (appointment) {
          const updatedAppointment: Appointment = {
            ...appointment,
            ...data,
            updatedAt: new Date().toISOString(),
          };
          resolve(updatedAppointment);
        } else {
          reject(new Error('Không tìm thấy lịch hẹn'));
        }
      }, 500);
    });
  },

  approve: async (appointmentId: string): Promise<Appointment> => {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        const appointment = appointments.find(a => a.id === appointmentId);
        if (appointment) {
          if (appointment.status !== 'PENDING') {
            reject(new Error('Chỉ có thể duyệt lịch hẹn đang chờ'));
            return;
          }
          const updatedAppointment: Appointment = {
            ...appointment,
            status: 'APPROVED',
            updatedAt: new Date().toISOString(),
          };
          resolve(updatedAppointment);
        } else {
          reject(new Error('Không tìm thấy lịch hẹn'));
        }
      }, 500);
    });
  },

  reject: async (appointmentId: string, rejectionReason: string): Promise<Appointment> => {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        const appointment = appointments.find(a => a.id === appointmentId);
        if (appointment) {
          if (appointment.status !== 'PENDING') {
            reject(new Error('Chỉ có thể từ chối lịch hẹn đang chờ'));
            return;
          }
          const updatedAppointment: Appointment = {
            ...appointment,
            status: 'REJECTED',
            rejectionReason,
            updatedAt: new Date().toISOString(),
          };
          resolve(updatedAppointment);
        } else {
          reject(new Error('Không tìm thấy lịch hẹn'));
        }
      }, 500);
    });
  },

  checkin: async (appointmentId: string): Promise<Appointment> => {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        const appointment = appointments.find(a => a.id === appointmentId);
        if (appointment) {
          if (appointment.status !== 'APPROVED') {
            reject(new Error('Chỉ có thể check-in lịch hẹn đã được duyệt'));
            return;
          }
          const updatedAppointment: Appointment = {
            ...appointment,
            status: 'CHECKED_IN',
            updatedAt: new Date().toISOString(),
          };
          resolve(updatedAppointment);
        } else {
          reject(new Error('Không tìm thấy lịch hẹn'));
        }
      }, 500);
    });
  },

  complete: async (appointmentId: string): Promise<Appointment> => {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        const appointment = appointments.find(a => a.id === appointmentId);
        if (appointment) {
          if (appointment.status !== 'CHECKED_IN') {
            reject(new Error('Chỉ có thể hoàn thành lịch hẹn đã check-in'));
            return;
          }
          const updatedAppointment: Appointment = {
            ...appointment,
            status: 'DONE',
            updatedAt: new Date().toISOString(),
          };
          resolve(updatedAppointment);
        } else {
          reject(new Error('Không tìm thấy lịch hẹn'));
        }
      }, 500);
    });
  },

  noShow: async (appointmentId: string): Promise<Appointment> => {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        const appointment = appointments.find(a => a.id === appointmentId);
        if (appointment) {
          if (appointment.status !== 'APPROVED') {
            reject(new Error('Chỉ có thể đánh dấu không đến lịch hẹn đã được duyệt'));
            return;
          }
          const updatedAppointment: Appointment = {
            ...appointment,
            status: 'NO_SHOW',
            updatedAt: new Date().toISOString(),
          };
          resolve(updatedAppointment);
        } else {
          reject(new Error('Không tìm thấy lịch hẹn'));
        }
      }, 500);
    });
  },

  cancel: async (appointmentId: string): Promise<Appointment> => {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        const appointment = appointments.find(a => a.id === appointmentId);
        if (appointment) {
          if (!['PENDING', 'APPROVED'].includes(appointment.status)) {
            reject(new Error('Không thể hủy lịch hẹn này'));
            return;
          }
          const updatedAppointment: Appointment = {
            ...appointment,
            status: 'CANCELLED',
            updatedAt: new Date().toISOString(),
          };
          resolve(updatedAppointment);
        } else {
          reject(new Error('Không tìm thấy lịch hẹn'));
        }
      }, 500);
    });
  },

  updateStatus: async (appointmentId: string, status: AppointmentStatus): Promise<Appointment> => {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        const appointment = appointments.find(a => a.id === appointmentId);
        if (appointment) {
          const updatedAppointment: Appointment = {
            ...appointment,
            status,
            updatedAt: new Date().toISOString(),
          };
          resolve(updatedAppointment);
        } else {
          reject(new Error('Không tìm thấy lịch hẹn'));
        }
      }, 500);
    });
  },
};
