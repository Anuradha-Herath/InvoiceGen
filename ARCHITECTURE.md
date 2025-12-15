# 🎯 Invoice Generator - Complete Architecture

## Your Application Architecture

```
┌──────────────────────────────────────────────────────────────┐
│                     USER'S BROWSER                           │
│                    http://localhost:3000                     │
│  ┌────────────────────────────────────────────────────────┐  │
│  │  Next.js Frontend Application                          │  │
│  │  - Landing Page (hero, features, CTA)                 │  │
│  │  - Login Page (email + password form)                 │  │
│  │  - Signup Page (full name + email + password)         │  │
│  │  - Password Reset Page                                │  │
│  │  - Dashboard (invoice management)                     │  │
│  │                                                        │  │
│  │  Features:                                            │  │
│  │  ✅ Dark mode support                                │  │
│  │  ✅ Responsive design                                │  │
│  │  ✅ Form validation                                  │  │
│  │  ✅ Toast notifications                              │  │
│  │  ✅ Protected routes                                 │  │
│  └────────────────────────────────────────────────────────┘  │
└────────────────────────┬─────────────────────────────────────┘
                         │
                    HTTP/HTTPS
                         │
┌────────────────────────▼─────────────────────────────────────┐
│              LOCAL BACKEND API (SERVERLESS)                  │
│             http://localhost:3001                            │
│  ┌────────────────────────────────────────────────────────┐  │
│  │  Serverless Offline (Emulates AWS Lambda + API GW)     │  │
│  │                                                        │  │
│  │  Functions:                                           │  │
│  │  📝 Auth Functions                                    │  │
│  │     ├─ signup   - Register new user                  │  │
│  │     └─ login    - Authenticate & return JWT           │  │
│  │                                                        │  │
│  │  📋 Invoice Functions                                │  │
│  │     ├─ create   - Create new invoice                 │  │
│  │     ├─ list     - Get all user invoices              │  │
│  │     ├─ get      - Get single invoice                 │  │
│  │     ├─ update   - Modify invoice                     │  │
│  │     └─ delete   - Remove invoice                     │  │
│  │                                                        │  │
│  │  📄 PDF Functions                                    │  │
│  │     └─ generate - Create PDF from invoice             │  │
│  │                                                        │  │
│  │  📧 Email Functions                                  │  │
│  │     └─ send     - Send invoice via email              │  │
│  │                                                        │  │
│  │  Resources Created on Startup:                        │  │
│  │  ✅ Cognito User Pool (Auth)                         │  │
│  │  ✅ DynamoDB Tables (In-memory)                      │  │
│  │  ✅ S3 Bucket (In-memory)                            │  │
│  │  ✅ API Gateway (Endpoints)                          │  │
│  └────────────────────────────────────────────────────────┘  │
└──────────────────────────────────────────────────────────────┘


## Data Flow

### 1️⃣ User Registration/Login Flow
```
Browser          Frontend             Backend
  │                  │                   │
  │─ Click Sign Up ──>│                  │
  │                  │─ POST /auth/signup
  │                  │──────────────────>│
  │                  │  {email, password}│
  │                  │                  │
  │                  │<────── JWT Token ─│
  │                  │                  │
  │  Store Token    │                  │
  │<─ localStorage ──│                  │
  │                  │                  │
```

### 2️⃣ Invoice Management Flow
```
Browser           Frontend            Backend
  │                  │                  │
  │─ Go to Dashboard─>│                  │
  │                  │─ GET /invoices   │
  │                  │ (with JWT) ─────>│
  │                  │                  │
  │                  │<─ List of invoices
  │ Show List       │                  │
  │<────────────────│                  │
  │                  │                  │
  │─ Create Invoice ─>│                  │
  │                  │─ POST /invoices   │
  │                  │ (with JWT) ─────>│
  │                  │<─ Invoice created│
  │                  │                  │
