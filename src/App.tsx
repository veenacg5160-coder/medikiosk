import { useState, FormEvent, ReactNode } from 'react'
import { Role, Patient } from './types'
import { ID_LABEL, POLICY } from './data'
import { useStore } from './store'
import { ActivateFlow, ChangePassword } from './auth'
import { fmtAbha } from './auth-utils'
import { Card, Field, Chip, Empty, Timeline, DocTable, SummaryPanel, inp, btn, btn2 } from './ui'
import { HeartPulse, User, Stethoscope, ClipboardList, Eye, EyeOff, LogOut, Menu, Search, UserPlus, Upload, LayoutDashboard, History, FileText, ShieldCheck, ArrowLeft, CheckCircle2, KeyRound } from 'lucide-react'

const Logo = ({ light }: { light?: boolean }) => <div className={`flex items-center gap-2 text-xl font-semibold ${light ? 'text-white' : 'text-navy'}`}><span className="flex h-9 w-9 items-center justify-center rounded-lg bg-brand text-white"><HeartPulse size={20} /></span>MediKiosk</div>

function Login() {
  const { login } = useStore()
  const [role, setRole] = useState<Role>('patient'); const [setup, setSetup] = useState(false)
  const [u, setU] = useState(''); const [p, setP] = useState(''); const [show, setShow] = useState(false)
  const [e, setE] = useState<{ u?: string; p?: string; form?: string }>({})
  const roles = [{ r: 'patient' as Role, t: 'Patient', I: User }, { r: 'doctor' as Role, t: 'Doctor', I: Stethoscope }, { r: 'staff' as Role, t: 'Hospital Staff', I: ClipboardList }]
  const submit = (ev: FormEvent) => { ev.preventDefault(); const er: typeof e = {}
    if (!u.trim()) er.u = `Enter your ${ID_LABEL[role]}.`; if (!p) er.p = 'Enter your password.'
    if (!er.u && !er.p) { const m = login(role, u, p); if (m) er.form = m }
    setE(er) }
  return <main className="flex min-h-screen items-center justify-center bg-white p-4"><div className="w-full max-w-lg py-6">
    <Logo /><p className="mt-2 text-ink">Organised patient history for busy consultations.</p>
    <div role="radiogroup" aria-label="Role" className="mt-5 grid grid-cols-3 gap-2">{roles.map(({ r, t, I }) => <button type="button" key={r} role="radio" aria-checked={role === r} onClick={() => { setRole(r); setE({}); setSetup(false) }}
      className={`flex flex-col items-center gap-1 rounded-xl border p-3 text-sm font-medium ${role === r ? 'border-brand bg-tint text-navy ring-1 ring-brand' : 'border-line'}`}><I size={22} />{t}</button>)}</div>
    <div className="mt-5">{setup && role === 'patient' ? <div className="space-y-3"><h2 className="text-lg">First-time setup or forgot password</h2><ActivateFlow onDone={() => setSetup(false)} />
      <button className="text-sm text-brand underline" onClick={() => setSetup(false)}>Back to login</button></div> :
      <form onSubmit={submit} className="space-y-4" noValidate>
        <Field label={ID_LABEL[role]} error={e.u}><input className={inp} value={u} onChange={x => setU(x.target.value)} autoComplete="off" /></Field>
        <Field label="Password" error={e.p}><div className="relative"><input className={inp} type={show ? 'text' : 'password'} value={p} onChange={x => setP(x.target.value)} autoComplete="off" />
          <button type="button" aria-label={show ? 'Hide password' : 'Show password'} onClick={() => setShow(!show)} className="absolute right-3 top-3">{show ? <EyeOff size={18} /> : <Eye size={18} />}</button></div></Field>
        {e.form && <p role="alert" className="text-sm text-red-700">{e.form}</p>}
        <button className={btn + ' w-full !py-3'}>Log in</button>
        {role === 'patient' ? <button type="button" className="text-sm text-brand underline" onClick={() => { setSetup(true); setE({}) }}>First-time setup or forgot password</button>
          : <p className="text-sm">Forgot your password or need access? Contact your hospital administrator.</p>}</form>}</div>
    <p className="mt-6 flex gap-2 text-xs"><ShieldCheck size={16} className="shrink-0" />Patient records are shown only to authorised users. Never share your password.</p></div></main>
}

