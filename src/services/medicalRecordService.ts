import { type MedicalRecord } from '../types';
import medicalRecordsData from '../mocks/medicalRecords.json';

const medicalRecords = medicalRecordsData as MedicalRecord[];

interface CreateMedicalRecordData {
  appointmentId: string;
  patientId: string;
  doctorId: string;
  symptoms: string;
  diagnosis: string;
  notes?: string;
  date: string;
}

export const medicalRecordService = {
  create: async (data: CreateMedicalRecordData): Promise<MedicalRecord> => {
    return new Promise((resolve) => {
      setTimeout(() => {
        const newRecord: MedicalRecord = {
          ...data,
          id: `MR${Date.now()}`,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
        resolve(newRecord);
      }, 500);
    });
  },

  getByPatient: async (patientId: string): Promise<MedicalRecord[]> => {
    return new Promise((resolve) => {
      setTimeout(() => {
        const records = medicalRecords
          .filter(r => r.patientId === patientId)
          .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
        resolve(records);
      }, 300);
    });
  },

  getByAppointment: async (appointmentId: string): Promise<MedicalRecord | null> => {
    return new Promise((resolve) => {
      setTimeout(() => {
        const record = medicalRecords.find(r => r.appointmentId === appointmentId);
        resolve(record || null);
      }, 300);
    });
  },

  getById: async (recordId: string): Promise<MedicalRecord> => {
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
