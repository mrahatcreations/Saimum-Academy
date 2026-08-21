---
trigger: always_on
description: Core project guidelines and architecture for Saimum Academy Management System.
---

# 🎓 Saimum Central Academy Management System

Welcome to the Saimum Academy project. Whenever you work on this project, you MUST strictly follow the architecture, tech stack, design guidelines, and business rules outlined below.

---

## 1. Project Architecture (Micro-Frontend)
This project uses a modular folder structure. Do not mix frontend and backend code.
- `backend/`: Node.js API + Prisma ORM + PostgreSQL.
- `admin/`: Central Admin Panel (Vite + React).
- `department/`: Branch & Department Panel (Vite + React).
- `student/`: Student Dashboard (Vite + React).
- `frontend/`: Public Website.

---

## 2. Technology Stack
- **Frontend:** React, Vite.
- **Backend:** Node.js (Express/NestJS), Prisma ORM, PostgreSQL.
- **Styling:** Vanilla CSS / CSS Modules (Unless Tailwind is explicitly requested). DO NOT use generic UI component libraries that look like boilerplate.
- **Deployment:** Hostinger KVM VPS via Coolify (Docker/Nixpacks). Ensure everything works seamlessly in a containerized environment.

---

## 3. UI Language & Internationalization (STRICT RULE)
- **100% English UI in Admin & Management Panels:** All UI labels, table column headers, buttons, modal titles, field placeholders, KPI metric names, and badge texts in the Admin and Department panels MUST ALWAYS be in **100% standard, professional English**.
- **NO Bengali in UI Labels/Controls:** Do not inject Bengali text into UI controls, table headers, or buttons unless specifically requested for public-facing localized content.

---

## 4. Typography & Font Stack Hierarchy
- **English & Numbers:** **Montserrat** (`https://fonts.google.com/specimen/Montserrat`).
- **Bengali (Content Fallback):** **Baloo Da 2** (`https://fonts.google.com/specimen/Baloo+Da+2`).
- **CRITICAL Font-Family Order in CSS:** 
  ```css
  font-family: 'Montserrat', 'Baloo Da 2', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  ```
  *Rule:* Montserrat MUST always be declared BEFORE Baloo Da 2 so that all Latin letters, numbers, and symbols use Montserrat while Bengali characters smoothly fall back to Baloo Da 2.

---

## 5. Design & UI Guidelines (Dribbble-Standard Minimalism & Anti-Slop)
- **Aesthetic:** Corporate Design, Aesthetic Minimalism. Take inspiration from premium minimal designs on Dribbble, Apple, and Linear. The design must look sleek, confident, modern, and human-crafted.
- **NO VERBOSE SUBTITLES OR PARAGRAPH CLUTTER (STRICT RULE):** NEVER place multi-line description paragraphs or explanatory essays under page headers, modal titles, or card containers. Keep titles bold, clean, and confident (e.g. `Staff`, `Workshops`, `All Sessions (3)`). Real premium software does NOT clutter the screen with obvious descriptive essays.
- **ICONIC & MINIMAL CONTROLS (NO CLUNKY TEXT LABELS):** For standard interactive controls (such as Day/Night theme toggles, collapse/expand, refresh, search, print, export, and close), NEVER write out verbose text words (e.g., NEVER write "Day / Night" or "Toggle Dark Mode" as text). ALWAYS use sleek, interactive, micro-animated icon buttons with clean hover tooltips.
- **PUNCHY & COMPACT BUTTON LABELS:** Keep action button labels concise and punchy (e.g., `+ New Session`, `+ Add Staff`, `Export`, `Print` — NOT `+ Create New Workshop Session For Academy`).
- **Brand Color:** The primary brand color is Orange (`#FF790E` / `rgb(255, 121, 14)`), extracted directly from the project logo.
- **Strictly NO:** NO gradients, NO glow effects.
- **STRICT COLOR RULE (CRITICAL):** NO transparent or semi-transparent colors (NO `rgba(...)` tint washes, NO opacity color washes). Colors MUST ALWAYS be **100% solid flat colors**.
- **NO COLORED STROKES / OUTLINES (CRITICAL):** NEVER use colored outline strokes / border rings around pills, badges, or buttons (e.g. `border: none !important;`). Status badges and pills must use solid flat background fill without colored border strokes.
- **Dropdowns & Selects:** ALWAYS use the project's global `CustomSelect` component. NEVER use unstyled native browser `<select>` elements.
- **Avoid Boilerplate & Nested Boxes:** Avoid generic white cards with standard heavy shadows. Avoid unnecessary boxes-within-boxes. Use generous whitespace, subtle separators, and tinted neutrals.
- **Top KPI Metrics Strip:** Keep KPI metrics clean, concise, numerical, and uncluttered. NEVER put long multi-line titles into KPI metric cards. Use `white-space: nowrap` for badges and metrics.
- **CRITICAL - DATA & CONTENT:** NEVER copy dummy text, dummy data, or dummy names from UI reference images or templates provided by the user. When applying a design concept from an image, ONLY extract the CSS/UI styling (colors, layout, borders, shadows). You MUST always fill the UI with actual, relevant context and data for the Saimum Academy Management System.

