# সাইমুম শিল্পীগোষ্ঠী — কেন্দ্রীয় একাডেমি
## Website & Academy Management System — Complete Architecture & Product Plan

> **উদ্দেশ্য:** এই ডকুমেন্টটি Developer/Software Architect-এর জন্য একটি পূর্ণাঙ্গ Product & Architecture Brief। এটি UI-এর চূড়ান্ত ডিজাইন নয়; বরং Website, Admin/Management Panel, Branch Management, Admission Lifecycle, Student History, Class Management এবং Online Academy পরিচালনার জন্য কী কী কাঠামো ও Feature দরকার তার বিস্তারিত ব্যাখ্যা।

---

# 1. Executive Summary

সাইমুম শিল্পীগোষ্ঠীর কেন্দ্রীয় একাডেমির জন্য এমন একটি Web-based Academy Management System তৈরি করতে হবে, যেখানে Public Website-এর পাশাপাশি Academy-এর পুরো operational workflow পরিচালনা করা যাবে।

সিস্টেমের প্রধান কাজ:

- Central Academy পরিচালনা
- একাধিক Branch পরিচালনা
- Online Branch পরিচালনা
- Department পরিচালনা
- Master Subject তৈরি ও বিভিন্ন Branch-এ Assign করা
- Branch/Subject অনুযায়ী Batch পরিচালনা
- Student/Applicant-এর সম্পূর্ণ ইতিহাস সংরক্ষণ
- Admission → Viva → Selection → Workshop → Exam → Regular Student lifecycle পরিচালনা
- Physical ও Zoom-based Online Class পরিচালনা
- Attendance
- Workshop Evaluation
- Exam & Result
- Branch/Department দায়িত্বশীলদের আলাদা access
- Student Portal
- Finance/Office management-এর প্রাথমিক কাঠামো
- Reports
- Public Website Content Management

---

# 2. সবচেয়ে গুরুত্বপূর্ণ Business Rules

## 2.1 Branch একটি মূল Organizational Unit

Branch শুধু একটি location নয়। এটি Academy-এর একটি operational unit।

Branch হতে পারে:

- Physical Branch
- Online Branch

ভবিষ্যতে নতুন Physical Branch বা অন্য ধরনের Branch যোগ করা যাবে।

প্রতিটি Branch-এর নিজস্ব:

- Branch Director
- Branch Office Secretary
- Branch Finance Secretary
- Departments/Programs
- Classes
- Students
- Batches

থাকতে পারে।

---

## 2.2 Department ও Branch একে অপরের সরাসরি Parent/Child নয়

একটি Department একাধিক Branch-এ চালু থাকতে পারে।

একটি Branch-এ একাধিক Department থাকতে পারে।

অর্থাৎ:

**Department ↔ Branch = Many-to-Many relationship**

উদাহরণ:

- সংগীত বিভাগ → Physical Branch A
- সংগীত বিভাগ → Physical Branch B
- সংগীত বিভাগ → Online Branch

এবং:

- Online Branch → সংগীত
- Online Branch → অভিনয়
- Online Branch → আবৃত্তি

---

## 2.3 Subject একবার তৈরি হবে

Subject Central Academy-এর Master Subject হিসেবে একবার তৈরি করা হবে।

উদাহরণ:

- সংগীত
- অভিনয়
- আবৃত্তি

একই Subject আবার অন্য Branch-এর জন্য নতুন করে তৈরি করা যাবে না।

বরং Subject-কে বিভিন্ন Branch-এ Assign/Activate করা হবে।

উদাহরণ:

**Subject: সংগীত**

Assigned Branches:
- Branch A
- Branch B
- Online Branch

---

## 2.4 Subject ও Branch-এর Assignment আলাদা Entity হিসেবে ভাবতে হবে

একটি Subject একটি Branch-এ চালু হলে একটি `Branch Subject` বা `Subject Offering` তৈরি হবে।

এখানে রাখা যেতে পারে:

- Branch
- Subject
- Status
- Responsible person
- Start date
- Description
- Class configuration

