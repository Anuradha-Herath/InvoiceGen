# Backend Implementation Summary & Frontend Integration Guide

## 1. Data Persistence - FULLY IMPLEMENTED ✅

All three features now have complete backend CRUD operations and persistent storage:

### A. Client Management (Persistent)
**Endpoints:**
- `POST /clients` - Create client (required: name, email; optional: phone, company, address)
- `GET /clients` - List all clients with pagination
- `GET /clients/{clientId}` - Get single client details
- `PUT /clients/{clientId}` - Update client information
- `DELETE /clients/{clientId}` - Delete client

**Database:** DynamoDB `{service}-clients-{stage}` table
- Composite key: userId (HASH) + id (RANGE)
- Indexes: UserCreatedIndex for efficient sorting

**Frontend Integration - ClientListPage.tsx:**
```typescript
// Service endpoint pattern
async function fetchClients(limit = 50, lastKey?: string) {
  const params = new URLSearchParams();
  params.append('limit', limit.toString());
  if (lastKey) params.append('lastKey', lastKey);
  
  const response = await fetch(`/api/clients?${params}`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  return response.json(); // { items: Client[], count: number, lastKey?: string }
}
```

### B. Company Settings (Persistent)
**Endpoints:**
- `GET /settings/company` - Retrieve company settings (returns default if not set)
- `PUT /settings/company` - Update/create company settings

**Settings Stored:**
- Company name, address, phone, email, website, taxId, logoUrl

**Database:** DynamoDB `{service}-company-settings-{stage}` table
- Key: userId (HASH)
- Stores per-user company information

**Frontend Integration - SettingsPage.tsx Company Tab:**
```typescript
async function updateCompanySettings(settings: CompanySettings) {
  const response = await fetch('/api/settings/company', {
    method: 'PUT',
    headers: { 
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(settings)
  });
  return response.json();
}
```

### C. Logo Upload (Persistent)
**Endpoint:**
- `POST /settings/upload-logo` - Upload logo image to S3 and link to company settings

**Implementation Details:**
- Accepts base64-encoded image data
- Supported types: image/png, image/jpeg, image/gif, image/svg+xml
- Stored in S3 with path: `logos/{userId}/{uuid}-{fileName}`
- Returns signed URL for public access
- Automatically updates company settings with logoUrl

**Database:** S3 bucket with company logos; reference stored in company_settings table

**Frontend Integration - SettingsPage.tsx Logo Upload:**
```typescript
async function uploadLogo(file: File) {
  const reader = new FileReader();
  reader.onload = async (e) => {
    const base64 = e.target?.result as string;
    const response = await fetch('/api/settings/upload-logo', {
      method: 'POST',
      headers: { 
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        imageData: base64.split(',')[1], // Remove data:image/... prefix
        fileName: file.name,
        mimeType: file.type
      })
    });
    return response.json(); // { logoUrl: string }
  };
  reader.readAsDataURL(file);
}
```

### D. User Profile Settings (Persistent)
**Endpoints:**
- `GET /settings/profile` - Get current user profile (name, email)
- `PUT /settings/profile` - Update profile information
- `POST /settings/change-password` - Change password

**Features:**
- Profile updates sync with Cognito user pool
- Password changes validated and secured via Cognito
- Uses AdminUpdateUserAttributes and AdminSetUserPassword

### E. Email Templates (Persistent)
**Endpoints:**
- `GET /settings/email-template` - Get custom email template (or default)
- `PUT /settings/email-template` - Update email template with variable substitution

**Variables Supported:**
- `{{company_name}}` - From company settings
- `{{client_name}}` - From invoice client
- `{{invoice_number}}` - Invoice ID
- `{{invoice_amount}}` - Total with currency
- `{{due_date}}` - Invoice due date

**Database:** DynamoDB `{service}-email-templates-{stage}` table
- Stores per-user templates with automatic variable extraction

---

## 2. Invoice Item Structure - BACKEND VALIDATION ✅

### Solution Implemented:
**Backend validates that lineAmount matches calculation: quantity × unitPrice**

**Validation Rules:**
1. Each item's `amount` field must equal `quantity × unitPrice`
2. `subtotal` must equal sum of all item amounts
3. If `taxRate` is provided, `tax` must equal `subtotal × (taxRate / 100)`
4. `total` must equal `subtotal - discount + tax`

**Tolerance:** ±0.01 (handles floating-point rounding)

**Error Response Example:**
```json
{
  "statusCode": 400,
  "body": {
    "error": "Item 1: lineAmount should be 150.00 (quantity × unitPrice), but got 160.00; Subtotal should be 450.00, but got 460.00"
  }
}
```

### Frontend Responsibility:
```typescript
// CreateInvoice.tsx - Item calculation helper
function calculateLineAmount(quantity: number, unitPrice: number): number {
  return Math.round(quantity * unitPrice * 100) / 100;
}

// When submitting invoice:
const items = invoiceItems.map(item => ({
  ...item,
  amount: calculateLineAmount(item.quantity, item.unitPrice) // Must be calculated!
}));

const subtotal = items.reduce((sum, item) => sum + item.amount, 0);
const tax = subtotal * (taxRate / 100);
const total = subtotal - discount + tax;

// Send to backend with all calculated values
await createInvoice({
  items, // Each item has correct amount
  subtotal, // Sum of amounts
  tax, // Calculated from rate
  taxRate, // Percentage
  discount, // As percentage
  total // Final total
});
```

---

## 3. Pagination - IMPLEMENTED & OPTIMIZED ✅

