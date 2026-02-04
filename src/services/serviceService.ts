import { type Service } from '../types';
import servicesData from '../mocks/services.json';

const services = servicesData as Service[];

export const serviceService = {
  getAll: async (): Promise<Service[]> => {
    return new Promise((resolve) => {
      setTimeout(() => {
        const activeServices = services.filter(s => s.status === 'ACTIVE');
        resolve(activeServices);
      }, 300);
    });
  },

  getById: async (serviceId: string): Promise<Service> => {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        const service = services.find(s => s.id === serviceId);
        if (service) {
          resolve(service);
        } else {
          reject(new Error('Không tìm thấy dịch vụ'));
        }
      }, 300);
    });
  },

  getBySpecialty: async (specialtyId: string): Promise<Service[]> => {
    return new Promise((resolve) => {
      setTimeout(() => {
        const specialtyServices = services.filter(
          s => s.specialtyId === specialtyId && s.status === 'ACTIVE'
        );
        resolve(specialtyServices);
      }, 300);
    });
  },

  create: async (data: Omit<Service, 'id' | 'createdAt' | 'updatedAt'>): Promise<Service> => {
    return new Promise((resolve) => {
      setTimeout(() => {
        const newService: Service = {
          ...data,
          id: `SV${String(services.length + 1).padStart(3, '0')}`,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
        resolve(newService);
      }, 500);
    });
  },

  update: async (serviceId: string, data: Partial<Service>): Promise<Service> => {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        const service = services.find(s => s.id === serviceId);
        if (service) {
          const updatedService: Service = {
            ...service,
            ...data,
            updatedAt: new Date().toISOString(),
          };
          resolve(updatedService);
        } else {
          reject(new Error('Không tìm thấy dịch vụ'));
        }
      }, 500);
    });
  },

  delete: async (serviceId: string): Promise<void> => {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        const service = services.find(s => s.id === serviceId);
        if (service) {
          resolve();
        } else {
          reject(new Error('Không tìm thấy dịch vụ'));
        }
      }, 500);
    });
  },
};
