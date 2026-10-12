# MediKiosk

Patient health-history prototype with Patient, Doctor and Hospital Staff portals. This is a **frontend-only** application: all records, accounts and uploaded files are kept in the browser's localStorage. It is not connected to ABHA, any government system, SMS or any backend, and ABHA IDs are matched only against MediKiosk's own records.

## Run
Requires Node.js 18+.

    npm install
    npm run dev      # open the printed localhost URL
    npm run build    # type-check + production build

## Accounts
Professional accounts are provisioned by an administrator (there is no sign-up screen). Seeded accounts, for evaluation:

| Role | ID | Password |
|---|---|---|
| Doctor | DR001 | doctor123 |
| Staff | ST001 | staff123 |
| Staff (inactive, cannot log in) | ST002 | staff456 |
| Patient | MKP0001 | patient123 |

Seeded patient ABHA IDs (fictional): MKP0001 `91-0000-0000-0001`, MKP0002 `91-0000-0000-0002`, MKP0003 `91-0000-0000-0003`. MKP0002 and MKP0003 have no password yet: staff look the patient up by ABHA ID and issue a setup code.

## Workflow
1. **Staff** registers a patient (ABHA ID, consent, health details; community screening is optional and separate). MediKiosk generates the patient ID (MKP0004, MKP0005, ...) and a one-time **setup code**.
2. The patient opens **Patient login > First-time setup or forgot password**, enters the patient ID and setup code, and chooses their own password. Codes are single-use, expire after 72 hours and lock after 5 wrong attempts. Account recovery uses the same route: staff confirm identity in person and issue a new code.
3. The patient logs in and sees their own history, reports and summary (read-only) and can change their password under Account.
4. **Doctor** enters the patient's ABHA ID. The record opens only if it exists and the patient's consent is recorded; otherwise a generic "no accessible record" message is shown. The doctor can add consultations, which are saved to the patient currently displayed. Changing the ABHA ID field closes the open record.
5. The patient sees the updated history on next login.

## Access rules
- Doctors and staff have **no patient list and no search by name, phone or patient ID**. Lookup is by exact ABHA ID only. ABHA ID is an identifier, not a credential.
- Staff can register patients, look up by ABHA ID, correct registration details, record consent, upload documents (PDF or image, up to 1.5 MB, with a verification confirmation) and issue setup codes. Staff never see diagnoses, prescriptions, conditions, allergies or the clinical timeline.
- Patients can read only their own record.
- Patients registered without an ABHA ID (policy flag `POLICY.allowWithoutAbha` in `src/data.ts`) cannot be found by lookup until an ABHA ID is added. The staff member who registered them sees them under "Registrations awaiting an ABHA ID".
- All reads and writes go through checks in `src/store.tsx` that depend on the signed-in role, a record granted by a successful lookup, and consent.

## Data
Records persist across refresh, login and logout, and nothing is reset automatically. Existing data from earlier versions is migrated in place.

## Important limitations
localStorage is not secure storage and the access checks run in the browser, so they can be bypassed by anyone with access to the browser. Passwords are stored with a simple non-cryptographic hash. A real deployment needs a backend database, server-side authentication with proper password hashing, sessions, server-side authorisation and audit logging, and an authorised ABHA integration if IDs are to be verified.