type Nav = { id: string; label: string; I: typeof LayoutDashboard }
function Shell({ nav, view, setView, big, children }: { nav: Nav[]; view: string; setView: (v: string) => void; big?: boolean; children: ReactNode }) {
  const { logout, toast, me } = useStore(); const [open, setOpen] = useState(false)
  return <div className={`min-h-screen md:flex ${big ? 'text-lg' : ''}`}>
    <aside className={`${open ? 'block' : 'hidden'} bg-navy p-4 text-white md:block md:w-60 md:shrink-0`}>
      <div className="mb-6 hidden md:block"><Logo light /></div>
      <nav className="space-y-1">{nav.map(n => <button key={n.id} onClick={() => { setView(n.id); setOpen(false) }} className={`flex w-full items-center gap-3 rounded-lg px-3 py-3 text-left ${view === n.id ? 'bg-brand' : 'hover:bg-white/10'}`}><n.I size={19} />{n.label}</button>)}
        <button onClick={logout} className="flex w-full items-center gap-3 rounded-lg px-3 py-3 text-left hover:bg-white/10"><LogOut size={19} />Log out</button></nav></aside>
    <div className="min-w-0 flex-1"><header className="sticky top-0 z-10 flex items-center justify-between border-b border-line bg-white px-4 py-3">
      <div className="flex items-center gap-3"><button className="md:hidden" aria-label="Menu" onClick={() => setOpen(!open)}><Menu /></button><span className="md:hidden"><Logo /></span></div>
      <span className="text-sm font-medium text-navy">{me}</span></header>
      <main className="mx-auto max-w-5xl space-y-5 p-4 md:p-6">{children}</main></div>
    {toast && <div role="status" className="fixed bottom-4 right-4 z-40 flex items-center gap-2 rounded-lg bg-navy px-4 py-3 text-white shadow-lg"><CheckCircle2 size={18} />{toast}</div>}</div>
}

const Tags = ({ items, tone, none }: { items: string[]; tone?: 'red' | 'blue'; none: string }) => items.length ? <div className="flex flex-wrap gap-2">{items.map(i => <Chip key={i} tone={tone}>{i}</Chip>)}</div> : <p className="text-sm">{none}</p>
const Profile = ({ p }: { p: Patient }) => <Card title="Profile" icon={<User size={20} />}><dl className="grid gap-2 sm:grid-cols-2"><div>Name: <b>{p.name}</b></div><div>Patient ID: <b>{p.id}</b></div><div>Age / sex: <b>{p.age} / {p.sex}</b></div><div>Contact: <b>{p.phone}</b></div>
  <div className="sm:col-span-2">ABHA ID: <b>{p.abha ? fmtAbha(p.abha) : p.altIdType ? `${p.altIdType} (${p.altIdRef})` : 'Not yet recorded'}</b></div>
  <div className="sm:col-span-2">Record sharing consent: <b>{p.consent === false ? 'Not recorded' : 'Recorded'}</b></div><div className="sm:col-span-2">Profile source: <b>{p.source}</b></div>{p.screening && <div className="sm:col-span-2">Screening note: <b>{p.screening}</b></div>}</dl></Card>
const Overview = ({ p }: { p: Patient }) => <div className="grid gap-4 md:grid-cols-3">
  <Card title="Conditions"><Tags items={p.conditions} none="None recorded" /></Card>
  <Card title="Allergies"><Tags items={p.allergies} tone="red" none="None recorded" /></Card>
  <Card title="Records"><p><b className="text-2xl text-navy">{p.records.length}</b> consultations and events</p><p><b className="text-2xl text-navy">{p.docs.length}</b> reports</p></Card></div>

