export type Role = 'patient' | 'doctor' | 'staff'
export type RecType = 'consultation' | 'surgery' | 'test' | 'event'
export interface RecordItem { id: string; date: string; type: RecType; title: string; notes: string; diagnosis?: string; prescription?: string; doctor: string }
export interface DocItem { id: string; name: string; date: string; category: string; desc: string; status: string; uploadedBy?: string }
export interface Patient { id: string; name: string; age: number; sex: string; phone: string; conditions: string[]; allergies: string[]; vaccinations: string[]; history: string[]; records: RecordItem[]; docs: DocItem[]; source: string; abha?: string; altIdType?: string; altIdRef?: string; screening?: string; consent?: boolean; registeredBy?: string }
export interface Account { id: string; role: 'doctor' | 'staff'; name: string; h: string; active: boolean }
