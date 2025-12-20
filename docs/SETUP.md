# Invoice Generator - Setup Guide

## Prerequisites

Before getting started, ensure you have:

1. **Node.js** (v18 or higher) and **npm** installed
2. **AWS Account** with appropriate permissions
3. **AWS CLI** configured with credentials
4. **Serverless Framework** knowledge (optional but helpful)

## Project Structure

```
invoice-generator-saas/
├── backend/                      # Serverless backend (AWS Lambda)
│   ├── functions/               # Lambda function handlers
│   │   ├── auth/               # Authentication functions
│   │   │   ├── signup.ts
│   │   │   └── login.ts
│   │   ├── invoices/           # Invoice CRUD operations
│   │   │   ├── create.ts
│   │   │   ├── get.ts
│   │   │   ├── list.ts
│   │   │   ├── update.ts
│   │   │   └── delete.ts
│   │   ├── pdf/                # PDF generation
│   │   │   └── generate.ts
│   │   └── email/              # Email functionality
│   │       └── send.ts
│   ├── libs/                    # Shared utilities
│   │   ├── response.ts         # API response helpers
│   │   ├── auth.ts             # Auth helpers
│   │   ├── validation.ts       # Data validation
│   │   └── pdfTemplate.ts      # PDF HTML template
│   ├── models/                  # TypeScript types
│   │   ├── auth.ts
│   │   ├── invoice.ts
│   │   ├── email.ts
│   │   └── response.ts
│   ├── serverless.yml           # Serverless Framework config
│   ├── package.json
│   └── tsconfig.json
│
├── frontend/                     # Next.js frontend
│   ├── src/
│   │   ├── app/                # Next.js App Router
│   │   │   ├── auth/          # Auth pages (login/signup)
│   │   │   ├── dashboard/     # Dashboard pages
│   │   │   ├── layout.tsx
│   │   │   ├── page.tsx
│   │   │   └── globals.css
│   │   ├── components/        # React components (to be added)
│   │   ├── services/          # API client services
│   │   │   ├── api.ts
│   │   │   ├── auth.ts
│   │   │   └── invoice.ts
│   │   ├── store/             # Zustand state management
│   │   │   ├── authStore.ts
│   │   │   └── invoiceStore.ts
│   │   └── types/             # TypeScript types
│   │       ├── auth.ts
│   │       └── invoice.ts
│   ├── package.json
│   ├── tsconfig.json
│   ├── next.config.js
│   └── tailwind.config.js
│
├── infrastructure/              # Shared configuration
│   └── config.yml
│
├── package.json                 # Root package.json (npm workspaces)
├── .gitignore
└── README.md
```

## Installation Steps

### 1. Install Dependencies

From the root directory:

```bash
npm run install:all
```

This will install dependencies for both backend and frontend using npm workspaces.

### 2. Configure AWS Credentials

Ensure your AWS CLI is configured:

```bash
aws configure
```

Provide your AWS Access Key ID, Secret Access Key, and default region.

### 3. Configure Backend Environment

```bash
cd backend
cp .env.example .env.local
```

Edit `backend/.env.local` and configure:
- `AWS_REGION`: Your AWS region (e.g., us-east-1)
- `SES_FROM_EMAIL`: Verified email address in AWS SES

Note: `USER_POOL_ID` and `USER_POOL_CLIENT_ID` will be generated after deployment.

### 4. Deploy Backend to AWS

```bash
cd backend
npm run deploy
```

This will:
- Create AWS Lambda functions
- Set up API Gateway
- Create DynamoDB tables
- Create S3 bucket for PDFs
- Set up Cognito User Pool
- Configure SES for email

**Important**: After deployment, note the outputs:
- API Gateway endpoint URL
- Cognito User Pool ID
- Cognito User Pool Client ID
- S3 Bucket name

Update `backend/.env.local` with the Cognito values.

### 5. Configure SES Email

To send emails, you need to verify your email address in AWS SES:

```bash
aws ses verify-email-identity --email-address your-email@example.com --region us-east-1
```

Check your email and click the verification link.

**Note**: By default, SES is in sandbox mode. To send to any email:
1. Go to AWS SES Console
2. Request production access
3. Wait for approval (usually 24 hours)

### 6. Configure Frontend Environment

```bash
cd ../frontend
cp .env.example .env.local
```

Edit `frontend/.env.local` with values from backend deployment:

