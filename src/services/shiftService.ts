import { type Shift, type Slot } from '../types';
import shiftsData from '../mocks/shifts.json';

const shifts = shiftsData as Shift[];

export const shiftService = {
  getAll: async (): Promise<Shift[]> => {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve(shifts);
      }, 300);
    });
  },

  getById: async (shiftId: string): Promise<Shift> => {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        const shift = shifts.find(s => s.id === shiftId);
        if (shift) {
          resolve(shift);
        } else {
          reject(new Error('Không tìm thấy ca làm việc'));
        }
      }, 300);
    });
  },

  getByDoctor: async (doctorId: string, startDate?: string, endDate?: string): Promise<Shift[]> => {
    return new Promise((resolve) => {
      setTimeout(() => {
        let doctorShifts = shifts.filter(s => s.doctorId === doctorId);
        
        if (startDate) {
          doctorShifts = doctorShifts.filter(s => s.date >= startDate);
        }
        if (endDate) {
          doctorShifts = doctorShifts.filter(s => s.date <= endDate);
        }
        
        doctorShifts.sort((a, b) => {
          const dateCompare = a.date.localeCompare(b.date);
          if (dateCompare !== 0) return dateCompare;
          return a.startTime.localeCompare(b.startTime);
        });
        
        resolve(doctorShifts);
      }, 300);
    });
  },

  getSlots: async (shiftId: string): Promise<Slot[]> => {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        const shift = shifts.find(s => s.id === shiftId);
        if (!shift) {
          reject(new Error('Không tìm thấy ca làm việc'));
          return;
        }

        const slots: Slot[] = [];
        const [startHour, startMinute] = shift.startTime.split(':').map(Number);
        const [endHour, endMinute] = shift.endTime.split(':').map(Number);
        
        const startMinutes = startHour * 60 + startMinute;
        const endMinutes = endHour * 60 + endMinute;
        const slotDuration = 30;
        
        let slotIndex = 0;
        for (let time = startMinutes; time < endMinutes; time += slotDuration) {
          const slotStartHour = Math.floor(time / 60);
          const slotStartMinute = time % 60;
          const slotEndHour = Math.floor((time + slotDuration) / 60);
          const slotEndMinute = (time + slotDuration) % 60;
          
          const isAvailable = slotIndex >= shift.bookedCount;
          
          slots.push({
            id: `SL${shiftId}_${slotIndex}`,
            shiftId: shift.id,
            startTime: `${String(slotStartHour).padStart(2, '0')}:${String(slotStartMinute).padStart(2, '0')}`,
            endTime: `${String(slotEndHour).padStart(2, '0')}:${String(slotEndMinute).padStart(2, '0')}`,
            isAvailable,
            createdAt: shift.createdAt,
          });
          
          slotIndex++;
        }
        
        resolve(slots);
      }, 300);
    });
  },

  create: async (data: Omit<Shift, 'id' | 'createdAt' | 'updatedAt'>): Promise<Shift> => {
    return new Promise((resolve) => {
      setTimeout(() => {
        const newShift: Shift = {
          ...data,
          id: `SH${String(shifts.length + 1).padStart(3, '0')}`,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
        resolve(newShift);
      }, 500);
    });
  },

  update: async (shiftId: string, data: Partial<Shift>): Promise<Shift> => {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        const shift = shifts.find(s => s.id === shiftId);
        if (shift) {
          const updatedShift: Shift = {
            ...shift,
            ...data,
            updatedAt: new Date().toISOString(),
          };
          resolve(updatedShift);
        } else {
          reject(new Error('Không tìm thấy ca làm việc'));
        }
      }, 500);
    });
  },

  delete: async (shiftId: string): Promise<void> => {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        const shift = shifts.find(s => s.id === shiftId);
        if (shift) {
          resolve();
        } else {
          reject(new Error('Không tìm thấy ca làm việc'));
        }
      }, 500);
    });
  },
};