### Backend Implementation:
**Cursor-based pagination** (not offset-based) - More efficient for large datasets

**Query Parameters:**
- `limit` - Number of items per page (1-100, default: 50)
- `lastKey` - Base64-encoded cursor for next page

**Response Format:**
```json
{
  "items": [...],
  "count": 5,
  "lastKey": "eyJ1c2VySWQiOiJ1c2VyMTIzIiwiaWQiOiJpbnYwMDUifQ=="
}
```

**Note:** `lastKey` is **only present** if more items exist. Absence of `lastKey` = end of pagination

### Frontend Implementation - InvoiceListPage.tsx:

**Using Zustand Store:**
```typescript
// store/invoiceStore.ts
interface InvoiceListState {
  invoices: Invoice[];
  loading: boolean;
  pageStack: string[]; // Track previous lastKeys for back navigation
  currentPage: number;
  totalItems: number;
  
  // Actions
  fetchFirstPage: () => Promise<void>;
  fetchNextPage: () => Promise<void>;
  fetchPreviousPage: () => Promise<void>;
  resetPagination: () => void;
}

export const useInvoiceStore = create<InvoiceListState>((set, get) => ({
  invoices: [],
  loading: false,
  pageStack: [],
  currentPage: 0,
  totalItems: 0,
  
  fetchFirstPage: async () => {
    set({ loading: true });
    const response = await fetch(`/api/invoices?limit=10`);
    const data = await response.json();
    set({
      invoices: data.items,
      totalItems: data.count,
      pageStack: [], // Reset stack
      currentPage: 0,
      loading: false,
    });
  },
  
  fetchNextPage: async () => {
    const { invoices, pageStack } = get();
    if (!invoices.length) return;
    
    set({ loading: true });
    const lastInvoice = invoices[invoices.length - 1];
    const lastKey = btoa(JSON.stringify({ userId: lastInvoice.userId, id: lastInvoice.id }));
    
    const response = await fetch(`/api/invoices?limit=10&lastKey=${lastKey}`);
    const data = await response.json();
    
    if (data.items.length > 0) {
      set({
        invoices: data.items,
        pageStack: [...pageStack, lastKey],
        currentPage: get().currentPage + 1,
        loading: false,
      });
    } else {
      set({ loading: false });
    }
  },
  
  fetchPreviousPage: async () => {
    const { pageStack } = get();
    if (pageStack.length <= 1) {
      await get().fetchFirstPage();
      return;
    }
    
    set({ loading: true });
    const previousLastKey = pageStack[pageStack.length - 2];
    
    const response = await fetch(`/api/invoices?limit=10&lastKey=${previousLastKey}`);
    const data = await response.json();
    
    set({
      invoices: data.items,
      pageStack: pageStack.slice(0, -1),
      currentPage: get().currentPage - 1,
      loading: false,
    });
  },
  
  resetPagination: () => {
    set({
      invoices: [],
      pageStack: [],
      currentPage: 0,
      totalItems: 0,
    });
  },
}));
```

**UI Component:**
```typescript
// components/invoice/InvoiceListPage.tsx
export const InvoiceListPage = () => {
  const {
    invoices,
    loading,
    currentPage,
    totalItems,
    pageStack,
    fetchFirstPage,
    fetchNextPage,
    fetchPreviousPage,
  } = useInvoiceStore();

  useEffect(() => {
    fetchFirstPage();
  }, []);

  const hasNextPage = invoices.length === 10; // Reached limit, likely more data
  const hasPreviousPage = pageStack.length > 0;

  return (
    <div>
      <InvoicesTable invoices={invoices} loading={loading} />
      
      <div className="pagination">
        <button 
          onClick={fetchPreviousPage} 
          disabled={!hasPreviousPage || loading}
        >
          Previous
        </button>
        
        <span>Page {currentPage + 1} ({invoices.length} items)</span>
        
        <button 
          onClick={fetchNextPage} 
          disabled={!hasNextPage || loading}
        >
          Next
        </button>
      </div>
    </div>
  );
};
```

### Pagination Best Practices:
1. **Don't rely on count for "has next"**: Instead, check if response contains `lastKey`
2. **Track lastKey stack**: For efficient back navigation
3. **Disable buttons appropriately**: Based on pagination state
4. **Show current page**: Help users understand where they are
5. **Consider infinite scroll**: Alternative to pagination buttons

---

## Summary Table

| Feature | Status | Storage | Endpoints | Frontend Status |
|---------|--------|---------|-----------|-----------------|
| Clients | ✅ Full CRUD | DynamoDB | 5 endpoints | Needs integration |
| Company Settings | ✅ Persistent | DynamoDB | 2 endpoints | Needs integration |
| Logo Upload | ✅ Persistent | S3 + DynamoDB | 1 endpoint | Needs integration |
| User Profile | ✅ Persistent | DynamoDB + Cognito | 3 endpoints | Needs integration |
| Email Templates | ✅ Persistent | DynamoDB | 2 endpoints | Needs integration |
| Invoice Validation | ✅ Enhanced | DynamoDB | Updated | Needs calculation |
| Pagination | ✅ Cursor-based | Backend logic | List endpoints | Needs implementation |

---

## Environment Setup

Add to `.env` file:
```bash
# Required for email functionality
SES_FROM_EMAIL=noreply@yourdomain.com

# These are set by serverless.yml, but ensure your AWS credentials are configured
AWS_REGION=us-east-1
```

Deploy with:
```bash
serverless deploy --stage dev
```

All new tables and endpoints will be created automatically.
