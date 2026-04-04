# Class Sessions CRUD API Docs

Base URL: http://localhost:5000
Prefix: /api/v1
Resource: /api/v1/class-sessions

Auth: Admin only for all Class Session endpoints (Bearer token).

## 1) Create Class Session
Method: POST
Path: /api/v1/class-sessions

Body:
```json
{
  "timetableSlotId": "uuid",
  "date": "2026-04-04",
  "status": "SCHEDULED",
  "teacherConfirmed": false,
  "startTime": "09:00:00",
  "endTime": "10:00:00"
}
```

Validation:
- timetableSlotId: required, uuid
- date: required, non-empty string
- status: optional, one of SCHEDULED | STARTED | COMPLETED | CANCELLED
- teacherConfirmed: optional, boolean
- startTime: optional, non-empty string
- endTime: optional, non-empty string

Success:
- 201 Created
- message: "Class session created successfully"

## 2) List Class Sessions
Method: GET
Path: /api/v1/class-sessions

Query params (optional):
- timetableSlotId (uuid)
- status (SCHEDULED|STARTED|COMPLETED|CANCELLED)
- teacherConfirmed (boolean)
- date (string)
- page (default 1)
- limit (default 10, max 100)
- order (asc|desc, default desc)

Success:
- 200 OK
- message: "Class sessions fetched successfully"
- data: array (session + timetableSlot + section + subject + teacher + room)

## 3) Get Class Session By ID
Method: GET
Path: /api/v1/class-sessions/:id

Success:
- 200 OK
- message: "Class session fetched successfully"

## 4) Update Class Session
Method: PATCH
Path: /api/v1/class-sessions/:id

Body (at least one field required):
```json
{
  "status": "STARTED",
  "teacherConfirmed": true,
  "startTime": "09:05:00",
  "endTime": "10:05:00"
}
```

Validation:
- status: optional, enum
- teacherConfirmed: optional, boolean
- startTime: optional, non-empty string
- endTime: optional, non-empty string
- empty object is invalid ("At least one field is required")

Success:
- 200 OK
- message: "Class session updated successfully"

## 5) Delete Class Session
Method: DELETE
Path: /api/v1/class-sessions/:id

Success:
- 200 OK
- message: "Class session deleted successfully"

## Response Shapes
Success:
```json
{
  "success": true,
  "message": "...",
  "data": {}
}
```

Error:
```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Validation failed",
    "details": []
  },
  "meta": {
    "path": "/api/v1/class-sessions",
    "method": "POST",
    "timestamp": "ISO_DATE",
    "requestId": "optional"
  }
}
```

Common errors:
- 400 validation/input issues
- 401 unauthorized
- 404 class session not found
- 400 foreign key violation (invalid timetableSlotId)
