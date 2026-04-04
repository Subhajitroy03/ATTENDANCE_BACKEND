# Smart Attendance Backend - Postman Collection

## Overview
The Postman collection has been comprehensively updated with all current API endpoints from the Smart Attendance Backend. It includes 94 endpoints across 16 resource categories with proper authentication, request/response examples, and validation details.

## Updated Collection Details

### Collection Statistics
- **Total Categories**: 16
- **Total Endpoints**: 94
- **File**: `Smart_Attendance_Backend.postman_collection.json`

### Categories Included

#### 1. **Admins** (9 endpoints)
- Register Admin
- Refresh Admin Token
- Create Admin
- List Admins (with pagination & filters)
- Get Admin By ID
- Update Admin
- Delete Admin
- Verify Teacher
- Verify Student

#### 2. **Students** (8 endpoints)
- Register Student (multipart/photo upload)
- Login Student
- Refresh Student Token
- Create Student (admin)
- List Students (with filters)
- Get Student By ID
- Update Student (with photo)
- Delete Student

#### 3. **Teachers** (8 endpoints)
- Register Teacher (multipart/photo upload)
- Login Teacher
- Refresh Teacher Token
- Create Teacher (admin)
- List Teachers (with filters)
- Get Teacher By ID
- Update Teacher (with photo)
- Delete Teacher

#### 4. **Attendance** (9 endpoints)
- Get My Attendance Summary (Student)
- Get My Taught Classes Attendance (Teacher)
- Get My Class Teacher Classes Attendance (Teacher)
- Update Attendance As Teacher
- Create Attendance (admin)
- List Attendance (with filters)
- Get Attendance By ID
- Update Attendance
- Delete Attendance

#### 5. **Sections** (5 endpoints)
- List Sections (public)
- Get Section By ID (public)
- Create Section
- Update Section
- Delete Section

#### 6. **Departments** (5 endpoints)
- List Departments (public)
- Get Department By ID (public)
- Create Department
- Update Department
- Delete Department

#### 7. **Rooms** (5 endpoints)
- List Rooms
- Get Room By ID
- Create Room
- Update Room
- Delete Room

#### 8. **Class Sessions** (5 endpoints)
- List Class Sessions
- Get Class Session By ID
- Create Class Session
- Update Class Session
- Delete Class Session

#### 9. **Subjects** (5 endpoints)
- List Subjects
- Get Subject By ID
- Create Subject
- Update Subject
- Delete Subject

#### 10. **Subject Teachers** (5 endpoints)
- List Subject Teachers
- Get Subject Teacher By ID
- Create Subject Teacher
- Update Subject Teacher
- Delete Subject Teacher

#### 11. **Section Rooms** (5 endpoints)
- List Section Rooms
- Get Section Room By ID
- Create Section Room
- Update Section Room
- Delete Section Room

#### 12. **Timetable** (5 endpoints)
- List Timetable Slots
- Get Timetable Slot By ID
- Create Timetable Slot
- Update Timetable Slot
- Delete Timetable Slot

#### 13. **Swaps** (5 endpoints)
- List Swaps (Teacher only)
- Get Swap By ID
- Create Swap
- Update Swap
- Delete Swap

#### 14. **Notifications** (5 endpoints)
- List Notifications
- Get Notification By ID
- Create Notification
- Update Notification
- Delete Notification

#### 15. **Teacher Confirmations** (5 endpoints)
- List Teacher Confirmations
- Get Teacher Confirmation By ID
- Create Teacher Confirmation
- Update Teacher Confirmation
- Delete Teacher Confirmation

#### 16. **Audit Logs** (5 endpoints)
- List Audit Logs
- Get Audit Log By ID
- Create Audit Log
- Update Audit Log
- Delete Audit Log

## Setup Instructions

### 1. Import the Collection
1. Open Postman
2. Click "Import" in the top left
3. Select `Smart_Attendance_Backend.postman_collection.json`
4. Click "Import"

### 2. Configure Environment Variables
The collection includes the following variables that need to be configured:

```json
{
  "baseUrl": "http://localhost:3000",           // Your API server URL
  "adminAccessToken": "your_admin_token_here",  // Admin JWT token
  "teacherAccessToken": "your_teacher_token_here", // Teacher JWT token
  "studentAccessToken": "your_student_token_here"  // Student JWT token
}
```

**To set variables:**
1. Click the eye icon (👁️) in the top right
2. Click "Edit" next to "Globals" or create a new environment
3. Add the variables and their values
4. Save

### 3. Authentication
- **Public Endpoints**: No authentication required
  - Student/Teacher/Admin register endpoints
  - Get lists (Sections, Departments)
  