এটি Subject Master-কে duplicate হওয়া থেকে রক্ষা করবে।

---

## 2.5 Batch প্রতি বছর বাধ্যতামূলকভাবে নতুন হবে না

বর্তমান বাস্তব ব্যবস্থায় Batch একটি স্থায়ী/চলমান Group।

উদাহরণ:

2025 Workshop → Regular → Music Batch 1

2026 নতুন Student → একই Music Batch 1-এ যুক্ত হতে পারে।

2027 নতুন Student → একই Batch-এ যুক্ত হতে পারে।

তাই:

**Batch Created Year ≠ Student Joining Year**

প্রতিটি Student-এর আলাদা Joining/Enrollment Date থাকবে।

---

## 2.6 Person এবং Registration আলাদা

একজন মানুষের একটি Permanent Person/Student Profile থাকবে।

তার একাধিক Registration থাকতে পারে।

উদাহরণ:

Rahim

- 2025 → Music registration → Passed → Music Batch 1
- 2027 → Acting registration → Workshop
- 2028 → আবার অন্য Subject

তাকে প্রতিবার নতুন Student হিসেবে তৈরি করা যাবে না।

---

# 3. High-Level Architecture

```text
Central Academy
│
├── Branches
│   ├── Physical Branch A
│   ├── Physical Branch B
│   └── Online Branch
│
├── Departments
│
├── Master Subjects
│
├── People / Students
│
└── System Users
```

Operational relationship:

```text
Branch
  ↕
Department
  ↓
Branch Subject / Offering
  ↓
Batch
  ↓
Student Membership
```

Admission relationship:

```text
Person
  ↓
Registration / Application
  ↓
Viva
  ↓
Selection
  ↓
Workshop
  ↓
Final Assessment / Exam
  ↓
Regular Enrollment
  ↓
Batch Membership
```

---

# 4. User & Dashboard Architecture

সিস্টেমে মূলত ৩ ধরনের Dashboard থাকবে:

## A. Central Admin Dashboard

পুরো Academy-এর সর্বোচ্চ Management Dashboard।

## B. Management / Responsible Dashboard

Branch Director, Department Director, Office Secretary, Finance Secretary, Instructor ইত্যাদির জন্য Permission-based Dashboard।

একই application-এর মধ্যে তাদের role অনুযায়ী আলাদা data/access থাকবে।

## C. Student Dashboard

শিক্ষার্থীর নিজের Academy-related তথ্য ও কার্যক্রমের জন্য।

---

# 5. Central Admin Panel

## Main Sidebar

```text
Dashboard

Admissions
Students

Branches
Departments
Subjects
Batches

Classes
Attendance

Workshops
Exams & Results

Finance
Office & Documents

Users & Roles
Announcements

Reports
Website Content

Settings
```

---

# 6. Admin → Dashboard

Dashboard-এ পুরো Academy-এর snapshot থাকবে।

## Summary Cards

- Total Active Students
- Total Applicants
- Pending Viva
- Active Workshops
- Active Branches
- Active Departments
- Active Subjects
- Active Batches
- Today's Classes
- Upcoming Classes

## Admission Funnel

```text
Applications
    ↓
Viva
    ↓
Selected
    ↓
Workshop
    ↓
Exam
    ↓
Regular Students
```

প্রতিটি stage-এর count দেখা যাবে।

## Branch Overview

প্রতি Branch-এর:

- Active Students
- Departments
- Subjects
- Batches
- Upcoming Classes

## Recent Activities

যেমন:

- নতুন Application
- Viva Result
- Student Approved
- Workshop Started
- Exam Published
- New Batch Member
- New Announcement

---

# 7. Admin → Admissions

## Sub-menu

```text
All Applications
New Applications
Viva
Selection
Workshops
Registration History
```

## All Applications

Columns:

- Applicant
- Registration ID
- Application Year
- Branch
- Department
- Subject
- Status
- Applied Date
- Actions

Filters:

- Year
- Branch
- Department
- Subject
- Status
- Gender
- Age
- Date range

---

# 8. Applicant Profile

Applicant-এর পুরো Journey এখানে দেখা যাবে।

