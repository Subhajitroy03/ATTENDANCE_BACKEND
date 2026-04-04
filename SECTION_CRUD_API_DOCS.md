# Section CRUD API Documentation

Last updated: 2026-04-04
Base URL: http://localhost:5000
API Prefix: /api/v1
Resource Base Path: /api/v1/sections

## Overview
This document covers the complete Section CRUD API:
1. Create Section
2. List Sections
3. Get Section by ID
4. Update Section
5. Delete Section

The documentation is based on the current implementation in routes, controllers, validators, services, and global error handler.

## Authentication and Authorization
Authorization behavior for Section endpoints:
- Public endpoints (no auth required):
  - GET /api/v1/sections
  - GET /api/v1/sections/:id
- Admin-only endpoints (auth required):
  - POST /api/v1/sections
  - PATCH /api/v1/sections/:id
  - DELETE /api/v1/sections/:id

Admin auth token is read from one of:
1. Cookie accessToken
2. Cookie uid
3. Header Authorization: Bearer <token>

If token is missing/invalid for protected endpoints, response is 401 Unauthorized.

## Data Model (Sections)
Section fields used in requests/responses:
- id: UUID
- departmentId: UUID (required on create)
- semester: integer (1 to 10)
- section: integer (minimum 1)
- classTeacherId: UUID or null
- name: string (min 1 char), unique
- capacity: positive integer (optional)
- createdAt: timestamp

Database-level constraints that can fail requests:
- unique_department_semester_section (departmentId + semester + section)
- unique_section_name (name)
- unique_sections_class_teacher_id (classTeacherId one-to-one)
- semester_range_check (semester in [1,10])
- departmentId references departments.id
- classTeacherId references teachers.id (nullable, on delete set null)

## Common Response Envelope

### Success Envelope
{
  "success": true,
  "message": "...",
  "data": {}
}

### Error Envelope
{
  "success": false,
  "error": {
    "code": "ERROR_CODE",
    "message": "Error message",
    "details": []
  },
  "meta": {
    "path": "/api/v1/sections",
    "method": "POST",
    "timestamp": "2026-04-04T10:00:00.000Z",
    "requestId": "optional-correlation-id"
  }
}

## 1) Create Section
Endpoint: POST /api/v1/sections
Access: Admin only

### Request Headers
- Content-Type: application/json
- Authorization: Bearer <admin_access_token>

### Request Body Schema
Required:
- departmentId: string (uuid)
- semester: number (int, min 1, max 10)
- section: number (int, min 1)
- name: string (min length 1)

Optional:
- classTeacherId: string (uuid) or null
- capacity: number (int, positive)

### Example Request
{
  "departmentId": "13cf0f8d-f509-4b6e-a6fc-c0bc3cb856ba",
  "semester": 6,
  "section": 2,
  "name": "6CSE2",
  "classTeacherId": "b8aa4d89-f7f2-4db0-aa50-3a588a61ec6c",
  "capacity": 60
}

### Success Response
Status: 201 Created
{
  "success": true,
  "message": "Section created successfully",
  "data": {
    "id": "fc846f53-a426-4f7d-b77c-44bdd07cae2e",
    "departmentId": "13cf0f8d-f509-4b6e-a6fc-c0bc3cb856ba",
    "semester": 6,
    "section": 2,
    "classTeacherId": "b8aa4d89-f7f2-4db0-aa50-3a588a61ec6c",
    "name": "6CSE2",
    "capacity": 60,
    "createdAt": "2026-04-04T10:13:24.332Z"
  }
}

### Possible Errors
- 400 Validation failed (zod schema)
- 400 Foreign key violation (invalid departmentId/classTeacherId)
- 400 Invalid input syntax (malformed uuid/integer)
- 401 Authentication required
- 409 Unique constraint violation (duplicate name, duplicate department+semester+section, duplicate classTeacherId)

## 2) List Sections
Endpoint: GET /api/v1/sections
Access: Public

### Query Parameters
All are optional:
- q: string (searches section name with ILIKE)
- departmentId: uuid
- semester: int (1-10)
- section: int (>=1)
- page: int (>0), default 1
- limit: int (>0), default 10, max 100
- order: asc | desc, default desc

