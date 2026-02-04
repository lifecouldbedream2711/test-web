export type UserRole = 'PATIENT' | 'DOCTOR' | 'ADMIN';
export type UserStatus = 'ACTIVE' | 'INACTIVE' | 'SUSPENDED';
export type Gender = 'MALE' | 'FEMALE' | 'OTHER';
export type ShiftStatus = 'OPEN' | 'CLOSED';
export type AppointmentStatus = 'PENDING' | 'APPROVED' | 'CHECKED_IN' | 'DONE' | 'CANCELLED' | 'REJECTED' | 'NO_SHOW';
export type EntityStatus = 'ACTIVE' | 'INACTIVE';

export interface User {
  id: string;
  email: string;
  name: string;
  phone: string;
  role: UserRole;
  dateOfBirth?: string;
  gender?: Gender;
  address?: string;
  status: UserStatus;
  createdAt?: string;
  updatedAt?: string;
}

export interface Specialty {
  id: string;
  name: string;
  description: string;
  status: EntityStatus;
  icon?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface Service {
  id: string;
  name: string;
  specialtyId: string;
  price: number;
  duration: number;
  description?: string;
  status: EntityStatus;
  createdAt?: string;
  updatedAt?: string;
}

export interface Doctor extends User {
  specialties: string[];
  expertise: string;
  experience: number;
  education?: string;
  certifications?: string[];
  rating?: number;
  reviewCount?: number;
  avatar?: string;
}

export interface Shift {
  id: string;
  doctorId: string;
  date: string;
  startTime: string;
  endTime: string;
  maxPatient: number;
  bookedCount: number;
  status: ShiftStatus;
  createdAt?: string;
  updatedAt?: string;
}

export interface Slot {
  id: string;
  shiftId: string;
  startTime: string;
  endTime: string;
  isAvailable: boolean;
  createdAt?: string;
}

export interface Appointment {
  id: string;
  patientId: string;
  doctorId: string;
  serviceId: string;
  shiftId: string;
  slotId: string;
  date: string;
  time: string;
  status: AppointmentStatus;
  reason: string;
  notes?: string;
  rejectionReason?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface MedicalRecord {
  id: string;
  appointmentId: string;
  patientId: string;
  doctorId: string;
  symptoms: string;
  diagnosis: string;
  notes?: string;
  date: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface Medication {
  name: string;
  dosage: string;
  quantity: number;
  usage: string;
  days: number;
}

export interface Prescription {
  id: string;
  medicalRecordId: string;
  medications: Medication[];
  notes?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface Patient extends User {
  medicalHistory?: string;
  allergies?: string[];
  bloodType?: string;
  avatar?: string;
}

export interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  email: string;
  password: string;
  name: string;
  phone: string;
  dateOfBirth?: string;
  gender?: Gender;
  address?: string;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}
