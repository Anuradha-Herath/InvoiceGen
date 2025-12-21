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
│   │   ├── auth/
│   │   ├── clients/
│   │   ├── email/
│   │   ├── invoices/
│   │   ├── pdf/
│   │   └── settings/
│   ├── libs/               # Shared libraries
│   ├── models/             # TypeScript types/interfaces
│   └── serverless.yml      # Serverless Framework config
├── frontend/               # Next.js application
│   ├── src/
│   │   ├── app/           # App router pages
│   │   ├── components/    # React components
│   │   ├── services/      # API services
│   │   └── store/         # State management
│   └── package.json
├── docs/                   # Project documentation
└── package.json            # Root configuration
```

## Documentation

Detailed documentation is available in the `docs/` directory:

- [Implementation Summary](docs/IMPLEMENTATION_SUMMARY.md) - Overview of the implemented features and architecture.
- [Setup Guide](docs/SETUP.md) - Detailed instructions for setting up the development environment.
- [API Reference](docs/API_REFERENCE.md) - Documentation for the backend API endpoints.
- [Deployment Guide](docs/DEPLOYMENT.md) - Instructions for deploying the application to AWS.
- [Design Decisions](docs/DESIGN_DECISIONS.md) - Explanation of architectural choices and trade-offs.
- [Integration Checklist](docs/INTEGRATION_CHECKLIST.md) - Checklist for ensuring all components work together.

## Prerequisites

- Node.js >= 18.0.0
- npm >= 9.0.0
- AWS CLI configured with credentials
- AWS account with appropriate permissions

## Getting Started

### 1. Install Dependencies

```bash
# Backend
cd backend
npm install

# Frontend
cd ../frontend
npm install
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
cd backend
npm run deploy
```

### 4. Run Frontend Locally

```bash
cd frontend
npm run dev
```

## Development

### Backend Development

```bash
cd backend
npm run dev
```

### Frontend Development

```bash
cd frontend
npm run dev
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
- ✅ Client management
- ✅ Generate PDF invoices
- ✅ Email invoices to clients
- ✅ Invoice history dashboard
- ✅ Settings and profile management
- ✅ Responsive design

## License

MIT