## Personal Information

- Name
- Photo
- Date of Birth
- Gender
- Contact
- Address
- Education
- Guardian information যেখানে প্রয়োজন

## Eligibility

System configurable rules অনুযায়ী:

- Age eligibility
- Gender-specific rule
- Education eligibility
- অন্যান্য criteria

বর্তমান নিয়ম অনুযায়ী:

- মেয়েদের ক্ষেত্রে Class 3-এর ওপরে কাউকে নেওয়া হবে না
- ছেলেদের ক্ষেত্রে Honours-এর মধ্যে থাকতে হবে

এই rules hard-code না করে Settings থেকে configurable রাখা উচিত।

## Previous History

Applicant আগে Academy-তে আবেদন/ভর্তি করেছে কিনা দেখাবে।

উদাহরণ:

```text
2025
Music
Workshop
Passed
Regular Student
Music Batch 1

2027
Acting
Workshop
Failed
```

---

# 9. Viva Management

Viva page-এ:

- Candidate list
- Viva date
- Panel/Examiner
- Evaluation criteria
- Score
- Notes
- Recommendation
- Result

Possible status:

- Pending
- Scheduled
- Completed
- Selected
- Rejected
- Waitlisted

---

# 10. Selection Management

Viva-এর পরে Selected/Rejected করা যাবে।

Selected হলে পরবর্তী step হিসেবে Workshop assign করা যাবে।

Admin action:

**Select → Create/Assign Workshop Enrollment**

---

# 11. Workshop Management

## Workshop List

প্রতিটি Workshop একটি নির্দিষ্ট admission cohort।

উদাহরণ:

**2026 Music Workshop**

Fields:

- Name
- Branch
- Department
- Subject
- Start Date
- End Date
- Duration
- Instructor
- Status

Status:

- Upcoming
- Active
- Completed
- Cancelled

## Workshop Students

প্রতি Workshop-এ থাকবে:

- Applicants
- Attendance
- Performance
- Behaviour
- Skill
- Instructor Evaluation
- Remarks

---

# 12. Workshop Evaluation

প্রতিটি Candidate-এর Evaluation:

- Attendance
- Discipline/Behaviour
- Learning attitude
- Vocal/Acting/Recitation skill as applicable
- Improvement
- Overall potential
- Instructor remarks

এগুলো configurable evaluation criteria হওয়া ভালো।

---

# 13. Exam & Results

Workshop শেষে Final Exam/Assessment।

## Exam

Fields:

- Exam Name
- Workshop
- Branch
- Department
- Subject
- Date
- Examiner
- Total Marks
- Pass Marks

## Results

Candidate:

- Score/Grade
- Pass/Fail
- Remarks

Pass করলে:

**Enroll as Regular Student**

তারপর:

- Branch
- Department
- Subject
- Existing Batch

নির্বাচন করে Membership তৈরি করা যাবে।

Fail হলে:

- Registration history-তে Failed থাকবে
- Future re-registration allowed থাকবে

---

# 14. Students

## Sub-menu

```text
All Students
Active Students
Inactive Students
Search
Student History
```

## Student Profile

একটি Student Profile হবে Master Record।

Sections:

### Overview
- Name
- Photo
- Student ID
- Current Status
- Current Memberships

### Current Academic Memberships

উদাহরণ:

- Online Branch → Music → Batch 1
- Physical Branch → Acting → Batch 2

### Registration History

প্রতিটি Registration:

- Year
- Branch
- Department
- Subject
- Workshop
- Viva
- Exam
- Result
- Final Status

### Batch Membership History

- Joined
- Transferred
- Left
- Rejoined

### Attendance

### Classes

### Exams

### Documents

### Notes

---

# 15. Branch Management

## Branch List

Fields:

- Branch Name
- Type
- Status
- Director
- Departments
- Active Students
- Active Batches

Branch Type:

- Physical
- Online

## Create Branch

Fields:

- Name
- Code
- Type
- Address (Physical)
- Online configuration (Online)
- Director
- Office Secretary
- Finance Secretary
- Status

