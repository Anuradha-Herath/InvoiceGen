# API Reference Guide

Complete endpoint documentation with request/response examples.

---

## Base URL

```
https://{api-gateway-id}.execute-api.{region}.amazonaws.com/{stage}/api
```

## Authentication

All endpoints (except `/auth/*`) require:
```
Authorization: Bearer {idToken}
Content-Type: application/json
```

---

## Invoices

### POST /invoices
Create a new invoice.

**Request:**
```json
{
  "invoiceNumber": "INV-001",
  "client": {
    "name": "John Doe",
    "email": "john@example.com",
    "phone": "555-0100",
    "company": "Acme Corp",
    "address": "123 Main St"
  },
  "items": [
    {
      "description": "Web Development",
      "quantity": 40,
      "unitPrice": 100,
      "amount": 4000
    }
  ],
  "subtotal": 4000,
  "tax": 400,
  "taxRate": 10,
  "discount": 0,
  "total": 4400,
  "currency": "USD",
  "issueDate": "2024-12-16",
  "dueDate": "2025-01-16",
  "notes": "Thank you for your business"
}
```

**Response (201):**
```json
{
  "id": "uuid-here",
  "userId": "user-id",
  "invoiceNumber": "INV-001",
  "status": "draft",
  "pdfUrl": null,
  "createdAt": "2024-12-16T10:00:00Z",
  "updatedAt": "2024-12-16T10:00:00Z",
  ... (rest of invoice)
}
```

**Error (400):**
```json
{
  "error": "Item 1: lineAmount should be 4000 (quantity × unitPrice), but got 4100"
}
```

---

### GET /invoices
List all invoices with pagination.

**Query Parameters:**
- `limit` (optional, 1-100, default 50)
- `lastKey` (optional, base64 encoded cursor)

**Request:**
```
GET /invoices?limit=10
```

**Response (200):**
```json
{
  "items": [
    { "id": "inv-1", "invoiceNumber": "INV-001", ... },
    { "id": "inv-2", "invoiceNumber": "INV-002", ... }
  ],
  "count": 2,
  "lastKey": "eyJ1c2VySWQiOiJ1c2VyMTIzIn0="
}
```

**Note:** `lastKey` only present if more items exist.

---

### GET /invoices/{id}
Get invoice details.

**Request:**
```
GET /invoices/inv-123
```

**Response (200):**
```json
{
  "id": "inv-123",
  "invoiceNumber": "INV-001",
  ... (full invoice)
}
```

**Response (404):**
```json
{
  "error": "Invoice not found"
}
```

---

### PUT /invoices/{id}
Update invoice.

**Request:**
```json
{
  "invoiceNumber": "INV-001-REV",
  "status": "draft",
  "total": 4500
}
```

**Response (200):**
```json
{
  "id": "inv-123",
  ... (updated invoice)
}
```

---

### DELETE /invoices/{id}
Delete invoice and associated PDF.

**Response (200):**
```json
{
  "message": "Invoice deleted successfully"
}
```

---

### PATCH /invoices/{id}/status
Update invoice status.

**Request:**
```json
{
  "status": "sent"
}
```

Valid statuses: `draft`, `generated`, `sent`, `paid`

**Response (200):**
```json
{
  "id": "inv-123",
  "status": "sent",
  "updatedAt": "2024-12-16T11:00:00Z"
}
```

---

### POST /invoices/{id}/pdf
Generate PDF for invoice.

**Response (200):**
```json
{
  "invoice": {
    "id": "inv-123",
    "status": "generated",
    "pdfUrl": "https://bucket.s3.amazonaws.com/pdfs/user-id/inv-123.pdf"
  },
  "pdfUrl": "https://bucket.s3.amazonaws.com/pdfs/user-id/inv-123.pdf"
}
```

---

### POST /invoices/{id}/email
Send invoice via email.

**Request:**
```json
{
  "recipientEmail": "john@example.com",
  "message": "Custom message (optional)"
}
```

**Response (200):**
```json
{
  "message": "Invoice sent successfully",
  "recipient": "john@example.com"
}
```

Note: Automatically updates invoice status to 'sent'.

---

## Clients

### POST /clients
Create client.

**Request:**
```json
{
  "name": "Acme Corporation",
  "email": "contact@acme.com",
  "phone": "555-0100",
  "company": "Acme",
  "address": "123 Business St"
}
```