### Example Request
GET /api/v1/sections?q=CSE&semester=6&page=1&limit=10&order=desc

### Success Response
Status: 200 OK
{
  "success": true,
  "message": "Sections fetched successfully",
  "data": [
    {
      "id": "fc846f53-a426-4f7d-b77c-44bdd07cae2e",
      "departmentId": "13cf0f8d-f509-4b6e-a6fc-c0bc3cb856ba",
      "semester": 6,
      "section": 2,
      "classTeacherId": "b8aa4d89-f7f2-4db0-aa50-3a588a61ec6c",
      "name": "6CSE2",
      "capacity": 60,
      "createdAt": "2026-04-04T10:13:24.332Z",
      "department": {
        "id": "13cf0f8d-f509-4b6e-a6fc-c0bc3cb856ba",
        "name": "Computer Science and Engineering",
        "code": "CSE",
        "createdAt": "2026-01-12T09:00:00.000Z"
      },
      "classTeacher": {
        "id": "b8aa4d89-f7f2-4db0-aa50-3a588a61ec6c",
        "employeeId": "EMP-2001",
        "name": "Ananya Das",
        "email": "ananya@aot.edu.in",
        "abbreviation": "AD",
        "phone": "9876543210",
        "photo": null,
        "departmentId": "13cf0f8d-f509-4b6e-a6fc-c0bc3cb856ba",
        "status": "ACTIVE",
        "role": "teacher",
        "verified": true,
        "createdAt": "2026-01-11T09:00:00.000Z",
        "updatedAt": "2026-03-11T09:00:00.000Z"
      }
    }
  ]
}

### Notes
- Response data is an array (not paginated object with total count).
- page/limit/order still affect query result slicing and sorting.
- classTeacher can be null if no teacher is assigned.

### Possible Errors
- 400 Validation failed (bad query values)

## 3) Get Section by ID
Endpoint: GET /api/v1/sections/:id
Access: Public

### Path Parameters
- id: section UUID

### Example Request
GET /api/v1/sections/fc846f53-a426-4f7d-b77c-44bdd07cae2e

### Success Response
Status: 200 OK
{
  "success": true,
  "message": "Section fetched successfully",
  "data": {
    "id": "fc846f53-a426-4f7d-b77c-44bdd07cae2e",
    "departmentId": "13cf0f8d-f509-4b6e-a6fc-c0bc3cb856ba",
    "semester": 6,
    "section": 2,
    "classTeacherId": "b8aa4d89-f7f2-4db0-aa50-3a588a61ec6c",
    "name": "6CSE2",
    "capacity": 60,
    "createdAt": "2026-04-04T10:13:24.332Z",
    "department": {
      "id": "13cf0f8d-f509-4b6e-a6fc-c0bc3cb856ba",
      "name": "Computer Science and Engineering",
      "code": "CSE",
      "createdAt": "2026-01-12T09:00:00.000Z"
    },
    "classTeacher": {
      "id": "b8aa4d89-f7f2-4db0-aa50-3a588a61ec6c",
      "employeeId": "EMP-2001",
      "name": "Ananya Das",
      "email": "ananya@aot.edu.in",
      "abbreviation": "AD",
      "phone": "9876543210",
      "photo": null,
      "departmentId": "13cf0f8d-f509-4b6e-a6fc-c0bc3cb856ba",
      "status": "ACTIVE",
      "role": "teacher",
      "verified": true,
      "createdAt": "2026-01-11T09:00:00.000Z",
      "updatedAt": "2026-03-11T09:00:00.000Z"
    }
  }
}

### Possible Errors
- 400 id is required (empty path segment)
- 400 invalid UUID format
- 404 Section not found

## 4) Update Section
Endpoint: PATCH /api/v1/sections/:id
Access: Admin only

### Request Headers
- Content-Type: application/json
- Authorization: Bearer <admin_access_token>

### Path Parameters
- id: section UUID

### Request Body Schema
All fields optional, but at least one field must be present.

Optional updatable fields:
- departmentId: string (uuid)
- semester: number (int, min 1, max 10)
- section: number (int, min 1)
- classTeacherId: string (uuid) or null
- name: string (min length 1)
- capacity: number (int, positive)

