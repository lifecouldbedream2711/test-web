import { type Specialty } from '../types';
import specialtiesData from '../mocks/specialties.json';

const specialties = specialtiesData as Specialty[];

export const specialtyService = {
  getAll: async (): Promise<Specialty[]> => {
    return new Promise((resolve) => {
      setTimeout(() => {
        const activeSpecialties = specialties.filter(s => s.status === 'ACTIVE');
        resolve(activeSpecialties);
      }, 300);
    });
  },

  getById: async (specialtyId: string): Promise<Specialty> => {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        const specialty = specialties.find(s => s.id === specialtyId);
        if (specialty) {
          resolve(specialty);
        } else {
          reject(new Error('Không tìm thấy chuyên khoa'));
        }
      }, 300);
    });
  },

  create: async (data: Omit<Specialty, 'id' | 'createdAt' | 'updatedAt'>): Promise<Specialty> => {
    return new Promise((resolve) => {
      setTimeout(() => {
        const newSpecialty: Specialty = {
          ...data,
          id: `SP${String(specialties.length + 1).padStart(3, '0')}`,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
        resolve(newSpecialty);
      }, 500);
    });
  },

  update: async (specialtyId: string, data: Partial<Specialty>): Promise<Specialty> => {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        const specialty = specialties.find(s => s.id === specialtyId);
        if (specialty) {
          const updatedSpecialty: Specialty = {
            ...specialty,
            ...data,
            updatedAt: new Date().toISOString(),
          };
          resolve(updatedSpecialty);
        } else {
          reject(new Error('Không tìm thấy chuyên khoa'));
        }
      }, 500);
    });
  },

  delete: async (specialtyId: string): Promise<void> => {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        const specialty = specialties.find(s => s.id === specialtyId);
        if (specialty) {
          resolve();
        } else {
          reject(new Error('Không tìm thấy chuyên khoa'));
        }
      }, 500);
    });
  },
};
