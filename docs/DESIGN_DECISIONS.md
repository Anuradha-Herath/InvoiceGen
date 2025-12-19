# Design Decisions & Solutions

## 1. Data Persistence vs UI-Only

### Decision: ✅ FULL BACKEND PERSISTENCE

**Rationale:**
- All three features (clients, settings, logos) have full CRUD backend implementation
- Data is persistent across sessions
- Multiple users can have separate data
- Enterprise-grade reliability

### Implementation Details:

#### A. Client Management
**Why Persistent:**
- Clients should be reusable across multiple invoices
- Historical data important for reporting
- Reduces data entry by selecting from list

**Storage:** DynamoDB `clients` table
**Key:** userId + id (composite key for multi-tenancy)
**Endpoints:** 5 (Create, Read, Update, Delete, List)

**Data Model:**
```typescript
{
  id: string;              // UUID
  userId: string;          // Owner
  name: string;            // Required
  email: string;           // Required
  phone?: string;
  company?: string;        // From UI
  address?: string;
  invoices?: number;       // Count
  createdAt: string;
  updatedAt: string;
}
```

#### B. Company Settings
**Why Persistent:**
- Single settings per user
- Reused in invoices and email templates
- Logo URL must be stored after upload

**Storage:** DynamoDB `company_settings` table
**Key:** userId only (one settings per user)
**Pattern:** GET (retrieve, or create with defaults), PUT (update all)

**Data Stored:**
- Company name, address, phone, email, website, taxId
- Logo URL (from S3)

#### C. Logo Upload
**Why Persistent:**
- Logo file stored in S3 (object storage, not database)
- URL reference stored in company settings
- Reused across all invoices

**Storage:** 
- File: S3 bucket `{service}-pdfs-{stage}/logos/{userId}/{uuid}-{filename}`
- Reference: Stored in company_settings table as `logoUrl`

**Implementation:**
1. Frontend reads file as base64
2. Backend validates MIME type (PNG, JPEG, GIF, SVG)
3. Uploads to S3 with user isolation via path
4. Returns signed URL
5. Stores URL reference in company settings

### Benefits of Full Persistence:

| Feature | Benefit |
|---------|---------|
| Multi-tenancy | Users isolated via userId in all tables |
| Scalability | DynamoDB scales horizontally |
| Reliability | ACID properties, automatic backups |
| Auditability | Timestamps for created/updated |
| Searchability | Can query/filter clients |
| Cost-effective | Pay per request, no server costs |
| Security | AWS IAM controls, encryption at rest |

---

## 2. Invoice Item Structure - Calculation Approach

### Decision: ✅ REQUIRE FRONTEND CALCULATION, VALIDATE ON BACKEND

**Why This Approach:**

1. **Frontend Calculates:**
   - Better UX (instant feedback)
   - Faster user input (no server roundtrip)
   - Display calculations as user types
   - Show total cost immediately

2. **Backend Validates:**
   - Prevents fraud/manipulation
   - Ensures data integrity
   - Catches rounding errors
   - Audit trail of invalid attempts

### Calculation Flow:

```
Frontend → Backend → Database
   ↓
User enters quantity (5) + unitPrice (100)
   ↓
JavaScript calculates: 5 × 100 = 500 (lineAmount)
   ↓
Display updates immediately: "Line Total: $500"
   ↓
User submits invoice with all calculated fields
   ↓
Backend validates calculations:
  - Each item.amount = quantity × unitPrice ✓
  - subtotal = Σ item.amount ✓
  - tax = subtotal × (taxRate / 100) ✓
  - total = subtotal - discount + tax ✓
   ↓
If invalid, return detailed error
   ↓
If valid, store in database
```

### Frontend Responsibilities:

```typescript
// Helper function - REQUIRED in CreateInvoice.tsx
function calculateLineAmount(quantity: number, unitPrice: number): number {
  return Math.round(quantity * unitPrice * 100) / 100;
}

function calculateSummary(items: InvoiceItem[], discount: number, taxRate: number) {
  const subtotal = items.reduce((sum, item) => sum + item.amount, 0);
  const tax = Math.round(subtotal * (taxRate / 100) * 100) / 100;
  const discountAmount = Math.round(subtotal * (discount / 100) * 100) / 100;
  const total = subtotal - discountAmount + tax;
  
  return { subtotal, tax, discountAmount, total };
}

// When user modifies quantity or price
const updateItem = (index: number, quantity: number, unitPrice: number) => {
  items[index].amount = calculateLineAmount(quantity, unitPrice);
  updateSummary(); // Recalculate totals
};

// Before submitting
const submitInvoice = async () => {
  const invoiceData = {
    items: items.map(i => ({
      ...i,
      amount: calculateLineAmount(i.quantity, i.unitPrice) // Ensure fresh calculation
    })),
    ...calculateSummary(items, discount, taxRate),
    taxRate,
    discount,
    // ... other fields
  };
  
  const response = await apiClient.createInvoice(invoiceData);
  // Handle response or error
};
```