### Example Request
{
  "name": "6CSE2-UPDATED",
  "capacity": 65,
  "classTeacherId": null
}

### Success Response
Status: 200 OK
{
  "success": true,
  "message": "Section updated successfully",
  "data": {
    "id": "fc846f53-a426-4f7d-b77c-44bdd07cae2e",
    "departmentId": "13cf0f8d-f509-4b6e-a6fc-c0bc3cb856ba",
    "semester": 6,
    "section": 2,
    "classTeacherId": null,
    "name": "6CSE2-UPDATED",
    "capacity": 65,
    "createdAt": "2026-04-04T10:13:24.332Z"
  }
}

### Possible Errors
- 400 id is required
- 400 Validation failed
- 400 At least one field is required
- 400 Foreign key violation
- 400 Invalid input syntax
- 401 Authentication required
- 404 Section not found
- 409 Unique constraint violation

## 5) Delete Section
Endpoint: DELETE /api/v1/sections/:id
Access: Admin only

### Request Headers
- Authorization: Bearer <admin_access_token>

### Path Parameters
- id: section UUID

### Example Request
DELETE /api/v1/sections/fc846f53-a426-4f7d-b77c-44bdd07cae2e

### Success Response
Status: 200 OK
{
  "success": true,
  "message": "Section deleted successfully",
  "data": {
    "id": "fc846f53-a426-4f7d-b77c-44bdd07cae2e",
    "departmentId": "13cf0f8d-f509-4b6e-a6fc-c0bc3cb856ba",
    "semester": 6,
    "section": 2,
    "classTeacherId": null,
    "name": "6CSE2-UPDATED",
    "capacity": 65,
    "createdAt": "2026-04-04T10:13:24.332Z"
  }
}

### Possible Errors
- 400 id is required
- 400 invalid UUID format
- 401 Authentication required
- 404 Section not found
- 400/409 when blocked by foreign key usage from other entities (depends on relation constraints)

## cURL Examples

### Create Section
curl --location 'http://localhost:5000/api/v1/sections' \
--header 'Content-Type: application/json' \
--header 'Authorization: Bearer <admin_access_token>' \
--data '{
  "departmentId": "13cf0f8d-f509-4b6e-a6fc-c0bc3cb856ba",
  "semester": 6,
  "section": 2,
  "name": "6CSE2",
  "classTeacherId": "b8aa4d89-f7f2-4db0-aa50-3a588a61ec6c",
  "capacity": 60
}'

### List Sections
curl --location 'http://localhost:5000/api/v1/sections?q=CSE&departmentId=13cf0f8d-f509-4b6e-a6fc-c0bc3cb856ba&semester=6&page=1&limit=10&order=desc'

### Get Section by ID
curl --location 'http://localhost:5000/api/v1/sections/fc846f53-a426-4f7d-b77c-44bdd07cae2e'

### Update Section
curl --location --request PATCH 'http://localhost:5000/api/v1/sections/fc846f53-a426-4f7d-b77c-44bdd07cae2e' \
--header 'Content-Type: application/json' \
--header 'Authorization: Bearer <admin_access_token>' \
--data '{
  "name": "6CSE2-UPDATED",
  "capacity": 65,
  "classTeacherId": null
}'

### Delete Section
curl --location --request DELETE 'http://localhost:5000/api/v1/sections/fc846f53-a426-4f7d-b77c-44bdd07cae2e' \
--header 'Authorization: Bearer <admin_access_token>'

## Error Code Reference (Most Relevant)
- VALIDATION_ERROR: Request validation failed
- API_ERROR: Generic application error
- UNIQUE_CONSTRAINT_VIOLATION: Duplicate unique key
- FOREIGN_KEY_VIOLATION: Invalid referenced record
- NOT_NULL_VIOLATION: Missing required DB field
- INVALID_INPUT_SYNTAX: Invalid UUID/typed value format
- INTERNAL_SERVER_ERROR: Unhandled server error

## Endpoint Matrix
- GET /api/v1/sections: Public
- GET /api/v1/sections/:id: Public
- POST /api/v1/sections: Admin
- PATCH /api/v1/sections/:id: Admin
- DELETE /api/v1/sections/:id: Admin