function PatientPortal() {
  const { getRecord, uid } = useStore(); const [v, setV] = useState('home'); const p = getRecord(uid)
  const nav: Nav[] = [{ id: 'home', label: 'Overview', I: LayoutDashboard }, { id: 'hist', label: 'History', I: History }, { id: 'rep', label: 'Reports', I: FileText }, { id: 'prof', label: 'Profile', I: User }, { id: 'acct', label: 'Account', I: KeyRound }]
  if (!p) return null
  return <Shell nav={nav} view={v} setView={setV} big>
    {v === 'home' && <><h1 className="text-2xl">Welcome, {p.name}</h1><p>Patient ID {p.id}. You can view your records here. Only your doctor can change them.</p><Overview p={p} /><SummaryPanel p={p} /></>}
    {v === 'hist' && <Card title="Medical history"><Timeline p={p} /></Card>}
    {v === 'rep' && <Card title="Uploaded reports"><DocTable docs={p.docs} /></Card>}
    {v === 'prof' && <><Profile p={p} /><Card title="Vaccinations and past history"><Tags items={[...p.vaccinations, ...p.history]} none="None recorded" /></Card></>}
    {v === 'acct' && <ChangePassword />}</Shell>
}

function AbhaLookup({ onFound, onClear }: { onFound: (id: string) => void; onClear: () => void }) {
  const { lookup } = useStore(); const [v, setV] = useState(''); const [err, setErr] = useState('')
  const go = (ev: FormEvent) => { ev.preventDefault(); const r = lookup(v); if (r.ok) { setErr(''); onFound(r.id) } else { setErr(r.error); onClear() } }
  return <Card title="Find patient by ABHA ID" icon={<Search size={20} />}><form onSubmit={go} noValidate className="flex flex-col gap-2 sm:flex-row">
    <div className="flex-1"><Field label="ABHA ID" error={err}><input className={inp} inputMode="numeric" placeholder="14-digit ABHA ID" value={v} autoComplete="off" onChange={e => { setV(fmtAbha(e.target.value)); onClear(); setErr('') }} /></Field></div>
    <button className={btn + ' sm:mt-6'}>Search patient</button></form>
    <p className="mt-2 text-sm">Records are retrieved only by exact ABHA ID. The ID is matched against MediKiosk records and is not checked with any external service.</p></Card>
}

function Consult({ p }: { p: Patient }) {
  const { addRecord, notify } = useStore(); const [f, setF] = useState({ title: '', notes: '', diagnosis: '', prescription: '' }); const [err, setErr] = useState('')
  const save = (e: FormEvent) => { e.preventDefault(); if (!f.title.trim() || !f.notes.trim()) return setErr('Visit title and notes are required.')
    const ok = addRecord(p.id, { date: new Date().toISOString().slice(0, 10), type: 'consultation', title: f.title.trim(), notes: f.notes.trim(), diagnosis: f.diagnosis.trim() || undefined, prescription: f.prescription.trim() || undefined })
    if (!ok) return setErr('You are not authorised to add records for this patient.')
    setF({ title: '', notes: '', diagnosis: '', prescription: '' }); setErr(''); notify('Consultation saved to patient history.') }
  return <Card title="New consultation"><p className="mb-3 rounded-lg bg-tint p-3 text-sm">This consultation will be saved to <b>{p.name}</b> ({p.id}).</p><form onSubmit={save} className="space-y-3" noValidate>
    <Field label="Visit title"><input className={inp} value={f.title} onChange={e => setF({ ...f, title: e.target.value })} /></Field>
    <Field label="Clinical notes"><textarea rows={3} className={inp} value={f.notes} onChange={e => setF({ ...f, notes: e.target.value })} /></Field>
    <div className="grid gap-3 sm:grid-cols-2"><Field label="Diagnosis"><input className={inp} value={f.diagnosis} onChange={e => setF({ ...f, diagnosis: e.target.value })} /></Field>
      <Field label="Prescription"><input className={inp} value={f.prescription} onChange={e => setF({ ...f, prescription: e.target.value })} /></Field></div>
    {err && <p role="alert" className="text-sm text-red-700">{err}</p>}<button className={btn}>Save consultation</button></form></Card>
}

