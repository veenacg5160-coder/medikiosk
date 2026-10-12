import { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import { Patient, Role, RecordItem, DocItem, Account } from './types'
import { seed, PRO_SEED, ID_LABEL } from './data'
import { hash, setupCode } from './auth-utils'
const KEY = 'medikiosk-demo-v1', CKEY = 'medikiosk-creds-v1', SKEY = 'medikiosk-staff-v1', FKEY = 'medikiosk-file-'
const SEED_ABHA: Record<string, string> = { MKP0001: '91000000000001', MKP0002: '91000000000002', MKP0003: '91000000000003' }
type Setup = { h: string; exp: number; tries: number }
type Creds = Record<string, { h: string; setup?: Setup }>
const norm = (s: string) => s.trim().toUpperCase()
const load = <T,>(k: string, f: () => T): T => { try { const v = localStorage.getItem(k); return v ? JSON.parse(v) : f() } catch { return f() } }
const fixPatient = (p: Patient): Patient => ({ ...p, consent: p.consent ?? true, abha: p.abha ?? SEED_ABHA[p.id], records: p.records || [],
  source: p.source === 'Manual entry (demo)' ? 'Hospital registration' : p.source.startsWith('Shaili') ? 'Community screening (manually entered)' : p.source,
  docs: (p.docs || []).map(d => ({ ...d, status: 'Uploaded' })) })
const fixCreds = (c: Record<string, { h?: string; must?: boolean; setup?: Setup }>): Creds => Object.fromEntries(Object.entries(c).map(([k, v]) => [k, v.must ? { h: '' } : { h: v.h || '', setup: v.setup }]))
export const readFile = (id: string) => localStorage.getItem(FKEY + id)
type Lookup = { ok: true; id: string } | { ok: false; error: string }
type NewPatient = Omit<Patient, 'id' | 'records' | 'docs' | 'registeredBy'>
interface Ctx {
  role: Role | null; uid: string; me: string; toast: string
  login: (r: Role, id: string, pw: string) => string | null; logout: () => void
  lookup: (abha: string) => Lookup; getRecord: (id: string) => Patient | null
  pendingMine: () => { id: string; name: string }[]; openPending: (id: string) => void
  register: (b: NewPatient) => { error: string } | { patient: Patient; code: string }
  updatePatient: (id: string, patch: Partial<Pick<Patient, 'name' | 'age' | 'sex' | 'phone' | 'abha' | 'consent'>>) => string | null
  issueSetupCode: (id: string) => string | null
  activate: (id: string, code: string, pw: string) => string | null
  changePassword: (cur: string, next: string) => string | null
  addRecord: (id: string, r: Omit<RecordItem, 'id' | 'doctor'>) => boolean
  addDoc: (id: string, d: Omit<DocItem, 'id' | 'status' | 'uploadedBy'>, data: string) => string | null
  notify: (m: string) => void
}
const C = createContext<Ctx>(null!)
export const useStore = () => useContext(C)
export function Provider({ children }: { children: ReactNode }) {
  const [patients, setPatients] = useState<Patient[]>(() => load<Patient[]>(KEY, () => seed).map(fixPatient))
  const [creds, setCreds] = useState<Creds>(() => fixCreds(load(CKEY, () => ({ MKP0001: { h: hash('MKP0001', 'patient123') } }))))
  const [accounts] = useState<Account[]>(() => load<Account[]>(SKEY, () => PRO_SEED.map(a => ({ id: a.id, role: a.role, name: a.name, h: hash(a.id, a.pw), active: a.active }))))
  const [role, setRole] = useState<Role | null>(null)
  const [uid, setUid] = useState('')
  const [grants, setGrants] = useState<string[]>([])
  const [toast, setToast] = useState('')
  useEffect(() => localStorage.setItem(KEY, JSON.stringify(patients)), [patients])
  useEffect(() => localStorage.setItem(CKEY, JSON.stringify(creds)), [creds])
  useEffect(() => localStorage.setItem(SKEY, JSON.stringify(accounts)), [accounts])
  const notify = (m: string) => { setToast(m); setTimeout(() => setToast(''), 3500) }
  const me = role === 'patient' ? (patients.find(p => p.id === uid)?.name ?? '') + ` (${uid})` : accounts.find(a => a.id === uid)?.name ?? ''
  const login: Ctx['login'] = (r, u, pw) => {
    const id = norm(u)
    if (!id) return `Enter your ${ID_LABEL[r]}.`
    if (!pw) return 'Enter your password.'
    if (r === 'patient') {
      const c = creds[id]
      if (!patients.some(p => p.id === id) || (c && c.h && c.h !== hash(id, pw))) return 'Incorrect ID or password.'
      if (!c || !c.h) return 'This account has not been set up yet. Use "First-time setup or forgot password" with a setup code from the registration desk.'
    } else {
      const a = accounts.find(x => x.id === id && x.role === r)
      if (!a || a.h !== hash(id, pw)) return 'Incorrect ID or password for the selected role.'
      if (!a.active) return 'This account is inactive. Contact your hospital administrator.'
    }
    setGrants([]); setRole(r); setUid(id); return null
  }
  // Access policy: every read of a patient record goes through here.
  const getRecord = (id: string): Patient | null => {
    const p = patients.find(x => x.id === id)
    if (!p || !role) return null
    if (role === 'patient') return id === uid ? p : null
    if (!grants.includes(id)) return null
    if (role === 'doctor') return p.abha && p.consent !== false ? p : null
    return { ...p, conditions: [], allergies: [], vaccinations: [], history: [], records: [], screening: undefined }
  }
  const lookup: Ctx['lookup'] = abha => {
    if (role !== 'doctor' && role !== 'staff') return { ok: false, error: 'You are not authorised to search for patients.' }
    const d = abha.replace(/\D/g, '')
    if (!/^\d{14}$/.test(d)) return { ok: false, error: 'Enter a valid 14-digit ABHA ID.' }
    const p = patients.find(x => x.abha === d)
    if (!p || (role === 'doctor' && p.consent === false)) return { ok: false, error: 'No accessible record was found for this ABHA ID.' }
    setGrants(g => [...new Set([...g, p.id])]); return { ok: true, id: p.id }
  }
  const pendingMine = () => role === 'staff' ? patients.filter(p => !p.abha && (!p.registeredBy || p.registeredBy === uid)).map(p => ({ id: p.id, name: p.name })) : []
  const openPending = (id: string) => { if (pendingMine().some(x => x.id === id)) setGrants(g => [...new Set([...g, id])]) }
  const upd = (id: string, fn: (p: Patient) => Patient) => setPatients(ps => ps.map(p => (p.id === id ? fn(p) : p)))
  const newCode = (id: string) => { const code = setupCode(); setCreds(c => ({ ...c, [id]: { h: c[id]?.h || '', setup: { h: hash(id, code), exp: Date.now() + 72 * 3600e3, tries: 0 } } })); return code }
  const register: Ctx['register'] = b => {
    if (role !== 'staff') return { error: 'You are not authorised to register patients.' }
    if (b.abha && patients.some(p => p.abha === b.abha)) return { error: 'This ABHA ID is already registered.' }
    let n = Math.max(0, ...patients.map(p => +p.id.slice(3))) + 1
    while (patients.some(p => p.id === 'MKP' + String(n).padStart(4, '0'))) n++
    const patient: Patient = { ...b, id: 'MKP' + String(n).padStart(4, '0'), records: [], docs: [], registeredBy: uid }
    setPatients(ps => [...ps, patient]); setGrants(g => [...g, patient.id])
    return { patient, code: newCode(patient.id) }
  }
  const updatePatient: Ctx['updatePatient'] = (id, patch) => {
    if (role !== 'staff' || !getRecord(id)) return 'You are not authorised to change this record.'
    if (patch.abha && patients.some(p => p.id !== id && p.abha === patch.abha)) return 'This ABHA ID is already registered to another patient.'
    upd(id, p => ({ ...p, ...patch })); return null
  }
  const issueSetupCode = (id: string) => role === 'staff' && getRecord(id) ? newCode(id) : null
  const bad = 'The patient ID or setup code is not valid. Ask the registration desk for a new setup code.'
  const activate: Ctx['activate'] = (id, code, pw) => {
    const i = norm(id), c = creds[i], s = c?.setup
    if (!s || !patients.some(p => p.id === i)) return bad
    if (Date.now() > s.exp) return 'This setup code has expired. Ask the registration desk for a new one.'
    if (s.h !== hash(i, norm(code))) { const t = s.tries + 1; setCreds(x => ({ ...x, [i]: t >= 5 ? { h: c.h } : { ...c, setup: { ...s, tries: t } } })); return t >= 5 ? 'Too many incorrect attempts. Ask the registration desk for a new setup code.' : bad }
    setCreds(x => ({ ...x, [i]: { h: hash(i, pw) } })); return null
  }
  const changePassword: Ctx['changePassword'] = (cur, next) => {
    if (role !== 'patient') return 'Not authorised.'
    if (creds[uid]?.h !== hash(uid, cur)) return 'Current password is incorrect.'
    setCreds(c => ({ ...c, [uid]: { ...c[uid], h: hash(uid, next) } })); return null
  }
  const addRecord: Ctx['addRecord'] = (id, r) => {
    if (role !== 'doctor' || !getRecord(id)) return false
    upd(id, p => ({ ...p, records: [...p.records, { ...r, id: 'r' + Date.now(), doctor: me }] })); return true
  }
  const addDoc: Ctx['addDoc'] = (id, meta, data) => {
    if (role !== 'staff' || !getRecord(id)) return 'You are not authorised to add documents to this record.'
    const doc: DocItem = { ...meta, id: 'd' + Date.now(), status: 'Uploaded', uploadedBy: me }
    try { localStorage.setItem(FKEY + doc.id, data) } catch { return 'The file could not be stored. Try a smaller file.' }
    upd(id, p => ({ ...p, docs: [...p.docs, doc] })); return null
  }
  return <C.Provider value={{ role, uid, me, toast, login, logout: () => { setRole(null); setUid(''); setGrants([]) }, lookup, getRecord, pendingMine, openPending, register, updatePatient, issueSetupCode, activate, changePassword, addRecord, addDoc, notify }}>{children}</C.Provider>
}
