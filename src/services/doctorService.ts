import { type Doctor } from '../types';
import doctorsData from '../mocks/doctors.json';

const doctors = doctorsData as Doctor[];

export const doctorService = {
  getAll: async (): Promise<Doctor[]> => {
    return new Promise((resolve) => {
      setTimeout(() => {
        const activeDoctors = doctors.filter(d => d.status === 'ACTIVE');
        resolve(activeDoctors as Doctor[]);
      }, 300);
    });
  },

  getById: async (doctorId: string): Promise<Doctor> => {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        const doctor = doctors.find(d => d.id === doctorId);
        if (doctor) {
          resolve(doctor as Doctor);
        } else {
          reject(new Error('Không tìm thấy bác sĩ'));
        }
      }, 300);
    });
  },

  getBySpecialty: async (specialtyId: string): Promise<Doctor[]> => {
    return new Promise((resolve) => {
      setTimeout(() => {
        const specialtyDoctors = doctors.filter(
          d => d.status === 'ACTIVE' && d.specialties.includes(specialtyId)
        );
        resolve(specialtyDoctors as Doctor[]);
      }, 300);
    });
  },

  searchDoctors: async (query: string): Promise<Doctor[]> => {
    return new Promise((resolve) => {
      setTimeout(() => {
        const lowerQuery = query.toLowerCase();
        const results = doctors.filter(d => 
          d.status === 'ACTIVE' && 
          (d.name.toLowerCase().includes(lowerQuery) || 
           d.expertise.toLowerCase().includes(lowerQuery))
        );
        resolve(results as Doctor[]);
      }, 300);
    });
  },

  create: async (data: Omit<Doctor, 'id' | 'createdAt' | 'updatedAt'>): Promise<Doctor> => {
    return new Promise((resolve) => {
      setTimeout(() => {
        const newDoctor: Doctor = {
          ...data,
          id: `D${String(doctors.length + 1).padStart(3, '0')}`,
          role: 'DOCTOR',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
        resolve(newDoctor);
      }, 500);
    });
  },

  update: async (doctorId: string, data: Partial<Doctor>): Promise<Doctor> => {
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

  delete: async (doctorId: string): Promise<void> => {
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

  getAppointmentDetail: async (appointmentId: string) => {
    const { appointmentService } = await import('./appointmentService');
    const { patientService } = await import('./patientService');
    const { serviceService } = await import('./serviceService');
    
    return new Promise(async (resolve, reject) => {
      setTimeout(async () => {
        try {
          const appointment = await appointmentService.getById(appointmentId);
          const patient = await patientService.getProfile(appointment.patientId);
          const doctor = await doctorService.getById(appointment.doctorId);
          const service = await serviceService.getById(appointment.serviceId);
          
          resolve({
            ...appointment,
            patient,
            doctor,
            service,
          });
        } catch (error) {
          reject(error);
        }
      }, 300);
    });
  },

  getPatientHistory: async (patientId: string) => {
    const { patientService } = await import('./patientService');
    const { appointmentService } = await import('./appointmentService');
    const { medicalRecordService } = await import('./medicalRecordService');
    
    return new Promise(async (resolve) => {
      setTimeout(async () => {
        const patient = await patientService.getProfile(patientId);
        const appointments = await appointmentService.getAll({ 
          patientId, 
          status: 'DONE' 
        });
        const medicalRecords = await medicalRecordService.getByPatient(patientId);
        
        resolve({
          patient,
          appointments,
          medicalRecords,
        });
      }, 300);
    });
  },
};