```

### 3️⃣ PDF Generation Flow
```
Browser          Frontend            Backend
  │                  │                  │
  │─ Download PDF ──>│                  │
  │                  │─ POST /invoices/ │
  │                  │    {id}/pdf      │
  │                  │ (with JWT) ─────>│
  │                  │                  │
  │                  │     Generate PDF │
  │                  │    (Puppeteer)  │
  │                  │                  │
  │                  │<─ PDF File ──────│
  │<─ Download ──────│                  │
  │                  │                  │
```


## Local Development Services

### Running Services
```
┌─────────────────────────────────────┐
│  npm run dev                        │
│                                     │
│  ┌──────────────────────────────┐  │
│  │ Backend (Port 3001)          │  │
│  │ ├─ Serverless Offline        │  │
│  │ ├─ Lambda Functions          │  │
│  │ ├─ API Gateway              │  │
│  │ ├─ DynamoDB (mocked)        │  │
│  │ ├─ S3 (mocked)              │  │
│  │ ├─ SES (mocked)             │  │
│  │ └─ Cognito (mocked)         │  │
│  └──────────────────────────────┘  │
│                                     │
│  ┌──────────────────────────────┐  │
│  │ Frontend (Port 3000)         │  │
│  │ ├─ Next.js Dev Server        │  │
│  │ ├─ Hot Module Reload         │  │
│  │ ├─ TypeScript Compilation    │  │
│  │ └─ CSS Compilation (Tailwind)│  │
│  └──────────────────────────────┘  │
└─────────────────────────────────────┘
```


## File Organization

```
Invoice Generator/
│
├── 📄 SETUP_COMPLETE.md ............ This file
├── 📄 QUICK_START.md .............. Quick commands
├── 📄 LOCAL_DEVELOPMENT.md ........ Detailed guide
├── 📄 setup.bat ................... One-click setup
│
├── 📁 backend/ .................... AWS Lambda Functions
│   ├── 📁 functions/
│   │   ├── 📁 auth/ .............. Signup, Login
│   │   ├── 📁 invoices/ ......... CRUD operations
│   │   ├── 📁 pdf/ .............. PDF generation
│   │   └── 📁 email/ ............ Email sending
│   ├── 📁 libs/ .................. Shared utilities
│   ├── 📁 models/ ............... TypeScript types
│   ├── 📄 serverless.yml ........ Infrastructure config
│   ├── 📄 tsconfig.json ......... TypeScript config
│   ├── 📄 package.json .......... Dependencies
│   └── 📄 .env.local ............ Environment vars
│
├── 📁 frontend/ .................. Next.js Application
│   ├── 📁 src/
│   │   ├── 📁 app/ .............. Pages
│   │   │   ├── page.tsx ......... Landing page
│   │   │   ├── 📁 auth/ ......... Auth pages
│   │   │   │   ├── login/page.tsx
│   │   │   │   ├── signup/page.tsx
│   │   │   │   └── reset-password/page.tsx
│   │   │   └── 📁 dashboard/ .... Dashboard page
│   │   ├── 📁 services/ ......... API clients
│   │   │   ├── api.ts .......... Axios config
│   │   │   ├── auth.ts ......... Auth service
│   │   │   └── invoice.ts ...... Invoice service
│   │   ├── 📁 store/ ........... State (Zustand)
│   │   ├── 📁 types/ ........... TypeScript types
│   │   └── 📁 styles/ .......... Global CSS
│   ├── 📄 next.config.js ........ Next.js config
│   ├── 📄 tsconfig.json ........ TypeScript config
│   ├── 📄 tailwind.config.js ... Tailwind config
│   ├── 📄 package.json ........ Dependencies
│   └── 📄 .env.local .......... Environment vars
│
└── 📄 package.json ............... Root configuration
```


## How Everything Connects

```
┌─ User Types Email & Password ─────┐
│                                    │
│  [Login Page]                     │
│    ↓                              │
│  [React Form]                     │
│    ↓                              │
│  [axios POST to /auth/login]      │
│    ↓                              │
├──────────────────────────────────┤
                                    │
    [Local Network]                │
    Port 3001                       │
                                    │
