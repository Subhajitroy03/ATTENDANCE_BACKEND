# Subject-Teacher CRUD API Docs

Base URL: http://localhost:5000
Prefix: /api/v1
Resource: /api/v1/subject-teachers

Auth: Admin only for all Subject-Teacher endpoints (Bearer token).

## 1) Create Mapping
Method: POST
Path: /api/v1/subject-teachers

Body:
```json
{
  "subjectId": "uuid",
  "teacherId": "uuid",
  "isActive": true
}
```

Validation:
- subjectId: required, uuid
- teacherId: required, uuid
- isActive: optional, boolean

Success:
- 201 Created
- message: "Subject teacher mapping created successfully"

## 2) List Mappings
Method: GET
Path: /api/v1/subject-teachers

Query params (optional):
- subjectId (uuid)
- teacherId (uuid)
- isActive (boolean)
- page (default 1)
- limit (default 10, max 100)
- order (asc|desc, default desc)

Success:
- 200 OK
- message: "Subject teacher mappings fetched successfully"
- data: array (mapping + subject + teacher)

## 3) Get Mapping By ID
Method: GET
Path: /api/v1/subject-teachers/:id

Success:
- 200 OK
- message: "Subject teacher mapping fetched successfully"

## 4) Update Mapping
Method: PATCH
Path: /api/v1/subject-teachers/:id

Body (at least one field required):
```json
{
  "isActive": false
}
```

Validation:
- isActive: optional, boolean
- empty object is invalid ("At least one field is required")

Success:
- 200 OK
- message: "Subject teacher mapping updated successfully"

## 5) Delete Mapping
Method: DELETE
Path: /api/v1/subject-teachers/:id

Success:
- 200 OK
- message: "Subject teacher mapping deleted successfully"

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
    "path": "/api/v1/subject-teachers",
    "method": "POST",
    "timestamp": "ISO_DATE",
    "requestId": "optional"
  }
}
```

Common errors:
- 400 validation/input issues
- 401 unauthorized
- 404 mapping not found
- 409 unique constraint conflict (duplicate subjectId + teacherId)
