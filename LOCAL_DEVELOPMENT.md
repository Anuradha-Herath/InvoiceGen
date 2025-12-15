# Local Development Setup Guide

## Overview
Your Invoice Generator SaaS application consists of:
- **Backend**: AWS Lambda functions using Serverless Framework with `serverless-offline` for local development
- **Frontend**: Next.js application running on port 3000
- **API**: Runs on port 3001 via serverless-offline

## Quick Start

### Prerequisites
- Node.js >= 18.0.0
- npm >= 9.0.0

### Installation
```bash
# Install all dependencies (frontend and backend)
npm run install:all
```

### Running Development Environment

#### Option 1: Run Both Frontend and Backend Together (Recommended)
```bash
npm run dev
```
This command runs:
- **Backend** (Serverless Offline): http://localhost:3001
- **Frontend** (Next.js): http://localhost:3000

#### Option 2: Run Separately
```bash
# Terminal 1 - Backend
npm run dev:backend

# Terminal 2 - Frontend
npm run dev:frontend
```

## API Endpoints (Running Locally)

When using `serverless-offline`, your API endpoints are:
- `POST http://localhost:3001/auth/signup` - User registration
- `POST http://localhost:3001/auth/login` - User login
- `POST http://localhost:3001/invoices` - Create invoice
- `GET http://localhost:3001/invoices` - List invoices
- `GET http://localhost:3001/invoices/{id}` - Get invoice
- `PUT http://localhost:3001/invoices/{id}` - Update invoice
- `DELETE http://localhost:3001/invoices/{id}` - Delete invoice
- `POST http://localhost:3001/invoices/{id}/pdf` - Generate PDF
- `POST http://localhost:3001/invoices/{id}/email` - Send invoice via email

## Environment Variables

### Backend (.env.local)
Located in `/backend/.env.local`
```
AWS_ACCESS_KEY_ID=test
AWS_SECRET_ACCESS_KEY=test
USER_POOL_ID=us-east-1_XXXXXXXXX
USER_POOL_CLIENT_ID=xxxxxxxxxxxxxxxxxxxxxxxxxx
API_URL=http://localhost:3001
FRONTEND_URL=http://localhost:3000
```

### Frontend (.env.local)
Located in `/frontend/.env.local`
```
NEXT_PUBLIC_API_URL=http://localhost:3001
```

## Key Features

### Serverless Offline
- Emulates AWS Lambda and API Gateway locally
- No AWS credentials needed for local development
- Supports CORS for frontend requests
- DynamoDB, S3, and SES operations are mocked

### Cognito Authentication (Local)
- During local development, Cognito is emulated
- You can still test authentication flows
- Tokens are validated locally

## Troubleshooting

### Backend Connection Refused
**Problem**: `ERR_CONNECTION_REFUSED` when accessing API
**Solution**: Make sure backend is running with `npm run dev:backend`

### Port Already in Use
**Problem**: `EADDRINUSE: address already in use :::3000` or `:::3001`
**Solution**: 
```bash
# Kill process on port 3001 (Windows)
netstat -ano | findstr :3001
taskkill /PID <PID> /F

# Or change port in serverless.yml (httpPort) or next.config.js
```

### Authentication Issues
**Problem**: Getting 401 Unauthorized errors
**Solution**: 
- Check that authentication tokens are being stored in localStorage
- Verify the backend is running and returning valid tokens
- Check browser DevTools Console for specific error messages

### DynamoDB/Database Issues
**Problem**: Cannot save/retrieve data
**Solution**:
- `serverless-offline` uses in-memory storage by default
- Data is lost when server restarts
- For persistent local database, install DynamoDB Local (optional)

## Deployment

### Deploy Backend to AWS
```bash
# Requires AWS credentials and configuration
npm run deploy:backend
```

### Build Frontend for Production
```bash
npm run build:frontend
```

## Development Workflow

1. **Start Development Environment**
   ```bash
   npm run dev
   ```

2. **Frontend** opens at: `http://localhost:3000`

3. **Make Changes**
   - Backend changes auto-reload via nodemon
   - Frontend changes auto-reload via Next.js

4. **Test API**
   - Use Postman, Insomnia, or curl
   - API base URL: `http://localhost:3001`

5. **Check Logs**
   - Backend logs appear in terminal 1
   - Frontend logs appear in terminal 2

## Next Steps

1. ✅ Run `npm run install:all`
2. ✅ Run `npm run dev`
3. ✅ Visit `http://localhost:3000`
4. ✅ Create an account and test the application
5. ✅ Check console/DevTools for any errors

## Documentation
- [Serverless Framework](https://www.serverless.com/)
- [Serverless Offline Plugin](https://github.com/dherault/serverless-offline)
- [Next.js Documentation](https://nextjs.org/docs)
- [AWS Lambda Basics](https://docs.aws.amazon.com/lambda/)
