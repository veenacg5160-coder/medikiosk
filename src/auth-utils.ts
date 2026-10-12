// Non-cryptographic hash used so plain passwords are not kept in localStorage.
// This is not secure storage: real deployments need server-side password hashing.
export const hash = (id: string, pw: string) => { let h = 2166136261; const s = id + ':' + pw; for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619) } return (h >>> 0).toString(16) }
const rnd = (n: number) => crypto.getRandomValues(new Uint32Array(1))[0] % n
export const setupCode = () => Array.from({ length: 4 }, () => 'ABCDEFGHJKMNPQRSTUVWXYZ'[rnd(23)]).join('') + '-' + String(1000 + rnd(9000))
export const validatePw = (pw: string) => pw.length < 8 ? 'Password must be at least 8 characters.' : !/[A-Za-z]/.test(pw) || !/\d/.test(pw) ? 'Password must include a letter and a number.' : null
export const fmtAbha = (s: string) => { const d = s.replace(/\D/g, '').slice(0, 14); return [d.slice(0, 2), d.slice(2, 6), d.slice(6, 10), d.slice(10, 14)].filter(Boolean).join('-') }