---

# 16. Branch Details

একটি Branch খুললে:

```text
Overview
Departments
Subjects
Batches
Students
Classes
Attendance
Workshops
Exams
Finance
Staff
Reports
Settings
```

### Online Branch

এর ক্ষেত্রে অতিরিক্ত:

- Zoom configuration
- Online Class defaults
- Meeting links
- Online attendance rules

---

# 17. Department Management

Department Central Academy-এর Master organizational unit।

## Department List

- Department Name
- Director
- Active Branches
- Subjects
- Students
- Status

## Department Details

```text
Overview
Branches
Subjects
Batches
Students
Classes
Workshops
Exams
Staff
Reports
```

---

# 18. Department ↔ Branch Assignment

একটি Department একাধিক Branch-এ চালু থাকতে পারে।

Admin:

**Department → Manage Branches**

এখানে:

```text
Available Branches

☑ Central Physical
☑ Branch B
☑ Online Branch
☐ Branch C
```

Assign/Deactivate করা যাবে।

---

# 19. Subject Master Management

## Subject List

উদাহরণ:

- সংগীত
- অভিনয়
- আবৃত্তি

প্রতিটি Subject:

- Name
- Code
- Description
- Status
- Assigned Branch count

## Create Subject

Subject একবার তৈরি হবে।

তারপর Branch-এ Assign করা হবে।

---

# 20. Branch Subject / Subject Offering

Branch-এর মধ্যে Subject চালু করতে:

**Branch → Subjects → Add Existing Subject**

এখানে নতুন Subject তৈরি নয়।

Existing Master Subject select করতে হবে।

Fields:

- Subject
- Branch
- Department
- Responsible Person
- Status
- Start Date

---

# 21. Batch Management

Batch হলো নির্দিষ্ট Branch + Subject context-এর Training Group।

উদাহরণ:

```text
Online Branch
→ Music
→ Batch 1
```

Batch Details:

- Batch Name
- Branch
- Department
- Subject
- Created Date
- Status
- Responsible Instructor
- Members
- Schedule

## Batch Members

প্রতি Member-এর:

- Student
- Joined Date
- Membership Status
- Source Registration
- Notes

---

# 22. Batch-এর গুরুত্বপূর্ণ নিয়ম

Batch yearly cohort হিসেবে বাধ্যতামূলক নয়।

একই Batch-এ বিভিন্ন বছরের নতুন Student যোগ হতে পারে।

তাই:

```text
Batch 1
├── Student A — Joined 2025
├── Student B — Joined 2025
├── Student C — Joined 2026
└── Student D — Joined 2027
```

---

# 23. Classes

## Main Views

- Calendar
- List
- Upcoming
- Past
- Online
- Physical

## Create Class

Select:

1. Branch
2. Department
3. Subject
4. Batch
5. Instructor
6. Date
7. Time
8. Class Type
9. Location / Zoom Link
10. Notes

Class Type:

- Physical
- Online

---

# 24. Online Classes

Online Branch-কে সাধারণ Branch-এর মতোই treat করতে হবে।

Online class-এর মাধ্যমে:

- Zoom
- Live Class Schedule
- Join Link
- Meeting ID
- Password
- Instructor
- Attendance

manage করা যাবে।

Student Dashboard থেকে:

**Upcoming Class → Join Zoom**

---

# 25. Attendance

Attendance Class-based হবে।

Flow:

**Branch → Department → Subject → Batch → Class → Students**

Status:

- Present
- Absent
- Late
- Excused

Reports:

- Student-wise
- Batch-wise
- Subject-wise
- Workshop-wise
- Date range

---

# 26. Users & Roles

## System Roles

Central:

- Super Admin
- Director
- Office Secretary
- Finance Secretary

Branch:

- Branch Director
- Branch Office Secretary
- Branch Finance Secretary

Department/Operational:

- Department Director
- Department Office Secretary
- Department Finance Secretary
- Instructor/Teacher

Student:

- Student

---

# 27. Role-Based Access Control

একজন User শুধু তার assigned scope-এর data পাবে।