- **Admin-Protected**: Requires `{{adminAccessToken}}`
  - All create/update/delete operations for resources
  - List operations for most resources
  
- **Teacher-Protected**: Requires `{{teacherAccessToken}}`
  - Swap endpoints
  - Teacher-specific attendance endpoints
  
- **Student-Protected**: Requires `{{studentAccessToken}}`
  - My Attendance Summary
  
- **Bearer Token Format**: All protected endpoints use Bearer token authentication

## API Response Format

### Success Response (2xx)
```json
{
  "success": true,
  "message": "Operation description",
  "data": {
    "id": "uuid",
    "field": "value"
  }
}
```

### List Response (2xx)
```json
{
  "success": true,
  "message": "Records fetched successfully",
  "data": {
    "items": [
      { "id": "uuid", "field": "value" }
    ],
    "pagination": {
      "page": 1,
      "limit": 10,
      "total": 45,
      "totalPages": 5
    }
  }
}
```

### Error Response (4xx/5xx)
```json
{
  "success": false,
  "error": {
    "code": "ERROR_CODE",
    "message": "Error description",
    "details": [
      {
        "field": "fieldName",
        "message": "Validation message",
        "code": "error_type"
      }
    ]
  }
}
```

## Common Query Parameters

Most list endpoints support:
- `q` - Search query
- `page` - Page number (default: 1)
- `limit` - Items per page (default: 10)
- `order` - Sort order: `asc` or `desc`
- Resource-specific filters (e.g., `departmentId`, `status`, `verified`)

## Field Validations

### Sections
- `departmentId` (UUID, required)
- `semester` (1-10, required)
- `section` (min 1, required)
- `name` (string, min 1 char)
- `classTeacherId` (UUID, optional)
- `capacity` (positive int, optional)

### Departments
- `name` (string, min 1 char, required)
- `code` (string, min 1 char, required)

### Rooms
- `roomNumber` (string, required)
- `capacity` (positive int, optional)
- `block` (string, optional)
- `floor` (int, optional)

### Timetable
- `sectionId` (UUID, required)
- `dayOfWeek` (MONDAY-SATURDAY, required)
- `startTime` (string, required)
- `endTime` (string, required)
- `subjectId` (UUID, required)
- `teacherId` (UUID, required)
- `roomId` (UUID, optional)

### Class Sessions
- `timetableSlotId` (UUID, required)
- `date` (string, required)
- `status` (SCHEDULED|STARTED|COMPLETED|CANCELLED, optional)
- `startTime` (string, optional)
- `endTime` (string, optional)

### Swaps
- `fromTeacherId` (UUID, required)
- `toTeacherId` (UUID, required)
- `classSessionId` (UUID, required)
- `status` (PENDING|APPROVED|REJECTED, optional)

*(See collection for complete field documentation for all resources)*

## Email Requirements
- All admin and user emails must end with `@aot.edu.in`
- Example: `admin@aot.edu.in`, `teacher@aot.edu.in`, `student@aot.edu.in`

## Image Upload
Students and Teachers endpoints support photo uploads via multipart/form-data:
- Handled via Postman's form-data body mode
- Include `photo` field with binary file
- Integrated with Cloudinary for cloud storage

## Pagination Example
```
GET {{baseUrl}}/api/v1/students?page=2&limit=10&order=desc&status=ACTIVE
```

## Testing Workflow
1. Register an admin (POST `/api/v1/admins/register`)
2. Login with admin credentials (POST `/api/v1/admins/register` with correct creds)
3. Copy the access token from response
4. Set `{{adminAccessToken}}` environment variable
5. Now test admin-protected endpoints

## Notes
- All ID parameters use UUID format
- Timestamps are in ISO 8601 format (UTC)
- Status enums: ACTIVE, INACTIVE, SUSPENDED, GRADUATED
- Attendance status: PRESENT, ABSENT, LATE
- Days of week: MONDAY, TUESDAY, WEDNESDAY, THURSDAY, FRIDAY, SATURDAY

## Troubleshooting

### 401 Unauthorized
- Ensure bearer token is set in environment variables
- Check token hasn't expired
- Verify correct token type for the operation (admin/teacher/student)

### 400 Bad Request
- Check required fields are included
- Verify email ends with `@aot.edu.in`
- Ensure UUID format for ID fields
- Validate enum values match allowed options

### 404 Not Found
- Verify the resource exists
- Check ID is correct
- Ensure baseUrl is correctly configured

## For Development
- Test locally at `http://localhost:3000`
- Configure environment variables for your local setup
- Use the collection to validate API contracts as backend evolves
- Update collection when adding new endpoints

---

**Last Updated**: April 4, 2026
**Collection Version**: 2.0
**Total Endpoints**: 94
