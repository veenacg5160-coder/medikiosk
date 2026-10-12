import { useState, FormEvent } from 'react'
import { useStore } from './store'
import { validatePw } from './auth-utils'
import { Field, inp, btn } from './ui'
import { CheckCircle2 } from 'lucide-react'

export function ActivateFlow({ onDone }: { onDone: () => void }) {
  const { activate, notify } = useStore()
  const [id, setId] = useState(''); const [code, setCode] = useState(''); const [pw, setPw] = useState(''); const [pw2, setPw2] = useState(''); const [show, setShow] = useState(false); const [err, setErr] = useState(''); const [ok, setOk] = useState(false)
  const submit = (ev: FormEvent) => { ev.preventDefault()
    if (!id.trim() || !code.trim()) return setErr('Enter your Patient ID and setup code.')
    const v = validatePw(pw); if (v) return setErr(v); if (pw !== pw2) return setErr('The passwords do not match.')
    const m = activate(id, code, pw); if (m) return setErr(m)
    setErr(''); setOk(true); notify('Password saved.') }
  if (ok) return <div className="space-y-3"><p className="flex items-center gap-2 text-green-800"><CheckCircle2 size={18} />Password saved. You can now log in with your Patient ID and new password.</p><button className={btn + ' w-full'} onClick={onDone}>Go to login</button></div>
  const t = show ? 'text' : 'password'
  return <form onSubmit={submit} noValidate className="space-y-3">
    <p className="text-sm">Ask the registration desk for a setup code. Staff will confirm your identity in person. Each code can be used once and expires after 72 hours.</p>
    <Field label="Patient ID"><input className={inp} value={id} onChange={e => setId(e.target.value)} autoComplete="off" /></Field>
    <Field label="Setup code"><input className={inp} value={code} onChange={e => setCode(e.target.value)} autoComplete="off" /></Field>
    <Field label="New password"><input className={inp} type={t} value={pw} onChange={e => setPw(e.target.value)} /></Field>
    <Field label="Confirm new password"><input className={inp} type={t} value={pw2} onChange={e => setPw2(e.target.value)} /></Field>
    <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={show} onChange={e => setShow(e.target.checked)} />Show passwords</label>
    {err && <p role="alert" className="text-sm text-red-700">{err}</p>}<button className={btn + ' w-full'}>Save password</button></form>
}

export function ChangePassword() {
  const { changePassword, notify } = useStore()
  const [cur, setCur] = useState(''); const [n1, setN1] = useState(''); const [n2, setN2] = useState(''); const [show, setShow] = useState(false); const [err, setErr] = useState('')
  const t = show ? 'text' : 'password'
  const submit = (ev: FormEvent) => { ev.preventDefault()
    if (!cur) return setErr('Enter your current password.')
    const v = validatePw(n1); if (v) return setErr(v); if (n1 !== n2) return setErr('The new passwords do not match.')
    const m = changePassword(cur, n1); if (m) return setErr(m)
    setErr(''); setCur(''); setN1(''); setN2(''); notify('Password updated.') }
  return <form onSubmit={submit} noValidate className="max-w-md space-y-3 rounded-xl border border-line bg-white p-5">
    <h2 className="text-lg">Change password</h2>
    <Field label="Current password"><input className={inp} type={t} value={cur} onChange={e => setCur(e.target.value)} /></Field>
    <Field label="New password"><input className={inp} type={t} value={n1} onChange={e => setN1(e.target.value)} /></Field>
    <Field label="Confirm new password"><input className={inp} type={t} value={n2} onChange={e => setN2(e.target.value)} /></Field>
    <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={show} onChange={e => setShow(e.target.checked)} />Show passwords</label>
    {err && <p role="alert" className="text-sm text-red-700">{err}</p>}<button className={btn}>Update password</button>
    <p className="text-xs">Do not share your password with anyone, including hospital staff.</p></form>
}
