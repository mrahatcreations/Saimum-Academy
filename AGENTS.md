---
trigger: always_on
description: Core project guidelines and architecture for Saimum Academy Management System.
---

# 🎓 Saimum Central Academy Management System

Welcome to the Saimum Academy project. Whenever you work on this project, you MUST strictly follow the architecture, tech stack, and business rules outlined below.

## 1. Project Architecture (Micro-Frontend)
This project uses a modular folder structure. Do not mix frontend and backend code.
- `backend/`: Node.js API + Prisma + PostgreSQL.
- `admin/`: Central Admin Panel (Vite + React).
- `department/`: Branch & Department Panel (Vite + React).
- `student/`: Student Dashboard (Vite + React).
- `frontend/`: Public Website.

## 2. Technology Stack
- **Frontend:** React, Vite.
- **Backend:** Node.js (Express/NestJS), Prisma ORM, PostgreSQL.
- **Styling:** Vanilla CSS / CSS Modules (Unless Tailwind is explicitly requested). DO NOT use generic UI component libraries that look like boilerplate.
- **Deployment:** Hostinger KVM VPS via Coolify (Docker/Nixpacks). Ensure everything works seamlessly in a containerized environment.

## 3. Design & UI Guidelines (Impeccable & Anti-Slop)
- **Aesthetic:** Corporate Design, Aesthetic Minimalism. Take inspiration from premium minimal designs on Dribbble. The design must look premium, modern, and human-crafted.
- **Brand Color:** The primary brand color is Orange (`#FF790E` / `rgb(255, 121, 14)`), extracted directly from the project logo.
- **Strictly NO:** NO gradients, NO glow effects.
- **Avoid Boilerplate:** Stop putting everything in generic white cards with standard shadows. Use generous whitespace, subtle separators, and tinted neutrals.
- **Typography:** Use tight headings, loose body text, and modern fonts (e.g., Geist, Satoshi, Poppins).
- **Motion:** Add subtle micro-interactions and smooth spring transitions to interactive elements.

## 4. Core Business Rules (CRITICAL)
- **NO Duplication:** Master `Subject` is created once centrally and assigned to `Branches`. Do not recreate subjects for different branches.
- **Relationships:** `Department` ↔ `Branch` is Many-to-Many.
- **Batch Membership:** Batches are ongoing cohorts. A student's enrollment year does not dictate the batch creation year (e.g., a 2026 student can join "Batch 1" created in 2025).
- **Person Profile:** A human being has ONE `Person` profile, but can have MULTIPLE `Registrations`. Never duplicate a person.

## 5. References
Before making major architectural changes, always read the master plan located at:
`/Saimum_Central_Academy_Architecture_Plan.md`
