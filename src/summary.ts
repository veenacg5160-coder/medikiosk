import { Patient } from './types'
export function summarise(p: Patient) {
  const rec = [...p.records].sort((a, b) => b.date.localeCompare(a.date))
  const f = (r: { title: string; date: string }) => `${r.title} (${r.date})`
  const missing: string[] = []
  if (!p.allergies.length) missing.push('No allergy information recorded; confirm with patient.')
  if (!p.conditions.length) missing.push('No conditions recorded.')
  if (!p.vaccinations.length) missing.push('No vaccination history recorded.')
  if (!rec.length) missing.push('No consultations on file.')
  if (p.screening) missing.push(`Community screening note, not a confirmed diagnosis: ${p.screening}`)
  return {
    conditions: p.conditions, allergies: p.allergies,
    meds: rec.filter(r => r.prescription).map(r => `${r.prescription} (${r.date})`),
    events: [...rec.filter(r => r.type === 'surgery' || r.type === 'event').map(f), ...p.history],
    tests: rec.filter(r => r.type === 'test').map(r => `${f(r)}: ${r.notes}`),
    recent: rec.filter(r => r.type === 'consultation').slice(0, 3).map(r => `${f(r)}${r.diagnosis ? ' - ' + r.diagnosis : ''}`),
    missing,
  }
}
