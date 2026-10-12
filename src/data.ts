import { Patient, Role } from './types'
export const ID_LABEL: Record<Role, string> = { patient: 'Patient ID', doctor: 'Doctor ID', staff: 'Staff ID' }
// Registration policy: whether staff may register a patient before an ABHA ID is available.
export const POLICY = { allowWithoutAbha: true }
// Professional accounts are provisioned by an administrator, not through this interface.
export const PRO_SEED = [
  { id: 'DR001', role: 'doctor' as const, name: 'Dr. Anita Menon', pw: 'doctor123', active: true },
  { id: 'ST001', role: 'staff' as const, name: 'Suresh Kumar', pw: 'staff123', active: true },
  { id: 'ST002', role: 'staff' as const, name: 'Meera Thomas', pw: 'staff456', active: false },
]
const d = 'Dr. Anita Menon'
export const seed: Patient[] = [
  { id: 'MKP0001', name: 'Ramesh Nair', age: 58, sex: 'Male', phone: '9000000001', conditions: ['Type 2 diabetes mellitus', 'Hypertension'], allergies: ['Penicillin'], vaccinations: ['COVID-19 (2 doses)', 'Influenza 2024'], history: ['Appendectomy, 2009'], source: 'Hospital registration', abha: '91000000000001', consent: true,
    records: [
      { id: 'r1', date: '2023-02-14', type: 'consultation', title: 'Routine diabetes review', notes: 'Fasting glucose elevated. Diet counselling given.', diagnosis: 'Type 2 diabetes mellitus', prescription: 'Metformin 500 mg twice daily', doctor: d },
      { id: 'r2', date: '2023-08-02', type: 'test', title: 'HbA1c and lipid profile', notes: 'HbA1c 7.9%. LDL 132 mg/dL.', doctor: d },
      { id: 'r3', date: '2024-03-19', type: 'consultation', title: 'Blood pressure follow-up', notes: 'BP 148/92 on two readings.', diagnosis: 'Hypertension', prescription: 'Amlodipine 5 mg once daily', doctor: d },
      { id: 'r4', date: '2024-11-05', type: 'event', title: 'Emergency visit: dizziness', notes: 'Observed and discharged same day.', doctor: 'Casualty MO' }],
    docs: [{ id: 'd1', name: 'HbA1c_Aug2023.pdf', date: '2023-08-02', category: 'Lab report', desc: 'HbA1c and lipid profile', status: 'Uploaded' }] },
  { id: 'MKP0002', name: 'Lakshmi Pillai', age: 71, sex: 'Female', phone: '9000000002', conditions: ['Osteoarthritis (knees)'], allergies: [], vaccinations: [], history: ['Cataract surgery (right eye), 2021'], source: 'Hospital registration', abha: '91000000000002', consent: true,
    records: [{ id: 'r5', date: '2024-06-10', type: 'consultation', title: 'Knee pain', notes: 'Pain on climbing stairs. Physiotherapy advised.', diagnosis: 'Osteoarthritis (knees)', prescription: 'Paracetamol 650 mg as needed', doctor: d }],
    docs: [{ id: 'd2', name: 'Knee_Xray.jpg', date: '2024-06-10', category: 'Imaging', desc: 'X-ray both knees', status: 'Uploaded' }] },
  { id: 'MKP0003', name: 'Arjun Das', age: 34, sex: 'Male', phone: '9000000003', conditions: [], allergies: ['Sulfa drugs'], vaccinations: ['Hepatitis B (3 doses)'], history: [], source: 'Community screening (manually entered)', abha: '91000000000003', consent: true, records: [], docs: [] },
]
