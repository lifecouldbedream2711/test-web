import { type Patient, type Appointment, type MedicalRecord } from '../types';
import patientsData from '../mocks/patients.json';
import appointmentsData from '../mocks/appointments.json';
import medicalRecordsData from '../mocks/medicalRecords.json';

const patients = patientsData as Patient[];
const appointments = appointmentsData as Appointment[];
const medicalRecords = medicalRecordsData as MedicalRecord[];

export const patientService = {
  getProfile: async (patientId: string): Promise<Patient> => {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        const patient = patients.find(p => p.id === patientId);
        if (patient) {
          resolve(patient as Patient);
        } else {
          reject(new Error('Không tìm thấy thông tin bệnh nhân'));
        }
      }, 300);
    });
  },

  updateProfile: async (patientId: string, data: Partial<Patient>): Promise<Patient> => {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        const patient = patients.find(p => p.id === patientId);
        if (patient) {
          const updatedPatient = { ...patient, ...data } as Patient;
          resolve(updatedPatient);
        } else {
          reject(new Error('Không tìm thấy thông tin bệnh nhân'));
        }
      }, 500);
    });
  },

  getAppointments: async (patientId: string): Promise<Appointment[]> => {
    return new Promise((resolve) => {
      setTimeout(() => {
        const patientAppointments = appointments
          .filter(a => a.patientId === patientId)
          .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
        resolve(patientAppointments);
      }, 300);
    });
  },

  cancelAppointment: async (appointmentId: string): Promise<Appointment> => {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        const appointment = appointments.find(a => a.id === appointmentId);
        if (appointment) {
          if (appointment.status !== 'PENDING' && appointment.status !== 'APPROVED') {
            reject(new Error('Không thể hủy lịch hẹn này'));
            return;
          }
          const updatedAppointment = { ...appointment, status: 'CANCELLED' as const };
          resolve(updatedAppointment);
        } else {
          reject(new Error('Không tìm thấy lịch hẹn'));
        }
      }, 500);
    });
  },

  getMedicalHistory: async (patientId: string): Promise<MedicalRecord[]> => {
    return new Promise((resolve) => {
      setTimeout(() => {
        const history = medicalRecords
          .filter(r => r.patientId === patientId)
          .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
        resolve(history);
      }, 300);
    });
  },

  getMedicalRecord: async (recordId: string): Promise<MedicalRecord> => {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        const record = medicalRecords.find(r => r.id === recordId);
        if (record) {
          resolve(record);
        } else {
          reject(new Error('Không tìm thấy hồ sơ bệnh án'));
        }
      }, 300);
    });
  },
};