উদাহরণ:

### Super Admin

সব Branch/Department/Student দেখতে ও পরিচালনা করতে পারবে।

### Branch Director

নিজের Branch-এর:

- Departments
- Subjects
- Batches
- Students
- Classes
- Attendance

manage করতে পারবে।

### Department Director

নিজের Department-এর assigned Branch/Subject/Batch scope-এর data দেখতে/পরিচালনা করতে পারবে।

### Finance Secretary

Finance-related access পাবে।

### Student

শুধু নিজের information পাবে।

---

# 28. Finance

প্রথম Version-এ প্রয়োজন অনুযায়ী basic finance রাখলেও Architecture scalable হতে হবে।

## Central Finance

- Income
- Expense
- Payments
- Reports

## Branch Finance

Branch-wise:

- Income
- Expense
- Payment
- Reports

## Student Payment

যদি Registration/Workshop/Fee থাকে:

- Payment
- Due
- Paid
- History

---

# 29. Office & Documents

## Document Categories

- Student Documents
- Admission Documents
- Official Documents
- Notices
- Certificates
- Administrative Documents

প্রয়োজন অনুযায়ী access permission থাকবে।

---

# 30. Announcements

Announcement তৈরি করা যাবে:

- Academy-wide
- Branch-specific
- Department-specific
- Batch-specific
- Student-specific

Channels:

- Website
- Management Dashboard
- Student Dashboard

---

# 31. Reports

## Student Reports

- Total Students
- Active Students
- Branch-wise
- Department-wise
- Subject-wise
- Batch-wise

## Admission Reports

- Applications
- Viva
- Selected
- Workshop
- Passed
- Failed
- Conversion rate

## Attendance Reports

- Student
- Batch
- Branch
- Department
- Date range

## Historical Reports

Year-wise registration and admission history।

---

# 32. Website Content Management

Public Website-এর জন্য:

- Home
- About
- Academy
- Branches
- Departments
- Subjects
- Admission
- Events
- Notices
- Gallery
- Contact

Admin panel থেকেই editable content রাখা যেতে পারে।

---

# 33. Student Dashboard

Student login করলে:

```text
Dashboard
My Profile
My Registrations
My Classes
Attendance
Workshops
Exams & Results
My Batches
Announcements
Documents
Settings
```

## Student Dashboard

Cards:

- Current Branch
- Current Subject
- Current Batch
- Next Class
- Attendance
- Current Status

## My Registrations

সব পুরোনো ও বর্তমান registration।

## My Classes

Physical + Online class।

## Online Class

Upcoming Zoom classes-এর Join button।

---

# 34. Management / Responsible Dashboard

একটি আলাদা application না বানিয়ে একই system-এর role-based dashboard রাখা ভালো।

Login করার পর role অনুযায়ী:

### Branch Director

- Branch Overview
- Students
- Departments
- Subjects
- Batches
- Classes
- Attendance
- Workshops
- Reports

### Department Director

- Department Overview
- Branches
- Subjects
- Batches
- Students
- Classes
- Attendance
- Workshops
- Reports

### Office Secretary

- Applications
- Student Records
- Documents
- Notices
- Administrative Tasks

### Finance Secretary

- Income
- Expense
- Payments
- Financial Reports

---

# 35. Search System

Global Search থাকা অত্যন্ত গুরুত্বপূর্ণ।

Search করা যাবে:

- Name
- Phone
- Student ID
- Registration ID
- Application ID
- Batch
- Subject
- Branch

Search result থেকে সরাসরি Person/Student profile খুলবে।

বিশেষ করে Duplicate Registration শনাক্ত করার জন্য Phone/Email/other identity fields-এর ভিত্তিতে previous record দেখাতে হবে।

---

# 36. Notifications

Notification system:

- New Application
- Viva Scheduled
- Viva Result
- Workshop Assigned
- Workshop Reminder
- Class Reminder
- Online Class Reminder
- Exam
- Result
- Announcement

প্রথম Version-এ in-app notification রাখা যেতে পারে; পরে SMS/Email integration।

---

# 37. Audit Log

