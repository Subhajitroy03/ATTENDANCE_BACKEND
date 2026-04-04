# Room CRUD API Docs

Base URL: http://localhost:5000
Prefix: /api/v1
Resource: /api/v1/rooms

Auth: Admin only for all Room endpoints (Bearer token).

## 1) Create Room
Method: POST
Path: /api/v1/rooms

Body:
```json
{
  "roomNumber": "A-101",
  "capacity": 60,
  "block": "A",
  "floor": 1
}
```

Validation:
- roomNumber: required, non-empty string
- capacity: optional, positive integer
- block: optional, non-empty string
- floor: optional, integer

Success:
- 201 Created
- message: "Room created successfully"

## 2) List Rooms
Method: GET
Path: /api/v1/rooms

Query params (optional):
- q (search by roomNumber/block)
- block
- floor
- page (default 1)
- limit (default 10, max 100)
- order (asc|desc, default desc)

Example:
- /api/v1/rooms?q=A&block=A&floor=1&page=1&limit=10&order=asc

Success:
- 200 OK
- message: "Rooms fetched successfully"
- data: array of rooms

## 3) Get Room By ID
Method: GET
Path: /api/v1/rooms/:id

Success:
- 200 OK
- message: "Room fetched successfully"

## 4) Update Room
Method: PATCH
Path: /api/v1/rooms/:id

Body (at least one field required):
```json
{
  "roomNumber": "A-102",
  "capacity": 70,
  "block": "A",
  "floor": 2
}
```

Success:
- 200 OK
- message: "Room updated successfully"

## 5) Delete Room
Method: DELETE
Path: /api/v1/rooms/:id

Success:
- 200 OK
- message: "Room deleted successfully"

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
    "path": "/api/v1/rooms",
    "method": "POST",
    "timestamp": "ISO_DATE",
    "requestId": "optional"
  }
}
```

Common errors:
- 400 validation/input issues
- 401 unauthorized
- 404 room not found
- 409 unique constraint conflict (duplicate roomNumber)