function DoctorPortal() {
  const { getRecord, me, uid } = useStore(); const [v, setV] = useState('home'); const [sel, setSel] = useState<string | null>(null); const [tab, setTab] = useState('hist')
  const p = sel ? getRecord(sel) : null
  const nav: Nav[] = [{ id: 'home', label: 'Dashboard', I: LayoutDashboard }, { id: 'pat', label: 'Patient lookup', I: Search }]
  const tabs = [['hist', 'History'], ['sum', 'AI summary'], ['rep', 'Reports'], ['new', 'New consultation']]
  return <Shell nav={nav} view={v} setView={x => { setV(x); setSel(null) }}>
    {v === 'home' && <><h1 className="text-2xl">{me}</h1><Card title="Doctor profile" icon={<Stethoscope size={20} />}><p>Doctor ID: <b>{uid}</b></p><p>General Medicine outpatient department</p></Card>
      <Card><p>Patient records are retrieved with the patient's ABHA ID. Access also depends on the patient's recorded consent.</p></Card><button className={btn} onClick={() => setV('pat')}>Find a patient</button></>}
    {v === 'pat' && <><AbhaLookup onFound={id => { setSel(id); setTab('hist') }} onClear={() => setSel(null)} />
      {p && <><Profile p={p} />
        <Card className="border-red-200 !bg-red-50"><p><b>Allergies:</b> {p.allergies.join(', ') || 'none recorded (verify)'}</p><p><b>Conditions:</b> {p.conditions.join(', ') || 'none recorded'}</p></Card>
        <div role="tablist" className="flex flex-wrap gap-2">{tabs.map(([id, l]) => <button key={id} role="tab" aria-selected={tab === id} onClick={() => setTab(id)} className={tab === id ? btn : btn2}>{l}</button>)}</div>
        {tab === 'hist' && <Card title="Medical history"><Timeline p={p} /></Card>}{tab === 'sum' && <SummaryPanel p={p} />}
        {tab === 'rep' && <Card title="Reports"><DocTable docs={p.docs} /></Card>}{tab === 'new' && <Consult key={p.id} p={p} />}</>}</>}</Shell>
}

const split = (s: string) => s.split(',').map(x => x.trim()).filter(Boolean)
const checkCommon = (f: { name: string; age: string; phone: string }) => { const er: Record<string, string> = {}
  if (f.name.trim().length < 2) er.name = 'Enter the full name.'
  if (!/^\d+$/.test(f.age) || +f.age > 120) er.age = 'Enter age as a number up to 120.'
  if (!/^\d{10}$/.test(f.phone)) er.phone = 'Enter a 10-digit contact number.'
  return er }
