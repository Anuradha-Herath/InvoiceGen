# Integration Checklist & Next Steps

## ✅ Completed Backend Implementation

### Data Persistence
- [x] Full Client CRUD endpoints (5 endpoints)
- [x] Company Settings persistence (GET/PUT)
- [x] Logo upload to S3 with URL storage
- [x] User profile management with Cognito sync
- [x] Email template storage with variable extraction
- [x] Password change functionality

### Invoice Validation
- [x] LineAmount validation (quantity × unitPrice)
- [x] Subtotal calculation verification
- [x] Tax calculation validation
- [x] Total calculation verification
- [x] Detailed error messages for each validation failure

### Pagination
- [x] Cursor-based pagination (more efficient than offset)
- [x] Base64 encoding/decoding for pagination keys
- [x] Per-page size validation (1-100 items)
- [x] Updated list endpoints with pagination support
- [x] Backward navigation support via key history

---

## 📋 Frontend Implementation Checklist

### Phase 1: Type Definitions & API Integration
- [ ] Copy `apiClient.example.ts` → `services/apiClient.ts`
- [ ] Update existing `services/api.ts` to include new endpoints
- [ ] Add `types/client.ts` definitions
- [ ] Add `types/settings.ts` definitions
- [ ] Verify all imports in existing service files

### Phase 2: Client Management (ClientListPage)
- [ ] Replace mock data with API calls
  - [ ] `apiClient.listClients()` for initial load
  - [ ] Implement pagination using provided `InvoiceListPageWithPagination.example.tsx` as reference
  - [ ] Add create client modal
  - [ ] Add update client functionality
  - [ ] Add delete client with confirmation
- [ ] Update Zustand store to persist client list state
- [ ] Add loading and error states to UI
- [ ] Test CRUD operations end-to-end

### Phase 3: Invoice Creation (CreateInvoice)
- [ ] Implement item.amount calculation helper
  ```typescript
  const calculateLineAmount = (qty: number, unitPrice: number) => 
    Math.round(qty * unitPrice * 100) / 100;
  ```
- [ ] Replace TODO comments with actual API calls
  - [ ] `apiClient.createInvoice()` on save
  - [ ] Handle validation errors from backend
- [ ] Show backend validation errors to user
- [ ] Update store after successful creation
- [ ] Add loading state to form submission

### Phase 4: Invoice List with Pagination (InvoiceListPage)
- [ ] Copy `InvoiceListPageWithPagination.example.tsx` as reference
- [ ] Implement pagination state management
  - [ ] Use provided Zustand store example or similar
  - [ ] Track pageStack for back navigation
- [ ] Replace mock data with `apiClient.listInvoices()`
- [ ] Implement pagination controls
  - [ ] Previous/Next buttons
  - [ ] Current page indicator
  - [ ] Disable buttons when at start/end
- [ ] Handle lastKey correctly
  - [ ] Don't show "Next" button when lastKey is undefined
  - [ ] Reset pagination on filters/searches
- [ ] Add loading spinner during pagination

### Phase 5: Invoice Details & Actions (InvoiceDetailPage)
- [ ] Fetch invoice with `apiClient.getInvoice()`
- [ ] Implement PDF generation
  - [ ] `apiClient.generateInvoicePDF()`
  - [ ] Disable PDF button until generated
  - [ ] Update invoice status to 'generated'
- [ ] Implement email sending
  - [ ] `apiClient.sendInvoiceEmail()`
  - [ ] Show email template preview
  - [ ] Auto-update status to 'sent'
- [ ] Implement invoice deletion
  - [ ] `apiClient.deleteInvoice()`
  - [ ] Redirect to list after deletion
- [ ] Add status badge with visual distinction
  - [ ] draft: gray
  - [ ] generated: blue
  - [ ] sent: green
  - [ ] paid: gold

### Phase 6: Settings Page
#### Profile Tab
- [ ] Load profile with `apiClient.getProfile()`
- [ ] Implement profile update form
  - [ ] `apiClient.updateProfile()`
  - [ ] Show success/error messages
- [ ] Implement password change
  - [ ] `apiClient.changePassword()`
  - [ ] Validate password requirements (8+ chars, mixed case, numbers, symbols)
  - [ ] Require current password verification

#### Company Tab
- [ ] Load company settings with `apiClient.getCompanySettings()`
- [ ] Implement settings form
  - [ ] `apiClient.updateCompanySettings()`
  - [ ] Show success message on update
- [ ] Logo upload
  - [ ] `apiClient.uploadLogo(file)`
  - [ ] Show preview of uploaded logo
  - [ ] Display in invoice preview
  - [ ] Handle different image formats

#### Email Tab
- [ ] Load template with `apiClient.getEmailTemplate()`
- [ ] Implement template editor
  - [ ] `apiClient.updateEmailTemplate()`
  - [ ] Show available variables
  - [ ] Template preview with sample data
- [ ] Validate template before saving

#### Billing Tab
- [ ] Display current plan (mock for now)
- [ ] Placeholder for payment method management

### Phase 7: Testing & Validation
- [ ] Test all CRUD operations
- [ ] Verify pagination with large datasets
- [ ] Test invoice calculations with various scenarios
  - [ ] With discount
  - [ ] With different tax rates
  - [ ] With multiple items