**Response (201):**
```json
{
  "id": "client-uuid",
  "userId": "user-id",
  "name": "Acme Corporation",
  "invoices": 0,
  "createdAt": "2024-12-16T10:00:00Z",
  "updatedAt": "2024-12-16T10:00:00Z"
}
```

---

### GET /clients
List all clients with pagination.

**Query Parameters:**
- `limit` (optional, 1-100, default 50)
- `lastKey` (optional, base64 encoded cursor)

**Response (200):**
```json
{
  "items": [
    { "id": "client-1", "name": "Client A", ... },
    { "id": "client-2", "name": "Client B", ... }
  ],
  "count": 2,
  "lastKey": "eyJ1c2VySWQiOiJ1c2VyMTIzIn0="
}
```

---

### GET /clients/{clientId}
Get client details.

**Response (200):**
```json
{
  "id": "client-123",
  "name": "Acme Corporation",
  "email": "contact@acme.com",
  "invoices": 5,
  ...
}
```

---

### PUT /clients/{clientId}
Update client.

**Request:**
```json
{
  "name": "Acme Corporation Ltd"
}
```

**Response (200):**
```json
{
  "id": "client-123",
  ... (updated client)
}
```

---

### DELETE /clients/{clientId}
Delete client.

**Response (200):**
```json
{
  "message": "Client deleted successfully"
}
```

---

## Settings - Profile

### GET /settings/profile
Get user profile.

**Response (200):**
```json
{
  "userId": "user-123",
  "name": "Jane Doe",
  "email": "jane@example.com",
  "createdAt": "2024-01-01T00:00:00Z",
  "updatedAt": "2024-12-16T10:00:00Z"
}
```

---

### PUT /settings/profile
Update user profile.

**Request:**
```json
{
  "name": "Jane Smith",
  "email": "jane.smith@example.com"
}
```

**Response (200):**
```json
{
  "userId": "user-123",
  "name": "Jane Smith",
  "email": "jane.smith@example.com",
  "updatedAt": "2024-12-16T11:00:00Z"
}
```

---

### POST /settings/change-password
Change password.

**Request:**
```json
{
  "currentPassword": "OldPass123!",
  "newPassword": "NewPass123!"
}
```

Password requirements:
- Minimum 8 characters
- At least one uppercase letter
- At least one lowercase letter
- At least one number
- At least one special character

**Response (200):**
```json
{
  "message": "Password changed successfully"
}
```

---

## Settings - Company

### GET /settings/company
Get company settings.

**Response (200):**
```json
{
  "userId": "user-123",
  "name": "My Company Inc",
  "address": "456 Corporate Blvd",
  "phone": "555-0200",
  "email": "billing@company.com",
  "website": "https://company.com",
  "taxId": "12-3456789",
  "logoUrl": "https://bucket.s3.amazonaws.com/logos/user-123/uuid-logo.png",
  "createdAt": "2024-01-01T00:00:00Z",
  "updatedAt": "2024-12-16T10:00:00Z"
}
```

Default values if not set:
```json
{
  "userId": "user-123",
  "name": undefined,
  "address": undefined,
  ...
  "createdAt": "...",
  "updatedAt": "..."
}
```

---

### PUT /settings/company
Update company settings.

**Request:**
```json
{
  "name": "My Company Inc",
  "address": "456 Corporate Blvd",
  "phone": "555-0200",
  "email": "billing@company.com",
  "website": "https://company.com",
  "taxId": "12-3456789"
}
```

**Response (200):**
```json
{
  "userId": "user-123",
  ... (updated settings)
  "updatedAt": "2024-12-16T11:00:00Z"
}
```

---

## Settings - Logo

### POST /settings/upload-logo
Upload company logo.

**Request:**
```json
{
  "imageData": "base64-encoded-image-data",
  "fileName": "logo.png",
  "mimeType": "image/png"
}
```

Supported MIME types:
- `image/png`
- `image/jpeg`
- `image/gif`
- `image/svg+xml`

**Response (200):**
```json
{
  "logoUrl": "https://bucket.s3.amazonaws.com/logos/user-123/uuid-logo.png",
  "message": "Logo uploaded successfully"
}
```

---

## Settings - Email Template

### GET /settings/email-template
Get email template.

**Response (200):**
```json
{
  "userId": "user-123",
  "subject": "Invoice from {{company_name}}",
  "message": "Hello {{client_name}},\n\nPlease find attached invoice #{{invoice_number}}...",
  "variables": [
    "{{company_name}}",
    "{{client_name}}",
    "{{invoice_number}}",
    "{{invoice_amount}}",
    "{{due_date}}"
  ],
  "createdAt": "2024-01-01T00:00:00Z",
  "updatedAt": "2024-12-16T10:00:00Z"
}
```