```env
NEXT_PUBLIC_API_URL=https://your-api-id.execute-api.us-east-1.amazonaws.com/dev
NEXT_PUBLIC_USER_POOL_ID=us-east-1_xxxxxxxxx
NEXT_PUBLIC_USER_POOL_CLIENT_ID=xxxxxxxxxxxxxxxxxxxxxxxxxx
NEXT_PUBLIC_AWS_REGION=us-east-1
```

### 7. Run Frontend Locally

```bash
cd frontend
npm run dev
```

Visit `http://localhost:3000` in your browser.

## Development Workflow

### Backend Development

Run backend locally with Serverless Offline:

```bash
cd backend
npm run dev
```

This starts a local API at `http://localhost:3001`

### Frontend Development

```bash
cd frontend
npm run dev
```

Frontend runs at `http://localhost:3000`

## Deployment

### Deploy Backend Changes

```bash
cd backend
npm run deploy -- --stage production
```

### Deploy Frontend

For production, you can deploy the frontend to:

#### Option 1: Vercel (Recommended for Next.js)

```bash
npm install -g vercel
cd frontend
vercel
```

#### Option 2: AWS Amplify

1. Push code to GitHub
2. Connect repository to AWS Amplify
3. Configure build settings
4. Deploy

#### Option 3: Build and Deploy to S3/CloudFront

```bash
cd frontend
npm run build
# Upload the 'out' folder to S3 and configure CloudFront
```

## Key Features Implemented

### Backend (AWS Lambda + Serverless)
- ✅ User authentication with Cognito
- ✅ Invoice CRUD operations
- ✅ PDF generation with Puppeteer
- ✅ Email sending with SES
- ✅ DynamoDB data storage
- ✅ S3 PDF storage
- ✅ API Gateway REST API
- ✅ TypeScript for type safety

### Frontend (Next.js)
- ✅ User authentication (login/signup)
- ✅ Dashboard with invoice list
- ✅ Responsive design with Tailwind CSS
- ✅ State management with Zustand
- ✅ Form validation with React Hook Form
- ✅ Toast notifications
- ✅ TypeScript for type safety

## Next Steps (To Be Implemented)

1. **Invoice Creation Form** - Create new invoice page with item management
2. **Invoice Detail View** - View/edit individual invoice
3. **PDF Preview** - Preview invoice before generating PDF
4. **Email Dialog** - Send invoice via email with custom message
5. **User Profile** - Manage user settings and company info
6. **Invoice Templates** - Multiple PDF templates to choose from
7. **Payment Integration** - Stripe/PayPal integration for online payments
8. **Reports & Analytics** - Dashboard with charts and statistics

## Testing

### Backend Tests

```bash
cd backend
npm test
```

### Frontend Tests

```bash
cd frontend
npm test
```

## Troubleshooting

### Common Issues

1. **Deployment fails**: Check AWS credentials and permissions
2. **Cognito errors**: Ensure User Pool and Client IDs are correct
3. **SES email fails**: Verify email address in SES console
4. **PDF generation fails**: Check Lambda memory and timeout settings
5. **CORS errors**: Verify API Gateway CORS configuration

### Useful Commands

```bash
# View Lambda logs
cd backend
npm run logs -- -f functionName

# Remove all AWS resources
cd backend
npm run remove

# Check Serverless info
serverless info
```

## Cost Estimation

With AWS Free Tier:
- **Lambda**: 1M requests/month free
- **DynamoDB**: 25GB storage free
- **S3**: 5GB storage free
- **API Gateway**: 1M requests/month free (12 months)
- **Cognito**: 50,000 MAUs free
- **SES**: 62,000 emails/month free (when sent from EC2)

Expected cost for moderate usage: **$5-20/month** beyond free tier.

## Security Best Practices

1. ✅ Use environment variables for sensitive data
2. ✅ Enable CORS only for trusted domains in production
3. ✅ Use Cognito for authentication
4. ✅ Implement input validation
5. ✅ Use HTTPS for all API calls
6. ⚠️ TODO: Implement rate limiting
7. ⚠️ TODO: Add request logging and monitoring
8. ⚠️ TODO: Set up CloudWatch alarms

## Support

For issues or questions:
1. Check the documentation
2. Review AWS CloudWatch logs
3. Check Serverless Framework documentation
4. Review Next.js documentation

## License

MIT