function Register({ onDone }: { onDone: (d: { p: Patient; code: string }) => void }) {
  const { register, notify } = useStore()
  const blank = { name: '', age: '', sex: 'Male', phone: '', abha: '', noAbha: false, consent: false, conditions: '', allergies: '', vaccinations: '', history: '', screen: false, screening: '' }
  const [f, setF] = useState(blank); const [e, setE] = useState<Record<string, string>>({})
  const set = (k: string, v: string | boolean) => setF({ ...f, [k]: v })
  const submit = (ev: FormEvent) => { ev.preventDefault(); const er = checkCommon(f); const digits = f.abha.replace(/\D/g, '')
    if (!f.noAbha && digits.length !== 14) er.abha = 'Enter the 14-digit ABHA ID.'
    if (f.screen && !f.screening.trim()) er.screening = 'Enter the screening information or untick this option.'
    setE(er); if (Object.keys(er).length) return
    const sc = f.screen ? f.screening.trim() : undefined
    const r = register({ name: f.name.trim(), age: +f.age, sex: f.sex, phone: f.phone, conditions: split(f.conditions), allergies: split(f.allergies), vaccinations: split(f.vaccinations), history: split(f.history),
      abha: f.noAbha ? undefined : digits, consent: f.consent, screening: sc, source: sc ? 'Community screening (manually entered)' : 'Hospital registration' })
    if ('error' in r) return setE({ abha: r.error })
    notify(`Registered ${r.patient.name} as ${r.patient.id}.`); onDone({ p: r.patient, code: r.code }) }
  const T = (k: keyof typeof blank, l: string, er?: string) => <Field label={l} error={er}><input className={inp} value={f[k] as string} onChange={x => set(k, x.target.value)} /></Field>
  return <Card title="Register new patient" icon={<UserPlus size={20} />}><form onSubmit={submit} noValidate className="grid gap-3 sm:grid-cols-2">
    <h3 className="sm:col-span-2">Personal details</h3>
    {T('name', 'Full name', e.name)}{T('phone', 'Contact number', e.phone)}{T('age', 'Age', e.age)}
    <Field label="Sex"><select className={inp} value={f.sex} onChange={x => set('sex', x.target.value)}><option>Male</option><option>Female</option><option>Other</option></select></Field>
    <h3 className="mt-2 sm:col-span-2">Patient identifier</h3>
    <div className="sm:col-span-2"><Field label="ABHA ID" error={e.abha}><input className={inp} inputMode="numeric" placeholder="14-digit ABHA ID" disabled={f.noAbha} value={f.abha} autoComplete="off" onChange={x => set('abha', fmtAbha(x.target.value))} /></Field></div>
    {POLICY.allowWithoutAbha && <label className="flex items-start gap-2 text-sm sm:col-span-2"><input type="checkbox" className="mt-1" checked={f.noAbha} onChange={x => setF({ ...f, noAbha: x.target.checked, abha: '' })} />The patient does not have an ABHA ID yet. The record cannot be found by ABHA lookup until an ABHA ID is added.</label>}
    <p className="text-sm sm:col-span-2">Aadhaar numbers are not collected. The ABHA ID is stored as entered and is not verified with any external service.</p>
    <label className="flex items-start gap-2 text-sm sm:col-span-2"><input type="checkbox" className="mt-1" checked={f.consent} onChange={x => set('consent', x.target.checked)} />The patient has agreed that treating doctors at this hospital may view their records. Doctors cannot open the record without this consent.</label>
    <h3 className="mt-2 sm:col-span-2">Health information</h3>
    {T('conditions', 'Medical conditions (comma separated)')}{T('allergies', 'Allergies (comma separated)')}{T('vaccinations', 'Vaccination history')}{T('history', 'Major medical history')}
    <div className="mt-2 rounded-lg border border-line bg-tint p-3 sm:col-span-2"><label className="flex items-center gap-2 font-medium text-navy"><input type="checkbox" checked={f.screen} onChange={x => set('screen', x.target.checked)} />Add community screening information (optional)</label>
      <p className="mt-1 text-sm">Kept separate from identity details. Screening findings are not confirmed diagnoses.</p>
      {f.screen && <div className="mt-2"><Field label="Screening information" error={e.screening}><input className={inp} value={f.screening} onChange={x => set('screening', x.target.value)} /></Field></div>}</div>
    <button className={btn + ' sm:col-span-2'}>Register patient</button></form></Card>
}

function Confirm({ d, setD, onOpen }: { d: { p: Patient; code: string }; setD: (d: { p: Patient; code: string }) => void; onOpen: () => void }) {
  const { issueSetupCode, notify } = useStore()
  return <Card title="Registration successful" icon={<CheckCircle2 size={20} className="text-green-700" />}>
    <p><b>{d.p.name}</b> has been registered. MediKiosk patient ID: <b className="text-xl text-navy">{d.p.id}</b></p>
    <div className="mt-3 rounded-lg border border-line bg-tint p-4"><h3 className="text-base">Account setup code</h3>
      <p className="mt-1"><code className="rounded bg-white px-2 py-1 text-lg font-semibold text-navy">{d.code}</code></p>
      <p className="mt-2 text-sm">Give this code to the patient after confirming their identity. They choose their own password at Patient login, under "First-time setup or forgot password", using their patient ID and this code. The code works once, expires in 72 hours and is not shown again.</p>
      <button className={btn2 + ' mt-2 !py-1.5'} onClick={() => { const c = issueSetupCode(d.p.id); if (c) { setD({ ...d, code: c }); notify('New setup code issued.') } }}>Issue a new setup code</button></div>
    {!d.p.abha && <p className="mt-3 rounded-lg bg-slate-100 p-3 text-sm">No ABHA ID is recorded. This patient cannot be found by ABHA lookup until an ABHA ID is added to the record.</p>}
    <div className="mt-3"><button className={btn} onClick={onOpen}>Open patient record</button></div></Card>
}

