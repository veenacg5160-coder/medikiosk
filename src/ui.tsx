import { ReactNode, useState } from 'react'
import { Patient, DocItem } from './types'
import { summarise } from './summary'
import { readFile } from './store'
import { Eye, FileText, Stethoscope, Scissors, FlaskConical, AlertCircle, Sparkles, X, Inbox } from 'lucide-react'
export const inp = 'w-full rounded-lg border border-line bg-white px-3 py-2.5 text-ink focus:border-brand'
export const btn = 'inline-flex items-center justify-center gap-2 rounded-lg bg-brand px-4 py-2.5 font-medium text-white hover:bg-blue-700 disabled:opacity-50'
export const btn2 = 'inline-flex items-center justify-center gap-2 rounded-lg border border-line bg-white px-4 py-2.5 font-medium text-navy hover:bg-tint'
export const Card = ({ title, icon, children, className = '' }: { title?: string; icon?: ReactNode; children: ReactNode; className?: string }) => (
  <section className={`rounded-xl border border-line bg-white p-5 ${className}`}>
    {title && <h2 className="mb-3 flex items-center gap-2 text-lg">{icon}{title}</h2>}{children}</section>)
export const Field = ({ label, error, children }: { label: string; error?: string; children: ReactNode }) => (
  <label className="block text-sm font-medium text-navy">{label}<div className="mt-1 font-normal">{children}</div>{error && <p className="mt-1 text-sm text-red-700">{error}</p>}</label>)
export const Chip = ({ children, tone = 'blue' }: { children: ReactNode; tone?: 'blue' | 'red' | 'green' | 'grey' }) => {
  const t = { blue: 'bg-tint text-navy', red: 'bg-red-50 text-red-800', green: 'bg-green-50 text-green-800', grey: 'bg-slate-100 text-ink' }[tone]
  return <span className={`inline-block rounded-full px-2.5 py-0.5 text-sm ${t}`}>{children}</span>
}
export const Empty = ({ text }: { text: string }) => <div className="flex items-center gap-2 rounded-lg bg-page p-4 text-sm"><Inbox size={18} />{text}</div>
const ico = { consultation: Stethoscope, surgery: Scissors, test: FlaskConical, event: AlertCircle }
export function Timeline({ p }: { p: Patient }) {
  const rs = [...p.records].sort((a, b) => b.date.localeCompare(a.date))
  if (!rs.length) return <Empty text="No medical history recorded yet. Entries appear after hospital visits." />
  return <ol className="relative ml-3 border-l-2 border-tint">{rs.map(r => { const I = ico[r.type]; return (
    <li key={r.id} className="mb-5 ml-6"><span className="absolute -left-[15px] flex h-7 w-7 items-center justify-center rounded-full bg-brand text-white"><I size={15} /></span>
      <p className="text-sm">{r.date} · {r.doctor}</p><h3 className="text-base">{r.title}</h3><p>{r.notes}</p>
      {r.diagnosis && <p><b className="text-navy">Diagnosis:</b> {r.diagnosis}</p>}
      {r.prescription && <p><b className="text-navy">Prescription:</b> {r.prescription}</p>}</li>) })}</ol>
}
export function DocTable({ docs }: { docs: DocItem[] }) {
  const [v, setV] = useState<DocItem | null>(null)
  const data = v ? readFile(v.id) : null
  if (!docs.length) return <Empty text="No documents uploaded yet." />
  return <>
    <div className="overflow-x-auto"><table className="w-full text-left text-sm"><thead className="text-navy"><tr>{['Document', 'Date', 'Type', 'Status', ''].map(h => <th key={h} className="border-b border-line py-2 pr-3">{h}</th>)}</tr></thead>
      <tbody>{docs.map(d => <tr key={d.id}><td className="border-b border-line py-2.5 pr-3"><FileText size={14} className="mr-1 inline" />{d.name}</td><td className="border-b border-line pr-3">{d.date}</td><td className="border-b border-line pr-3">{d.category}</td>
        <td className="border-b border-line pr-3"><Chip tone="green">{d.status}</Chip></td>
        <td className="border-b border-line"><button className={btn2 + ' !py-1.5'} onClick={() => setV(d)}><Eye size={15} />View</button></td></tr>)}</tbody></table></div>
    {v && <div role="dialog" aria-modal="true" className="fixed inset-0 z-30 flex items-center justify-center bg-navy/40 p-4"><div className="max-h-[90vh] w-full max-w-2xl overflow-auto rounded-xl bg-white p-5">
      <div className="flex justify-between"><h3>{v.name}</h3><button aria-label="Close" onClick={() => setV(null)}><X /></button></div>
      <p className="mt-2">{v.category} · {v.date}</p><p>{v.desc || 'No description.'}</p>
      {data ? (data.startsWith('data:image') ? <img alt={v.name} src={data} className="mt-3 max-h-[60vh] w-full object-contain" /> : <object data={data} type="application/pdf" className="mt-3 h-[60vh] w-full"><a className="text-brand underline" href={data} download={v.name}>Download file</a></object>)
        : <p className="mt-3 rounded-lg bg-tint p-3 text-sm">No file preview is available for this document. Only its details were recorded.</p>}</div></div>}</>
}
const L = ({ t, items, tone }: { t: string; items: string[]; tone?: 'red' }) => (
  <div><h3 className="text-base">{t}</h3>{items.length ? <ul className="mt-1 list-disc pl-5">{items.map((x, i) => <li key={i} className={tone === 'red' ? 'text-red-800' : ''}>{x}</li>)}</ul> : <p className="text-sm">Nothing recorded.</p>}</div>)
export function SummaryPanel({ p }: { p: Patient }) {
  const s = summarise(p)
  return <Card title="AI-assisted history summary" icon={<Sparkles size={20} className="text-brand" />} className="!bg-tint">
    <p className="mb-4 rounded-lg border border-line bg-white p-3 text-sm">Compiled from recorded information only. It is informational and is not a diagnosis. Doctors must verify it against the original records.</p>
    <div className="grid gap-4 md:grid-cols-2">
      <L t="Known medical conditions" items={s.conditions} /><L t="Recorded allergies" items={s.allergies} tone="red" />
      <L t="Current or previously documented medications" items={s.meds} /><L t="Surgeries and major medical events" items={s.events} />
      <L t="Test results and report dates" items={s.tests} /><L t="Recent consultations" items={s.recent} />
      <div className="md:col-span-2"><L t="Missing or unverified information" items={s.missing} /></div></div></Card>
}