Management System হওয়ায় গুরুত্বপূর্ণ পরিবর্তনের Audit Log রাখা উচিত।

যেমন:

> Admin X changed Student A status from Workshop → Regular.

অথবা:

> User Y added Student to Music Batch 1.

Track:

- Who
- What
- When
- Before
- After

---

# 38. Important Data Model

Developer/Architect-এর জন্য Conceptual entities:

```text
Academy
Branch
Department
Subject
BranchSubject / SubjectOffering
Batch
Person
Student
Registration / Application
Viva
Selection
Workshop
WorkshopEnrollment
WorkshopEvaluation
Exam
Result
Enrollment
BatchMembership
Class
ClassSession
Attendance
User
Role
Permission
Announcement
Document
Payment
Expense
Notification
AuditLog
```

---

# 39. Recommended Relationship Model

```text
Academy
  │
  ├── Branch
  │
  ├── Department
  │
  ├── Subject
  │
  └── Users
```

```text
Department ↔ Branch
```

```text
Branch + Department + Subject
          ↓
   Subject Offering
          ↓
        Batch
          ↓
   Batch Membership
          ↓
       Student
```

Admission:

```text
Person
 ↓
Registration
 ↓
Viva
 ↓
Selection
 ↓
Workshop Enrollment
 ↓
Workshop Evaluation
 ↓
Exam
 ↓
Regular Enrollment
 ↓
Batch Membership
```

---

# 40. Duplicate Prevention

একজন ব্যক্তি নতুন করে Application করলে System আগে Search করবে:

**Existing Person Found?**

সম্ভাব্য matching fields:

- Phone
- Email
- Name + DOB
- অন্যান্য unique identifier

তারপর Admin-কে দেখাবে:

> Existing applicant/student found. Review previous history before creating new profile.

এতে একই ব্যক্তির একাধিক duplicate profile তৈরি হবে না।

তবে একই ব্যক্তির **multiple registrations** অবশ্যই allowed থাকবে।

---

# 41. Student Status

Student-এর lifecycle status আলাদা থাকবে:

- Applicant
- Viva Pending
- Selected
- Workshop Student
- Exam Pending
- Regular Student
- Inactive
- Suspended
- Left/Archived

Status change history সংরক্ষিত থাকবে।

---

# 42. Batch Membership Status

Student এবং Batch-এর সম্পর্কের আলাদা status থাকবে:

- Active
- Inactive
- Transferred
- Left
- Completed

কারণ Student Academy-তে active থাকলেও কোনো নির্দিষ্ট Batch থেকে বের হয়ে যেতে পারে।

---

# 43. গুরুত্বপূর্ণ UI Principle

প্রতিটি List Page-এ:

- Search
- Filter
- Sort
- Pagination
- Bulk Actions
- Export যেখানে দরকার

থাকা উচিত।

প্রতিটি Details Page-এ:

- Overview
- Related Records
- History
- Actions

রাখা উচিত।

---

# 44. Recommended Navigation Logic

Admin যেন একই তথ্য বিভিন্ন জায়গা থেকে খুঁজে পেতে পারে।

উদাহরণ:

**Student → Batch**

এবং

**Batch → Students**

দুই দিক থেকেই navigation সম্ভব হতে হবে।

একইভাবে:

**Branch → Departments**

এবং

**Department → Branches**

দুই দিক থেকেই দেখা যাবে।

**Subject → Assigned Branches**

এবং

**Branch → Active Subjects**

দুই দিক থেকেই দেখা যাবে।

---

# 45. সবচেয়ে গুরুত্বপূর্ণ User Journey

## New Applicant

```text
Public Website
→ Apply
→ Existing Person Check
→ Application
→ Viva
→ Selection
→ Workshop
→ Evaluation
→ Exam
→ Pass
→ Regular Student
→ Select Branch/Department/Subject/Existing Batch
→ Batch Membership
```

## Existing Student Re-registration

```text
New Registration
→ Existing Person Found
→ Previous History
→ New Subject/Branch/Registration
→ Viva
→ Workshop
→ Exam
→ New Enrollment
```