├──────────────────────────────────┤
│                                  │
│  [API Gateway]                   │
│    ↓                             │
│  [Lambda Function: login.handler]│
│    ↓                             │
│  [Cognito Auth Check]            │
│    ↓                             │
│  [DynamoDB Lookup]               │
│    ↓                             │
│  [Generate JWT Token]            │
│    ↓                             │
├──────────────────────────────────┤
                                   │
    [Response with Token]         │
    Port 3000                      │
                                   │
├──────────────────────────────────┤
│                                 │
│  [Save to localStorage]         │
│  [Redirect to /dashboard]       │
│  ✅ Logged In!                  │
│                                 │
└─────────────────────────────────┘
```


## Database Schema (In-Memory)

### Users Table
```
{
  id: "user-123",
  email: "user@example.com",
  name: "John Doe",
  createdAt: "2024-12-15T10:30:00Z",
  password: "hashed_password"
}
```

### Invoices Table
```
{
  id: "inv-456",
  userId: "user-123",
  clientName: "Acme Corp",
  amount: 2500.00,
  tax: 250.00,
  total: 2750.00,
  status: "draft" | "generated" | "sent" | "paid",
  dueDate: "2024-12-31",
  items: [
    {
      description: "Web Development",
      quantity: 10,
      rate: 150,
      amount: 1500
    }
  ],
  createdAt: "2024-12-15T10:30:00Z",
  updatedAt: "2024-12-15T10:30:00Z"
}
```

### S3 Bucket (PDF Storage)
```
invoices/
├── user-123/
│   ├── inv-456.pdf
│   ├── inv-457.pdf
│   └── inv-458.pdf
└── user-124/
    └── inv-459.pdf
```


## Environment Variables

### Backend (.env.local)
```
AWS_ACCESS_KEY_ID=test              # Dummy for offline
AWS_SECRET_ACCESS_KEY=test          # Dummy for offline
USER_POOL_ID=us-east-1_XXXXXXXXX    # Dummy for local
USER_POOL_CLIENT_ID=xxxxx           # Dummy for local
API_URL=http://localhost:3001
FRONTEND_URL=http://localhost:3000
```

### Frontend (.env.local)
```
NEXT_PUBLIC_API_URL=http://localhost:3001
NEXT_PUBLIC_APP_NAME=InvoiceGen
NEXT_PUBLIC_APP_URL=http://localhost:3000
```


## Network & Ports

```
┌───────────────────────────────────────┐
│  Your Computer                        │
├───────────────────────────────────────┤
│                                       │
│  Port 3000: Next.js Frontend         │
│  └─ http://localhost:3000            │
│                                       │
│  Port 3001: Serverless API           │
│  └─ http://localhost:3001            │
│                                       │
│  Port 3306: MySQL (if using local DB)│
│  └─ Optional: mysql://localhost:3306 │
│                                       │
│  Ports 8000-8999: Reserved           │
│  └─ DynamoDB Local (if installed)    │
│                                       │
└───────────────────────────────────────┘
```


## What's Different in Production

```
LOCAL DEVELOPMENT              PRODUCTION (AWS)
═══════════════════════════════════════════════════════
localhost:3000                 CloudFront + S3 (Static)
Next.js Dev Server             CloudFront (CDN)

localhost:3001                 API Gateway
Serverless Offline             AWS Lambda

In-Memory Database             DynamoDB (AWS)
In-Memory S3                   S3 (AWS)
Mocked SES                     SES (AWS - Real Email)
Mocked Cognito                 Cognito (AWS - Real Auth)

No Authentication              AWS Credentials Required
No Deployment Steps            Serverless Deploy Needed
Data Lost on Restart           Data Persisted
```

---

**You're ready! Run `npm run dev` to start developing.** 🚀
