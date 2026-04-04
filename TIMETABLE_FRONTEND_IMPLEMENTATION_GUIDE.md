# Timetable Frontend Implementation Guide (Systematic API Plan)

Last updated: 2026-04-04
Audience: Frontend developers implementing timetable creation and management
Base URL: take from env
API Prefix: /api/v1

## 1) Goal
Build a full timetable module where an admin can:
1. Select a class/section
2. Fill weekly slots (Mon-Sat, period-wise)
3. Validate conflicts before save
4. Save timetable slots in backend
5. Edit/update/delete slots
6. Optionally generate real class sessions for dates

## 2) Core Concepts
- Timetable Slot = recurring weekly rule (day + start/end + section + subject + teacher + room)
- Class Session = actual dated class instance derived from a timetable slot

Use:
- /timetable for weekly structure
- /class-sessions for date-wise execution

## 3) Required APIs for Timetable Screen
All APIs below are admin-protected (Bearer token).

### A) Master Data APIs (for dropdowns)
1. GET /api/v1/sections
- Purpose: list classes/sections
- Key query: departmentId, semester, page, limit, order

2. GET /api/v1/subjects
- Purpose: list subjects for section/semester
- Key query: departmentId, semester, page, limit, order

3. GET /api/v1/teachers
- Purpose: list teachers
- Key query: departmentId, verified, status, page, limit, order

4. GET /api/v1/rooms
- Purpose: list rooms
- Key query: block, floor, page, limit, order

5. GET /api/v1/subject-teachers
- Purpose: optional filter to show only valid teacher-subject pairs
- Key query: subjectId, teacherId, isActive

6. GET /api/v1/section-rooms
- Purpose: optional filter to show rooms mapped to selected section
- Key query: sectionId, roomId

### B) Timetable CRUD APIs (main feature)
1. POST /api/v1/timetable
- Create one weekly slot

2. GET /api/v1/timetable
- Fetch slots (by section/day/teacher/subject/room)

3. GET /api/v1/timetable/:id
- Fetch one slot

4. PATCH /api/v1/timetable/:id
- Update one slot

5. DELETE /api/v1/timetable/:id
- Delete one slot

### C) Session Generation APIs (optional but important)
1. POST /api/v1/class-sessions
- Create dated class session from timetable slot

2. GET /api/v1/class-sessions
- Verify generated sessions

## 4) Timetable Payload Contract

### Create Slot (POST /api/v1/timetable)
```json
{
  "sectionId": "uuid",
  "dayOfWeek": "MONDAY",
  "startTime": "09:00:00",
  "endTime": "10:00:00",
  "subjectId": "uuid",
  "teacherId": "uuid",
  "roomId": "uuid"
}
```

Validation rules from backend:
- sectionId: required uuid
- dayOfWeek: required enum MONDAY|TUESDAY|WEDNESDAY|THURSDAY|FRIDAY|SATURDAY
- startTime: required non-empty string
- endTime: required non-empty string
- subjectId: required uuid
- teacherId: required uuid
- roomId: optional uuid

### Update Slot (PATCH /api/v1/timetable/:id)
Any subset of fields above is allowed, but at least one field must be present.

## 5) Recommended Frontend Architecture

### Screen 1: Timetable Planner
UI blocks:
1. Filters row: Department -> Section -> Semester
2. Week grid: Days as columns, periods as rows
3. Slot editor drawer/modal
4. Conflict panel
5. Save/Publish actions

### State shape (suggested)
- selectedSectionId
- days: [MONDAY...SATURDAY]
- periods: [{ startTime, endTime }]
- slotsByDayTime: map key `${day}_${startTime}_${endTime}` -> slotData
- masterData: { sections, subjects, teachers, rooms, subjectTeachers, sectionRooms }
- conflicts: []

## 6) Exact API Flow for Frontend

### Step 0: Load prerequisites
On screen load:
1. GET /sections
2. GET /subjects
3. GET /teachers
4. GET /rooms
5. (optional) GET /subject-teachers
6. (optional) GET /section-rooms

### Step 1: Select section and fetch existing timetable
When section selected:
- GET /timetable?sectionId=<selectedSectionId>&limit=100&order=asc
- Render returned slots in grid