---

# 46. Example: বাস্তব Scenario

ধরা যাক:

2025 সালে Rahim:

- Online Branch
- Music
- Workshop
- Passed
- Music Batch 1

2026 সালে Karim:

- Online Branch
- Music
- Workshop
- Passed
- Music Batch 1

এখানে Karim-এর Joining Year 2026 হলেও তাকে নতুন Batch 2 বানাতে হবে না।

তারপর 2027 সালে Rahim:

- Physical Branch
- Acting
- Registration

করলে একই Person Profile-এর মধ্যে নতুন Registration তৈরি হবে।

পুরোনো Music Batch 1 membership থাকবে।

---

# 47. MVP বনাম Future Features

## MVP

প্রথম Version-এ:

- Authentication
- Roles & Permissions
- Branch
- Department
- Subject Master
- Branch-Subject Assignment
- Batch
- Student
- Registration
- Viva
- Workshop
- Exam
- Student History
- Class
- Attendance
- Online/Zoom Class
- Student Dashboard
- Management Dashboard
- Basic Reports
- Announcements

## Phase 2

- Finance
- Documents
- Advanced Reports
- Notifications
- Certificates
- Teacher Management
- Advanced Website CMS

## Phase 3

- SMS/Email automation
- Advanced analytics
- Mobile App
- Payment gateway
- Automated Zoom integration
- Certificate verification
- Advanced communication system

---

# 48. Final Architecture Principle

এই সিস্টেমের সবচেয়ে গুরুত্বপূর্ণ বিষয় হলো **কোনো কিছু duplicate করে তৈরি না করা** এবং **History নষ্ট না করা**।

বিশেষ করে:

1. Subject একবার তৈরি হবে।
2. Subject বিভিন্ন Branch-এ Assign করা যাবে।
3. Department বিভিন্ন Branch-এ চালু থাকতে পারবে।
4. Branch-এ বিভিন্ন Department থাকতে পারবে।
5. Batch একটি স্থায়ী/চলমান Group হতে পারে।
6. প্রতি বছর নতুন Student পুরোনো Batch-এ যুক্ত হতে পারবে।
7. Person Profile একবার তৈরি হবে।
8. একজন Person-এর একাধিক Registration থাকতে পারবে।
9. প্রতিটি Registration-এর আলাদা Admission Journey থাকবে।
10. Workshop cohort এবং Regular Batch আলাদা concept হবে।
11. Online একটি পূর্ণাঙ্গ Branch হিসেবে কাজ করবে।
12. Physical এবং Online class একই Class Management architecture ব্যবহার করবে।
13. Role-based permissions দিয়ে Central, Branch, Department এবং Student access আলাদা হবে।
14. কোনো পুরোনো Student/Registration/Batch/Subject সরাসরি delete না করে Archive/Deactivate করা উচিত।
15. প্রতিটি গুরুত্বপূর্ণ পরিবর্তনের History/Audit রাখা উচিত।

---

# 49. Developer-এর কাছ থেকে পরবর্তী ধাপে যা চাইতে হবে

এই document দেওয়ার পর Developer/Software Architect-এর কাছে নিম্নলিখিত Deliverables চাওয়া উচিত:

1. Complete System Architecture
2. Database ER Diagram
3. Entity Relationship Design
4. User Role & Permission Matrix
5. Admin Panel Sitemap
6. Management Panel Sitemap
7. Student Panel Sitemap
8. Complete User Flow Diagram
9. Admission Lifecycle Flow
10. Branch/Department/Subject/Batch Relationship Diagram
11. API Architecture
12. Authentication Architecture
13. File/Document Storage Strategy
14. Notification Architecture
15. Audit Log Strategy
16. Deployment Architecture
17. Backup & Recovery Strategy
18. Security Plan
19. MVP/Phase-wise Development Plan
20. Recommended Technology Stack

> **নোট:** এই document Business/Functional Architecture-এর starting point। Database schema, API, technology stack এবং exact UI implementation Developer/Architect technical feasibility, scalability এবং security বিবেচনা করে final করবে।
