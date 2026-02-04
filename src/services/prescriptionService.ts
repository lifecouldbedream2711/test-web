import { type Prescription, type Medication } from '../types';
import prescriptionsData from '../mocks/prescriptions.json';

const prescriptions = prescriptionsData as Prescription[];

interface CreatePrescriptionData {
  medicalRecordId: string;
  medications: Medication[];
  notes?: string;
}

export const prescriptionService = {
  getByMedicalRecordId: async (medicalRecordId: string): Promise<Prescription | null> => {
    return new Promise((resolve) => {
      setTimeout(() => {
        const prescription = prescriptions.find(p => p.medicalRecordId === medicalRecordId);
        resolve(prescription || null);
      }, 300);
    });
  },

  create: async (data: CreatePrescriptionData): Promise<Prescription> => {
    return new Promise((resolve) => {
      setTimeout(() => {
        const newPrescription: Prescription = {
          ...data,
          id: `PRE${Date.now()}`,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
        resolve(newPrescription);
      }, 500);
    });
  },

  getById: async (prescriptionId: string): Promise<Prescription> => {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        const prescription = prescriptions.find(p => p.id === prescriptionId);
        if (prescription) {
          resolve(prescription);
        } else {
          reject(new Error('Không tìm thấy đơn thuốc'));
        }
      }, 300);
    });
  },
};