### Step 2: User adds/edits slots in UI
For each cell, capture:
- dayOfWeek
- startTime, endTime
- subjectId
- teacherId
- roomId

### Step 3: Run frontend conflict checks before save
Because backend currently validates schema/DB references but does not fully enforce schedule overlap logic, enforce these checks client-side:
1. Section conflict: same section + same day + overlapping time
2. Teacher conflict: same teacher + same day + overlapping time
3. Room conflict: same room + same day + overlapping time
4. Time validity: endTime > startTime
5. Subject-teacher validity (if mapping used): teacher is assigned to selected subject
6. Section-room validity (if mapping used): room allowed for section

Time overlap formula:
- Two ranges [aStart, aEnd) and [bStart, bEnd) overlap if:
  - aStart < bEnd AND bStart < aEnd

### Step 4: Persist changes
For each changed slot:
- New slot -> POST /timetable
- Existing slot edited -> PATCH /timetable/:id
- Removed slot -> DELETE /timetable/:id

Tip:
- Keep a local diff (created/updated/deleted arrays) to avoid re-writing everything.

### Step 5: Verify saved data
- Re-fetch GET /timetable?sectionId=...
- Repaint grid from backend response

## 7) Creating a "Perfect" Timetable (Practical Rules)

Use these rules in UI to ensure high quality timetable generation:
1. No teacher overlaps
2. No room overlaps
3. No section overlaps
4. Subject load balancing across week
- Avoid clustering same subject in consecutive periods unless intended
5. Break/lunch constraints
- Reserve fixed break periods globally
6. Room capacity check
- room.capacity >= section.capacity (if both available)
7. Prefer mapped teacher-subject pairs
8. Prefer mapped section-room pairs
9. Respect teacher availability (if you later add availability module)
10. Keep buffer between practical/lab blocks when needed

## 8) Suggested "Auto-Generate" Strategy (Frontend)
If you want automatic timetable generation:
1. Input:
- required periods per subject per week
- allowed teachers per subject
- allowed rooms per section
- daily period templates
2. Algorithm (greedy + backtracking):
- fill hardest constraints first (labs, scarce teachers)
- place remaining subjects by least-conflict slot
- backtrack on dead-ends
3. Output draft -> run conflict validator -> save via /timetable POST calls

## 9) Session Generation (After Timetable Finalized)
Weekly slots are not attendance events yet. Generate class sessions for real dates:

For each timetable slot and date in date-range matching dayOfWeek:
POST /api/v1/class-sessions
```json
{
  "timetableSlotId": "uuid",
  "date": "2026-07-15",
  "status": "SCHEDULED",
  "teacherConfirmed": false
}
```

Then attendance module can work on class_sessions.

## 10) Error Handling Pattern (UI)
Error response shape:
```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Validation failed",
    "details": []
  },
  "meta": {
    "path": "/api/v1/timetable",
    "method": "POST",
    "timestamp": "ISO_DATE",
    "requestId": "optional"
  }
}
```

Common status handling:
- 400: show field-level errors
- 401: redirect/login refresh
- 404: stale/deleted entities -> refresh data
- 409: duplicate/conflict from DB constraints
- 500: generic retry toast

## 11) Minimal Endpoint Checklist for Frontend Dev
Must-have:
- GET /sections
- GET /subjects
- GET /teachers
- GET /rooms
- GET /timetable
- POST /timetable
- PATCH /timetable/:id
- DELETE /timetable/:id

Strongly recommended:
- GET /subject-teachers
- GET /section-rooms
- POST /class-sessions (for real calendar generation)

## 12) Quick Example Workflow (One Class)
1. Admin picks section: "6CSE2"
2. Frontend fetches current slots for that section
3. Admin fills Mon-Sat grid with subject/teacher/room per period
4. Frontend detects no conflicts
5. Frontend sends POST/PATCH/DELETE batch
6. Frontend re-fetches timetable and shows final weekly plan
7. Admin generates next month class sessions using timetable slots

---
This guide is designed to let a frontend developer build a complete, production-usable timetable module with current backend APIs.
