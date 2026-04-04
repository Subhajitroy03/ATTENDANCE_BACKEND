# Section-Rooms CRUD API Docs

Base URL: http://localhost:5000
Prefix: /api/v1
Resource: /api/v1/section-rooms

Auth: Admin only for all Section-Rooms endpoints (Bearer token).

## 1) Create Mapping
Method: POST
Path: /api/v1/section-rooms

Body:
```json
{
  "sectionId": "uuid",
  "roomId": "uuid"
}
```

Validation:
- sectionId: required, uuid
- roomId: required, uuid

Success:
- 201 Created
- message: "Section room mapping created successfully"

## 2) List Mappings
Method: GET
Path: /api/v1/section-rooms

Query params (optional):
- sectionId (uuid)
- roomId (uuid)
- page (default 1)
- limit (default 10, max 100)

Success:
- 200 OK
- message: "Section room mappings fetched successfully"
- data: array (mapping + section + room)

## 3) Get Mapping By ID
Method: GET
Path: /api/v1/section-rooms/:id

Success:
- 200 OK
- message: "Section room mapping fetched successfully"

## 4) Update Mapping
Method: PATCH
Path: /api/v1/section-rooms/:id

Body (at least one field required):
```json
{
  "sectionId": "uuid",
  "roomId": "uuid"
}
```

Validation:
- sectionId: optional, uuid
- roomId: optional, uuid
- empty object is invalid ("At least one field is required")

Success:
- 200 OK
- message: "Section room mapping updated successfully"

## 5) Delete Mapping
Method: DELETE
Path: /api/v1/section-rooms/:id

Success:
- 200 OK
- message: "Section room mapping deleted successfully"

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
    "path": "/api/v1/section-rooms",
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
- 409 unique constraint conflict (duplicate sectionId + roomId)
