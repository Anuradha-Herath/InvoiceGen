# Invoice Generator SaaS - Development Setup Complete ✅

## What You Have

Your application is a **Serverless SaaS** with:

```
┌─────────────────────────────────────────────────────┐
│                  Frontend (Port 3000)                │
│                    Next.js App                       │
└──────────────────┬──────────────────────────────────┘
                   │
                   │ API Calls
                   ▼
┌─────────────────────────────────────────────────────┐
│              Backend API (Port 3001)                 │
│        AWS Lambda (Serverless Offline)              │
│                                                      │
│  ├─ Auth: signup, login                            │
│  ├─ Invoices: CRUD operations                      │
│  ├─ PDF: Generate invoice PDFs                     │
│  └─ Email: Send invoices via SES                   │
└──────────────┬───────────────────────────────────┬──┘
               │                                   │
        DynamoDB (mocked)              S3 (mocked)
              
```

## Quick Start Commands

### 1. Initial Setup (One Time)
```bash
npm run install:all
```

### 2. Start Development Environment
```bash
npm run dev
```
This starts both:
- ✅ Backend API on `http://localhost:3001`
- ✅ Frontend on `http://localhost:3000`

### 3. Run Components Separately (If Needed)
```bash
# Terminal 1
npm run dev:backend

# Terminal 2
npm run dev:frontend
```

## What Works Locally

✅ **Authentication**
- Sign up with email and password
- Login and receive JWT tokens
- Tokens stored in localStorage
- Protected dashboard routes

✅ **Invoice Management**
- Create invoices
- List all invoices
- View invoice details
- Update invoices
- Delete invoices

✅ **PDF Generation**
- Generate PDF from invoice data
- Download PDFs

✅ **Email Integration**
- Send invoices via email (mocked in local development)

## Endpoints Reference

| Method | Endpoint | Purpose |
|--------|----------|---------|
| POST | `/auth/signup` | Register new user |
| POST | `/auth/login` | Login user |
| POST | `/invoices` | Create invoice |
| GET | `/invoices` | List invoices |
| GET | `/invoices/{id}` | Get invoice details |
| PUT | `/invoices/{id}` | Update invoice |
| DELETE | `/invoices/{id}` | Delete invoice |
| POST | `/invoices/{id}/pdf` | Generate PDF |
| POST | `/invoices/{id}/email` | Send via email |

## Technology Stack

### Backend
- **Runtime**: Node.js 18.x
- **Framework**: Serverless Framework
- **Local Testing**: serverless-offline
- **Database**: DynamoDB (mocked locally)
- **Storage**: S3 (mocked locally)
- **Email**: AWS SES (mocked locally)
- **Auth**: AWS Cognito (mocked locally)
- **Language**: TypeScript

### Frontend
- **Framework**: Next.js 14
- **UI**: Tailwind CSS
- **Icons**: Heroicons
- **Forms**: React Hook Form
- **HTTP Client**: Axios
- **State Management**: Zustand
- **Notifications**: React Hot Toast
- **Language**: TypeScript

## File Structure

```
Invoice Generator/
├── backend/
│   ├── functions/
│   │   ├── auth/        (signup, login)
│   │   ├── invoices/    (CRUD operations)
│   │   ├── pdf/         (PDF generation)
│   │   └── email/       (Email sending)
│   ├── libs/            (Shared utilities)
│   ├── models/          (TypeScript types)
│   ├── serverless.yml   (Configuration)
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── app/         (Next.js pages)
│   │   ├── services/    (API client)
│   │   ├── store/       (State management)
│   │   └── types/       (TypeScript types)
│   └── package.json
├── package.json         (Root)
├── LOCAL_DEVELOPMENT.md (This guide)
└── setup.bat           (Setup script)
```

## Important Notes

### Local Development Features
- 🔵 **Serverless Offline**: Emulates AWS Lambda & API Gateway
- 🔵 **In-Memory DynamoDB**: Data resets on server restart
- 🔵 **Mocked S3**: File storage is in-memory
- 🔵 **Mocked SES**: Emails logged to console

### Browser Console
- Check browser DevTools Console (F12) for API errors
- Check Network tab to see API requests/responses
- Check Application tab to verify localStorage has auth tokens

### Terminal Output
- Backend logs appear on left terminal
- Frontend logs appear on right terminal

## Troubleshooting

### Port Already in Use
```powershell
# Find process using port 3001
netstat -ano | findstr :3001

# Kill the process
taskkill /PID <PID> /F
```

### Backend Not Starting
```bash
# Clear node_modules and reinstall
cd backend
rm -r node_modules
npm install
npm run dev
```

### Frontend Not Connecting to Backend
1. Ensure backend is running on port 3001
2. Check `.env.local` has correct `NEXT_PUBLIC_API_URL`
3. Check browser console for CORS errors
4. Verify authentication tokens in localStorage

### Authentication Issues
1. Sign up with a test email
2. Check Network tab to see login response
3. Verify token is stored in localStorage
4. Check if bearer token is being sent in Authorization header

## Next Steps

1. ✅ Run `npm run dev`
2. ✅ Go to `http://localhost:3000`
3. ✅ Sign up for an account
4. ✅ Log in
5. ✅ Create and manage invoices
6. ✅ Test all features locally

## Resources

- 📖 [Serverless Framework Docs](https://www.serverless.com/framework/docs)
- 📖 [Next.js Documentation](https://nextjs.org/docs)
- 📖 [AWS Lambda Guide](https://docs.aws.amazon.com/lambda/)
- 📖 [DynamoDB Documentation](https://docs.aws.amazon.com/dynamodb/)

## Support

For issues or questions:
1. Check LOCAL_DEVELOPMENT.md for detailed setup guide
2. Check browser DevTools Console (F12)
3. Check terminal output for error messages
4. Verify all prerequisites are installed (Node 18+, npm 9+)

---

**Happy Coding! 🚀**