Default template if not set:
```json
{
  "subject": "Invoice from {{company_name}}",
  "message": "Hello {{client_name}},\n\nPlease find attached your invoice #{{invoice_number}} for {{invoice_amount}}.\n\nDue date: {{due_date}}\n\nThank you!",
  "variables": ["{{company_name}}", "{{client_name}}", "{{invoice_number}}", "{{invoice_amount}}", "{{due_date}}"]
}
```

---

### PUT /settings/email-template
Update email template.

**Request:**
```json
{
  "subject": "Invoice from {{company_name}}",
  "message": "Hello {{client_name}},\n\nYour invoice #{{invoice_number}} is ready...",
  "variables": "auto-extracted"
}
```

Variables are automatically extracted from subject and message.

Available variables:
- `{{company_name}}` - From company settings
- `{{client_name}}` - From invoice client
- `{{invoice_number}}` - Invoice ID
- `{{invoice_amount}}` - Total with currency
- `{{due_date}}` - Invoice due date

**Response (200):**
```json
{
  "userId": "user-123",
  ... (updated template)
  "updatedAt": "2024-12-16T11:00:00Z"
}
```

---

## Authentication

### POST /auth/signup
Create new account.

**Request:**
```json
{
  "email": "user@example.com",
  "password": "SecurePass123!",
  "name": "John Doe"
}
```

**Response (201):**
```json
{
  "message": "User created successfully",
  "userId": "user-uuid",
  "userConfirmed": false
}
```

---

### POST /auth/login
Login user.

**Request:**
```json
{
  "email": "user@example.com",
  "password": "SecurePass123!"
}
```

**Response (200):**
```json
{
  "accessToken": "jwt-token",
  "idToken": "jwt-token",
  "refreshToken": "jwt-token",
  "expiresIn": 3600
}
```

---

## Error Responses

All errors follow standard format:

```json
{
  "statusCode": 400,
  "error": "Error message"
}
```

Common status codes:
- `400` - Bad request / Validation error
- `401` - Unauthorized / Missing token
- `403` - Forbidden / Access denied
- `404` - Not found
- `500` - Server error

---

## Pagination Examples

### First Page
```
GET /invoices?limit=10
```

Response includes `lastKey` (if more data exists):
```json
{
  "items": [...10 items...],
  "count": 10,
  "lastKey": "encoded-cursor"
}
```

### Next Page
```
GET /invoices?limit=10&lastKey=encoded-cursor
```

### Previous Page
Store `lastKey` from page N-1:
```
GET /invoices?limit=10&lastKey=previous-cursor
```

### Last Page
When response has NO `lastKey`:
```json
{
  "items": [...remaining items...],
  "count": 5
}
```

---

## Validation Examples

### Invoice Creation - Valid
```json
{
  "items": [
    {
      "description": "Item 1",
      "quantity": 2,
      "unitPrice": 100,
      "amount": 200  // 2 × 100 = 200 ✓
    }
  ],
  "subtotal": 200,  // Sum of amounts ✓
  "tax": 20,        // 200 × (10/100) = 20 ✓
  "taxRate": 10,
  "total": 220,     // 200 + 20 = 220 ✓
  ...
}
```

### Invoice Creation - Invalid
```json
{
  "items": [
    {
      "quantity": 2,
      "unitPrice": 100,
      "amount": 250  // Should be 200! ✗
    }
  ],
  ...
}
```

Response:
```json
{
  "statusCode": 400,
  "error": "Item 1: lineAmount should be 200.00 (quantity × unitPrice), but got 250.00"
}
```

---

## Rate Limiting

No explicit rate limits, but AWS SES has:
- 14 emails per second (default sandbox)
- 50,000 emails per 24 hours (production mode)

Lambda has:
- 1000 concurrent requests (default)
- Configurable via AWS console

---

## Best Practices

1. **Always include Authorization header**
2. **Use base64 lastKey as-is** (don't decode)
3. **Check for lastKey presence** (not count value)
4. **Validate calculations** before sending
5. **Handle 401 errors** by refreshing token
6. **Retry 5xx errors** with exponential backoff
7. **Cache company settings** locally
8. **Batch client operations** when possible

---

**Last Updated:** December 16, 2025  
**Version:** 1.0  
**Status:** Production Ready