### Backend Validation Details:

**Tolerances:** ±0.01 (floating-point rounding)

**Validation Formula:**
```javascript
// For each item
calculatedAmount = Math.round(qty × unitPrice × 100) / 100
difference = Math.abs(calculatedAmount - providedAmount)
valid = difference ≤ 0.01

// Subtotal
calculatedSubtotal = sum of all item amounts
valid = Math.abs(calculatedSubtotal - providedSubtotal) ≤ 0.01

// Tax
expectedTax = Math.round(subtotal × (taxRate/100) × 100) / 100
valid = Math.abs(expectedTax - providedTax) ≤ 0.01

// Total
expectedTotal = subtotal - discount + tax
valid = Math.abs(expectedTotal - providedTotal) ≤ 0.01
```

### Error Response Example:

```json
{
  "statusCode": 400,
  "error": "Item 1: lineAmount should be 150.00 (quantity × unitPrice), but got 160.00; Subtotal should be 450.00 (sum of amounts), but got 460.00"
}
```

### Why NOT Backend-Only Calculation:

❌ **Rejected Approaches:**

1. **Backend calculates everything**
   - Poor UX (user can't see total until submit)
   - More API calls needed for each change
   - Slower user experience

2. **Frontend calculates, backend trusts**
   - Security risk (user can manipulate)
   - No audit trail
   - Data integrity issues

### Recommended UI Implementation:

```typescript
<InvoiceItemRow
  item={item}
  onChange={(quantity, unitPrice) => {
    item.quantity = quantity;
    item.unitPrice = unitPrice;
    item.amount = calculateLineAmount(quantity, unitPrice); // Auto-calculate
    updateUI(); // Show total immediately
  }}
/>

<Summary>
  <LineTotal>{item.amount}</LineTotal> {/* Shows calculated value */}
  <Subtotal>{subtotal}</Subtotal>
  <Tax>{tax} (at {taxRate}%)</Tax>
  <Discount>-${discountAmount} ({discount}%)</Discount>
  <Total>{total}</Total>
</Summary>

{error && <ErrorAlert>{error}</ErrorAlert>} {/* Show backend validation errors */}
```

---

## 3. Pagination Strategy

### Decision: ✅ CURSOR-BASED PAGINATION (Backend) + UI IMPLEMENTATION (Frontend)

**Why Cursor-Based?**

| Aspect | Cursor-Based | Offset-Based |
|--------|--------------|--------------|
| Efficiency | O(1) lookup | O(n) scan |
| Consistency | Sorted by ID | Skips records |
| Large datasets | Fast | Slow |
| Concurrent updates | Handles well | Can skip/duplicate |
| Implementation | Complex | Simple |
| Recommended for | 1000+ items | <1000 items |

**Our invoice datasets likely grow over time, so cursor-based is better.**

### Pagination Implementation:

#### Backend (Already Implemented)

```typescript
// Query with pagination
const response = fetch('/api/invoices?limit=10&lastKey=eyJ1c2VySWQiOiJ1MjEifQ==')

// Response format
{
  "items": [...],        // 10 items max
  "count": 10,           // Items in this response
  "lastKey": "eyJpZCI6IiJsfQ=="  // For next page (only if more exists)
}
```

**Key Points:**
- `lastKey` = base64-encoded cursor (opaque to frontend)
- Only send `lastKey` if more items exist
- Frontend should check: `if (response.lastKey)` not `if (response.count === limit)`
- Limit: 1-100 items per page (clamped)

#### Frontend Implementation (Recommended)

**Option 1: Simple State** (for small lists)
```typescript
const [invoices, setInvoices] = useState([]);
const [lastKey, setLastKey] = useState<string | undefined>();
const [isLoading, setIsLoading] = useState(false);
const [pageStack, setPageStack] = useState<string[]>([]);

const fetchPage = async (key?: string) => {
  setIsLoading(true);
  const response = await apiClient.listInvoices(10, key);
  setInvoices(response.items);
  setLastKey(response.lastKey);
  setIsLoading(false);
};

const goNext = () => {
  if (lastKey) {
    setPageStack([...pageStack, lastKey]);
    fetchPage(lastKey);
  }
};

const goPrevious = () => {
  const newStack = pageStack.slice(0, -1);
  setPageStack(newStack);
  const previousKey = newStack[newStack.length - 1];
  fetchPage(previousKey);
};
```

**Option 2: Zustand Store** (for complex state)
See: `frontend/src/store/invoiceListStore.example.ts`

**Option 3: React Query** (for advanced caching)
```typescript
import { useQuery } from '@tanstack/react-query';

const { data, isPreviousData } = useQuery({
  queryKey: ['invoices', lastKey],
  queryFn: () => apiClient.listInvoices(10, lastKey),
  staleTime: 5 * 60 * 1000, // 5 minutes
});
```

### UI Component Pattern:

```typescript
<PageHeader>
  <h2>Invoices</h2>
  <SearchFilter onChange={handleSearch} /> {/* Resets pagination */}
</PageHeader>

<InvoicesTable 
  data={invoices} 
  loading={isLoading}
/>

<PaginationControls>
  {/* Previous button */}
  <Button
    onClick={goPrevious}
    disabled={!hasPreviousPage || isLoading}
  >
    ← Previous
  </Button>

  {/* Page indicator */}
  <span>Page {currentPage + 1}</span>

  {/* Next button */}
  <Button
    onClick={goNext}
    disabled={!hasNextPage || isLoading}  {/* KEY: Check lastKey exists */}
  >
    Next →
  </Button>

  {/* Reset/First page */}
  {currentPage > 0 && (
    <Button variant="ghost" onClick={goFirst}>
      First
    </Button>
  )}
</PaginationControls>

{error && <ErrorAlert message={error} />}
```

### Common Pitfalls to Avoid:

1. ❌ **Checking `count === limit` for "has next"**
   ```typescript
   // WRONG - What if last page has 10 items?
   const hasNext = invoices.length === 10;
   ```
   
   ✅ **Correct - Check for lastKey**
   ```typescript
   const hasNext = !!lastKey;
   ```

2. ❌ **Trying to decode lastKey**
   ```typescript
   // WRONG - It's opaque!
   const key = JSON.parse(atob(lastKey));
   ```
   
   ✅ **Correct - Pass as-is**
   ```typescript
   await fetchPage(lastKey); // Just pass it
   ```

3. ❌ **Not resetting pagination on search/filter**
   ```typescript
   // WRONG - Mixing results from different queries
   const handleSearch = (term) => {
     setSearchTerm(term);
     // But pagination still has old lastKey!
   };
   ```
   
   ✅ **Correct - Reset pagination**
   ```typescript
   const handleSearch = (term) => {
     setSearchTerm(term);
     setPageStack([]);
     setLastKey(undefined);
     fetchPage(); // Fetch without lastKey (first page)
   };
   ```

4. ❌ **Storing pagination keys too long**
   ```typescript
   // WRONG - lastKey is tied to dataset state
   // If new invoice added, old lastKeys become invalid
   ```
   
   ✅ **Correct - Refetch if data changes**
   ```typescript
   // When invoice is added/deleted/modified, refetch
   useEffect(() => {
     queryClient.invalidateQueries(['invoices']);
   }, [someDataChangedEvent]);
   ```

### Performance Considerations:

| Scenario | Solution |
|----------|----------|
| 100 invoices | Simple pagination fine |
| 1000+ invoices | Use cursor-based ✓ |
| Real-time updates | Add refresh button |
| Search within page | Filter client-side |
| Filter by status | Add server-side filter param |
| Sort by date | Backend handles via index |

### Advanced Features (Future):

```typescript
// Infinite scroll alternative
<InfiniteScroll
  dataLength={invoices.length}
  next={loadMore}
  hasMore={!!lastKey}
  loader={<Spinner />}
>
  <InvoicesTable data={invoices} />
</InfiniteScroll>

// Server-side filtering + pagination
const handleFilterByStatus = (status) => {
  setStatus(status);
  setPageStack([]);
  fetchPage(undefined); // Reset with filter
};

// Jumping to page (requires some calculation)
const jumpToPage = (pageNum) => {
  // Fetch first page, then click next (pageNum-1) times
  // OR store all lastKeys in history
  const targetLastKey = pageStack[pageNum - 1];
  fetchPage(targetLastKey);
};
```

---

## Summary Table

| Consideration | Decision | Rationale |
|---------------|----------|-----------|
| **Data Persistence** | ✅ Full Backend CRUD | Multi-tenancy, reliability, auditability |
| **Client Storage** | DynamoDB | Persistent, queryable, reusable |
| **Settings Storage** | DynamoDB | Single record per user, easy updates |
| **Logo Storage** | S3 + URL reference | Object storage best practice, CDN-friendly |
| **Item Calculation** | Frontend calc + Backend validate | UX + Security |
| **Validation Tolerance** | ±0.01 | Floating-point rounding |
| **Pagination Type** | Cursor-based | Efficient for growing datasets |
| **Pagination State** | Zustand store | Simple, reusable, reactive |
| **Page Size** | 10 items (customizable) | Balance UX and performance |
| **Reset on Filter** | Required | Prevents pagination state issues |

---

## Implementation Priority

1. **High Priority** (Core functionality)
   - Client CRUD (needed for invoices)
   - Invoice calculation validation
   - Pagination implementation

2. **Medium Priority** (Essential features)
   - Company settings
   - Email templates
   - Logo upload

3. **Low Priority** (Polish)
   - Infinite scroll
   - Advanced filtering
   - Export functionality

---

This comprehensive design ensures your app is:
- **Scalable** - Can handle thousands of invoices
- **Secure** - Validates all data server-side
- **User-Friendly** - Responsive UI with instant feedback
- **Reliable** - Persistent, auditable data storage
- **Maintainable** - Clear patterns and examples
