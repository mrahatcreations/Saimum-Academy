# 🎓 Saimum Central Academy — Work Session Summary & Architectural Records
**Date:** August 21, 2026  
**Repository:** `mrahatcreations/Saimum-Academy`  
**Workspace:** `d:\Saimum Academy`

---

## 📌 Executive Summary of Decisions & Milestones Accomplished

### 1. 👥 Staff & Faculty Architecture vs Student Roster Isolation
- **Strict Separation Rule:**
  - Staff members (Directors, Faculty, Instructors, Accounts Officers, Evaluators) must **NEVER** be counted in student rosters or student metrics, even if they hold historical student IDs from past training.
  - Exactly **351 Pure Regular Students** are active in the database and displayed across all academic endpoints and student management pages.
  - Staff members with previous student IDs (e.g. #202406000005, #201803000010) have their `#ID` stored in `staff.studentId` purely for reference, with zero impact on student counts.

### 2. 🏛️ Official System Role & Designation Hierarchy
- **System Role (`role: STAFF` | `SUPER_ADMIN`):**
  - All academy personnel have the core system role **`STAFF`** (with **`SUPER_ADMIN`** reserved for central director operations).
- **Designations (`designation`):**
  - Strictly limited to the 4 official academy functions:
    1. **`Department Admin`**: Wing Directors / Department Heads (শিশু বিভাগ, সঙ্গীত বিভাগ, থিয়েটার বিভাগ, ক্বিরাত বিভাগ, আবৃত্তি ও উপস্থাপনা বিভাগ, কেন্দ্রীয় প্রশাসন).
    2. **`Teacher`**: Regular academy faculty, class instructors, and trainers.
    3. **`Account Officer`**: Finance, fee collections, ledger, money receipts, and voucher auditing (Md Tawhid Alam Mondol).
    4. **`Super Admin`**: Central operational authority.
- **Multiple Designations:**
  - A person can hold multiple official titles (e.g. Mohiuddin Azad is both `Department Admin, Teacher`).

### 3. 🎨 Dribbble-Standard Minimalist Table UI (Staff Management)
- **Compact Color-Coded Micro-Icon Badges:**
  - 🏛️ `Building2` (Dark Warm Orange): **Department Admin**
  - 📖 `BookOpen` (Dark Emerald Green): **Teacher**
  - 🧾 `Receipt` (Dark Royal Purple): **Account Officer**
  - 🛡️ `ShieldCheck` (Deep Purple): **Super Admin**
- **Smart Embedded Tooltips:**
  - Hovering over a `Department Admin` or `Teacher` icon reveals their specific assigned departments (e.g., `Department Admin (শিশু বিভাগ)`, `Teacher (সঙ্গীত বিভাগ)`), eliminating the need for a wide redundant "Assigned Departments" column.
- **Dark Mode Perfection:**
  - Fully solid, theme-adaptive high-contrast badges with zero white glare.

### 4. 🎓 Student Lifecycle & Types
- **Role `Student` Types:**
  - **`REGULAR`**: Passed 3-month workshop and graduated to continuous regular department batches (351 students).
  - **`WORKSHOP`**: Currently training in 3-month intensive workshop cohorts.
  - **`ONLINE`**: Enrolled in remote/virtual batches.
- **Role `Applicant`:**
  - Users who registered via admissions circular but haven't completed workshop qualification.

### 5. 💳 Financial Management & Real SQL Ledger
- **Route:** `/financial-management` (Financial Management & Executive Accounts).
- **Payments Route:** `/payments` (Clean collections ledger showing only received funds, category breakdowns, and transaction IDs — dues are isolated to Financial Management).
- **Data Ingestion:** Ingested 3,457 real SQL transactions totaling ৳2,258,278 in authentic collections.

---

## 🗄️ Database Distribution Snapshot

| Entity / Category | Count | Description |
| :--- | :---: | :--- |
| **🎓 Pure Regular Students** | **351** | Excludes all 24 staff members |
| **👥 Official Staff & Faculty** | **34** | 8 Dept Admins, 17 Teachers, 2 Account Officers, 5 Examiners, 2 Super Admins |
| **💳 Real Payment Vouchers** | **3,457** | 2,103 Paid (৳22.58L) + 1,349 Due Vouchers |
| **🏢 Departments** | **5** | শিশু, সঙ্গীত, থিয়েটার, ক্বিরাত, আবৃত্তি ও উপস্থাপনা |
| **🏛️ Branches** | **4** | Paltan (HQ), Mirpur, Chattogram, Online |

---

## 🚀 Git History & Verification
- All features, schemas, and UI components built, TypeScript type-checked (`npm run build`), and pushed to GitHub remote `origin/main`.
