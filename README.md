# Invoice Generator SaaS

A serverless invoice management application built with AWS services and Next.js.

## Architecture

- **Frontend**: Next.js 14 with TypeScript, React, and Tailwind CSS
- **Backend**: AWS Lambda functions with TypeScript
- **Database**: DynamoDB for invoice and user data storage
- **Storage**: S3 for PDF invoice storage
- **Email**: SES for sending invoices to clients
- **Authentication**: AWS Cognito for user management
- **API**: API Gateway for REST endpoints
- **Infrastructure**: Serverless Framework

## Project Structure

```
invoice-generator-saas/
├── backend/                 # Serverless backend
│   ├── functions/          # Lambda function handlers
│   ├── libs/               # Shared libraries
│   ├── models/             # TypeScript types/interfaces
│   └── serverless.yml      # Serverless Framework config
├── frontend/               # Next.js application
│   └── src/               # Source code
└── infrastructure/         # Shared configuration
```

## Prerequisites

- Node.js >= 18.0.0
- npm >= 9.0.0
- AWS CLI configured with credentials
- AWS account with appropriate permissions

## Getting Started

### 1. Install Dependencies

```bash
npm run install:all
```

### 2. Configure Environment Variables

Copy the example environment files and fill in your AWS credentials:

```bash
# Backend
cp backend/.env.example backend/.env.local

# Frontend
cp frontend/.env.example frontend/.env.local
```

### 3. Deploy Backend

```bash
npm run deploy:backend
```

### 4. Run Frontend Locally

```bash
npm run dev:frontend
```

## Development

### Backend Development

```bash
npm run dev:backend
```

### Frontend Development

```bash
npm run dev:frontend
```

## Deployment

### Deploy Backend to AWS

```bash
cd backend
npm run deploy -- --stage production
```

### Deploy Frontend

```bash
cd frontend
npm run build
# Deploy to your hosting service (Vercel, Netlify, AWS Amplify, etc.)
```

## Features

- ✅ User authentication with AWS Cognito
- ✅ Create and manage invoices
- ✅ Generate PDF invoices
- ✅ Email invoices to clients
- ✅ Invoice history dashboard
- ✅ Responsive design

## License

MIT
