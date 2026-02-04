import { type Prescription } from '../types';
import prescriptionsData from '../mocks/prescriptions.json';

const prescriptions = prescriptionsData as Prescription[];

export const prescriptionService = {
  getByMedicalRecordId: async (medicalRecordId: string): Promise<Prescription | null> => {
    return new Promise((resolve) => {
      setTimeout(() => {
        const prescription = prescriptions.find(p => p.medicalRecordId === medicalRecordId);
        resolve(prescription || null);
      }, 300);
    });
  },
};