---

## 6. Modals & Backdrop Standards (STRICT RULE)
- **ALWAYS use Global `<Modal>`:** Modals MUST ALWAYS use the global `<Modal>` component (`admin/src/components/ui/Modal.tsx`).
- **NEVER create Ad-hoc Local Modal Overlays:** Do NOT create local `.modalOverlay` classes with custom harsh pitch-black backgrounds.
- **Backdrop Styling:** Backdrops must always use a soft, elegant overlay (`rgba(15, 23, 42, 0.4)` + soft blur) so that Light Mode remains bright, clean, and professional without turning the entire page pitch black.
- **Modal Header & Close Button:** Modals must have a clean header, bold title, and a standardized close `X` button on top right.

---

## 7. Schedules & Time Pickers (STRICT RULE)
- **NO Rigid Shift Dropdowns:** Workshop/Batch schedules must NOT use rigid shift dropdowns (e.g. Daily shift).
- **Manual Days Input & Single-Row Chips:** Provide manual text input (e.g. `Friday & Saturday`) accompanied by clickable quick day toggle chips `[Fri] [Sat] [Sun] [Mon] [Tue] [Wed] [Thu] [Everyday]` that fit cleanly in a single row without breaking into ragged multiple lines.
- **Time Selection (Start & End Time):**
  - **NO Unstyled Native Time Inputs:** NEVER use native browser `<input type="time">` which renders dark/invisible clock icons and blue highlight artifacts in dark themes.
  - **Use `CustomSelect`:** ALWAYS use side-by-side `CustomSelect` dropdowns for **Start Time** and **End Time** with 12-hour AM/PM options (`09:00 AM`, `12:00 PM`).

---

## 8. Tables, Card Containers & Viewport Balance
- **Wrap Tables in `.tableCard`:** Tables must always be wrapped inside `.tableCard` with comfortable row padding (`padding: 16px 18px;`), smooth hover effects, and clean borders.
- **Non-Truncating Column Headers:** Ensure column widths and `white-space: nowrap;` prevent important table headers (such as `Schedule (Days & Time)`) from getting truncated (`SCHEDULE (DA...`).
- **Table Footer Summary:** Always include a `.tableFooterStrip` at the bottom of tables (e.g. `Showing X of Y batches`) to give the page structural weight and eliminate large empty voids.

---

## 9. Core Business Rules & Complete Operational Lifecycle (CRITICAL)
- **HQ & Branches:** Central HQ is located in Dhaka. Initial branches include Paltan (Physical), Mirpur (Physical), Chattogram (Physical), and Online (Virtual).
- **Admission Sessions:** Admin creates session specifying Title, Target Branch(es), Dates, Application Fee, Reg Code Prefix, and Subjects offered.
- **Physical & Online Viva:** Fee-paid applicants are invited to their respective branch venue (or online) for audition/viva and selected.
- **Branch Workshops & Cohorts:** Workshop is ALWAYS created under a specific branch with capacity-managed cohort batches.
- **Secure QR Attendance:** Attendance is captured STRICTLY via QR code scanning on student ID cards using the staff mobile scanner. Manual attendance entry is forbidden. Scans are only accepted on scheduled days/times, logging exact timestamp and staff scanner ID.
- **Composite Final Evaluation:** Workshop qualification is determined by:
  `Final Score = Attendance Score + Class Tests / Weekly Quizzes + Final Practical Exam`.
- **Regular Graduation:** Passed trainees graduate into continuous, ongoing regular department batches (e.g. Paltan Vocal Music Batch 01).
- **Regular Batches Governed by Department:** Regular batches belong to a `Department + Branch`. Staff assigned to a Department automatically supervise and moderate all regular batches under that department without requiring manual batch-by-batch assignment.
- **Workshop Batches Moderated by Individuals:** Workshops are short-term intensive cohorts where specific individual trainers/moderators are directly assigned (`WorkshopBatchModerator`) for QR attendance scanning and weekly quiz/exam grading.
- **NO Duplication:** Master `Subject` is created once centrally and assigned to `Branches`. Do not recreate subjects for different branches.
- **Relationships:** `Department` ↔ `Branch` is Many-to-Many.
- **Batch Membership:** Batches are ongoing cohorts. A student's enrollment year does not dictate the batch creation year (e.g., a 2026 student can join "Batch 1" created in 2025).
- **Person Profile:** A human being has ONE `Person` profile, but can have MULTIPLE `Registrations`. Never duplicate a person.

---

## 10. References
Before making major architectural changes, always read the master plan located at:
`/Saimum_Central_Academy_Architecture_Plan.md` and `/admin_workflow_flowchart.md`