- [ ] Validate error handling
  - [ ] Network errors
  - [ ] Validation errors from backend
  - [ ] Authorization errors
- [ ] Test responsive design on mobile
- [ ] Verify email template variables are substituted correctly

---

## 🔧 Backend Configuration

### Required Environment Variables
```bash
# AWS Configuration
AWS_REGION=us-east-1
USER_POOL_ID=your-cognito-pool-id
USER_POOL_CLIENT_ID=your-cognito-client-id

# Email Configuration
SES_FROM_EMAIL=noreply@yourdomain.com

# Optional
STAGE=dev
```

### Deployment
```bash
# Install dependencies
npm install

# Deploy to AWS
serverless deploy --stage dev

# View outputs
serverless info --stage dev
```

### Database Indexes
All tables automatically created with appropriate indexes:
- `invoices` - UserIdIndex for efficient per-user queries
- `clients` - UserCreatedIndex for sorting by date
- `company_settings` - Direct userId lookup
- `email_templates` - Direct userId lookup

---

## 📚 Reference Files

### Backend
- `backend/IMPLEMENTATION_GUIDE.md` - Complete integration guide
- `backend/libs/pagination.ts` - Pagination utilities
- `backend/libs/validation.ts` - Enhanced validation with calculations
- `backend/functions/*/` - All endpoint implementations

### Frontend Examples (Reference Only)
- `frontend/src/components/invoice/InvoiceListPageWithPagination.example.tsx`
- `frontend/src/store/invoiceListStore.example.ts`
- `frontend/src/services/apiClient.example.ts`
- `frontend/src/types/client.ts`
- `frontend/src/types/settings.ts`

---

## 🚀 Implementation Order Recommendation

1. **Start with API Integration** (Phase 1)
   - Set up types and API client
   - Test authentication

2. **Simple CRUD First** (Phase 2)
   - Implement clients (simpler than invoices)
   - Test create, read, update, delete

3. **Invoice Creation** (Phase 3)
   - Implement calculation helpers
   - Test backend validation

4. **Invoice List** (Phase 4)
   - Implement pagination logic
   - Test with real data

5. **Advanced Features** (Phase 5-6)
   - Email, PDF, settings
   - These depend on above working correctly

6. **Polish & Test** (Phase 7)
   - UI improvements
   - Error handling
   - Edge cases

---

## ⚠️ Common Issues & Solutions

### Issue: "Pagination key decode error"
**Solution:** Ensure you're using the `lastKey` from response directly as query parameter. Don't try to encode/decode it again.

### Issue: "Invoice validation error: lineAmount should be X but got Y"
**Solution:** Make sure frontend calculates `amount = Math.round(quantity * unitPrice * 100) / 100` with rounding.

### Issue: "Client list returns empty even though clients exist"
**Solution:** Check that DynamoDB table `{service}-clients-{stage}` exists and has items. Verify userId in query matches authenticated user.

### Issue: "Email not sending"
**Solution:** 
1. Verify `SES_FROM_EMAIL` environment variable is set
2. Check AWS SES is in production mode (not sandbox)
3. Ensure email address is verified in SES
4. Check CloudWatch logs for detailed errors

### Issue: "Logo upload fails"
**Solution:**
1. Verify S3 bucket permissions
2. Check file is under 5MB
3. Ensure MIME type is one of: png, jpeg, gif, svg+xml
4. Check browser console for base64 encoding errors

---

## 💡 Best Practices

1. **Always validate frontend-side** before sending to backend
2. **Trust backend validation** - Don't bypass it
3. **Handle pagination correctly** - Check for lastKey, not count
4. **Cache strategically** - Store company settings and templates in local state
5. **Show loading states** - Better UX, prevents double submissions
6. **Clear error messages** - Use backend error responses directly
7. **Test with real data** - Mock data can hide issues
8. **Monitor CloudWatch** - Check Lambda logs for issues

---

## 📞 Debugging Tips

### View Backend Logs
```bash
serverless logs --function createInvoice --stage dev
```

### Test Endpoints Locally
```bash
# Using curl
curl -X POST http://localhost:3001/api/invoices \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d @invoice.json

# Using Postman
# Import collection from serverless outputs
```

### Check DynamoDB
```bash
# Using AWS CLI
aws dynamodb scan --table-name invoice-generator-invoices-dev \
  --filter-expression "userId = :uid" \
  --expression-attribute-values '{":uid":{"S":"user123"}}'
```

---

## 🎉 Success Criteria

- [ ] All CRUD operations work end-to-end
- [ ] Pagination works for 100+ items
- [ ] Invoice calculations validated correctly
- [ ] Email templates send with variable substitution
- [ ] Logo displays in invoices
- [ ] Settings persist across sessions
- [ ] Errors handled gracefully with user messages
- [ ] No console errors in production build
- [ ] Mobile responsive design works
- [ ] Performance acceptable (<2s page loads)

---

## Next Phase: Optional Enhancements

After core implementation:
- Add invoice search/filter
- Implement invoice templates
- Add multiple currency support
- Create invoice sharing via link
- Add invoice reminders (scheduled emails)
- Implement audit logging
- Add bulk operations (export, email multiple)
- Mobile app version