function EditDetails({ p }: { p: Patient }) {
  const { updatePatient, notify } = useStore()
  const [f, setF] = useState({ name: p.name, age: String(p.age), sex: p.sex, phone: p.phone, abha: p.abha ? fmtAbha(p.abha) : '', consent: p.consent !== false }); const [e, setE] = useState<Record<string, string>>({})
  const save = (ev: FormEvent) => { ev.preventDefault(); const er = checkCommon(f); const d = f.abha.replace(/\D/g, '')
    if ((p.abha || d) && d.length !== 14) er.abha = 'Enter the 14-digit ABHA ID.'
    setE(er); if (Object.keys(er).length) return
    const m = updatePatient(p.id, { name: f.name.trim(), age: +f.age, sex: f.sex, phone: f.phone, consent: f.consent, ...(d ? { abha: d } : {}) })
    if (m) return setE({ abha: m }); notify('Registration details updated.') }
  const T = (k: 'name' | 'age' | 'phone' | 'abha', l: string) => <Field label={l} error={e[k]}><input className={inp} value={f[k]} onChange={x => setF({ ...f, [k]: k === 'abha' ? fmtAbha(x.target.value) : x.target.value })} /></Field>
  return <Card title="Registration details"><form onSubmit={save} noValidate className="grid gap-3 sm:grid-cols-2">{T('name', 'Full name')}{T('phone', 'Contact number')}{T('age', 'Age')}
    <Field label="Sex"><select className={inp} value={f.sex} onChange={x => setF({ ...f, sex: x.target.value })}><option>Male</option><option>Female</option><option>Other</option></select></Field>{T('abha', 'ABHA ID')}
    <label className="flex items-center gap-2 text-sm sm:mt-6"><input type="checkbox" checked={f.consent} onChange={x => setF({ ...f, consent: x.target.checked })} />Patient consent for doctors to view records</label>
    <button className={btn + ' sm:col-span-2'}>Save changes</button></form></Card>
}

function SetupCode({ p }: { p: Patient }) {
  const { issueSetupCode } = useStore(); const [c, setC] = useState('')
  return <Card title="Patient account" icon={<KeyRound size={20} />}><p className="text-sm">If the patient has not set a password or has forgotten it, confirm their identity in person and issue a setup code. It replaces any earlier code.</p>
    <button className={btn2 + ' mt-2'} onClick={() => setC(issueSetupCode(p.id) || '')}>Issue setup code</button>
    {c && <p className="mt-3">Setup code: <code className="rounded bg-tint px-2 py-1 text-lg font-semibold text-navy">{c}</code><span className="block text-sm">Shown once. Valid for 72 hours and usable once.</span></p>}</Card>
}

function Upload_({ p }: { p: Patient }) {
  const { addDoc, notify } = useStore(); const [file, setFile] = useState<File | null>(null); const [k, setK] = useState(0); const [cat, setCat] = useState('Lab report'); const [date, setDate] = useState(new Date().toISOString().slice(0, 10)); const [desc, setDesc] = useState(''); const [ok, setOk] = useState(false); const [err, setErr] = useState('')
  const go = (ev: FormEvent) => { ev.preventDefault(); if (!file) return setErr('Choose a PDF or image file.')
    if (!(file.type === 'application/pdf' || file.type.startsWith('image/'))) return setErr('Only PDF or image files are supported.')
    if (file.size > 1.5 * 1024 * 1024) return setErr('The file is too large. The maximum size is 1.5 MB.')
    if (!ok) return setErr('Confirm that the document is verified and belongs to this patient.')
    const r = new FileReader(); r.onerror = () => setErr('The file could not be read.')
    r.onload = () => { const m = addDoc(p.id, { name: file.name, date, category: cat, desc }, String(r.result)); if (m) return setErr(m); setFile(null); setK(k + 1); setDesc(''); setOk(false); setErr(''); notify('Document uploaded.') }
    r.readAsDataURL(file) }
  return <Card title="Upload document" icon={<Upload size={20} />}><form onSubmit={go} noValidate className="grid gap-3 sm:grid-cols-2">
    <Field label="File (PDF or image)"><input key={k} type="file" accept=".pdf,image/*" className={inp} onChange={x => setFile(x.target.files?.[0] || null)} /></Field>
    <Field label="Category"><select className={inp} value={cat} onChange={x => setCat(x.target.value)}>{['Lab report', 'Imaging', 'Discharge summary', 'Prescription', 'Other'].map(c => <option key={c}>{c}</option>)}</select></Field>
    <Field label="Document date"><input type="date" className={inp} value={date} onChange={x => setDate(x.target.value)} /></Field>
    <Field label="Description"><input className={inp} value={desc} onChange={x => setDesc(x.target.value)} /></Field>
    <label className="flex items-start gap-2 text-sm sm:col-span-2"><input type="checkbox" className="mt-1" checked={ok} onChange={x => setOk(x.target.checked)} />I have verified that this document belongs to {p.name} ({p.id}).</label>
    {err && <p role="alert" className="text-sm text-red-700 sm:col-span-2">{err}</p>}<button className={btn + ' sm:col-span-2'}>Add document</button></form></Card>
}

function StaffPortal() {
  const { getRecord, pendingMine, openPending, me, uid } = useStore(); const [v, setV] = useState('pat'); const [sel, setSel] = useState<string | null>(null); const [done, setDone] = useState<{ p: Patient; code: string } | null>(null)
  const p = sel ? getRecord(sel) : null; const pending = pendingMine()
  const nav: Nav[] = [{ id: 'pat', label: 'Patient lookup', I: Search }, { id: 'reg', label: 'Register patient', I: UserPlus }]
  return <Shell nav={nav} view={v} setView={x => { setV(x); setSel(null); setDone(null) }}>
    {v === 'pat' && <><div><h1 className="text-2xl">{me}</h1><p>Registration desk · Staff ID {uid}</p></div>
      <AbhaLookup onFound={setSel} onClear={() => setSel(null)} />
      {pending.length > 0 && <Card title="Registrations awaiting an ABHA ID">{<ul className="divide-y divide-line">{pending.map(x => <li key={x.id} className="flex items-center justify-between py-2"><span>{x.name} <span className="text-sm">({x.id})</span></span><button className={btn2 + ' !py-1.5'} onClick={() => { openPending(x.id); setSel(x.id) }}>Open</button></li>)}</ul>}</Card>}
      {p && <><Profile p={p} /><Card><p className="text-sm">Diagnoses, prescriptions and the clinical timeline are available to treating doctors only.</p></Card>
        <EditDetails key={p.id + (p.abha || '')} p={p} /><SetupCode key={'s' + p.id} p={p} /><Card title="Documents"><DocTable docs={p.docs} /></Card><Upload_ key={'u' + p.id} p={p} /></>}</>}
    {v === 'reg' && !done && <Register onDone={setDone} />}
    {v === 'reg' && done && <Confirm d={done} setD={setDone} onOpen={() => { setSel(done.p.id); setV('pat'); setDone(null) }} />}</Shell>
}

export default function App() {
  const { role } = useStore()
  return role === 'patient' ? <PatientPortal /> : role === 'doctor' ? <DoctorPortal /> : role === 'staff' ? <StaffPortal /> : <Login />
}
