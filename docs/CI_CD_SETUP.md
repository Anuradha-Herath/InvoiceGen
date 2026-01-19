# CI/CD Pipeline Setup Guide

## Overview

This project uses **GitHub Actions** for continuous integration and deployment (CI/CD). The pipeline automatically deploys the Invoice Generator application to AWS (backend) and Vercel (frontend) whenever code is pushed to the `develop` or `main` branches.

## Pipeline Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    GitHub Actions Workflow                   │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│  1. Test Stage                                               │
│     ├── Backend Tests (npm test)                             │
│     ├── Frontend Type Check                                  │
│     └── Frontend Linting                                     │
│                                                               │
│  2. Deploy Backend (AWS Lambda + Serverless)                 │
│     ├── Build TypeScript                                     │
│     ├── Deploy to AWS                                        │
│     └── Extract CloudFormation Outputs                       │
│                                                               │
│  3. Deploy Frontend (Vercel)                                 │
│     ├── Inject Backend Outputs as Env Vars                   │
│     ├── Build Next.js App                                    │
│     └── Deploy to Vercel                                     │
│                                                               │
│  4. Notify (Success/Failure)                                 │
│     └── GitHub Step Summary                                  │
│                                                               │
└─────────────────────────────────────────────────────────────┘
```

## Workflows

### 1. Development Deployment (`deploy-dev.yml`)
- **Trigger:** Push to `develop` branch or manual dispatch
- **Backend Target:** AWS Stage `dev`
- **Frontend Target:** Vercel Preview Deployment
- **Purpose:** Continuous deployment for development/testing

### 2. Production Deployment (`deploy-production.yml`)
- **Trigger:** Push to `main` branch or manual dispatch (with confirmation)
- **Backend Target:** AWS Stage `production`
- **Frontend Target:** Vercel Production Deployment
- **Purpose:** Production releases
- **Safety:** Manual dispatch requires typing "deploy" to confirm

## Prerequisites

### 1. AWS Account Setup
- AWS Account with appropriate permissions
- IAM user with programmatic access
- Required AWS services: Lambda, API Gateway, DynamoDB, S3, Cognito, SES

### 2. Vercel Account Setup
- Vercel account (free tier works)
- Project created in Vercel dashboard

### 3. GitHub Repository Settings
- Repository with `develop` and `main` branches
- Branch protection rules (recommended)

## Required GitHub Secrets

Configure these secrets in **Settings → Secrets and variables → Actions → New repository secret**:

### AWS Credentials
```
AWS_ACCESS_KEY_ID          # IAM user access key ID
AWS_SECRET_ACCESS_KEY      # IAM user secret access key
AWS_ACCOUNT_ID             # 12-digit AWS account ID
SES_FROM_EMAIL             # Verified email for SES (e.g., noreply@yourdomain.com)
```

### Vercel Credentials
```
VERCEL_TOKEN               # Vercel authentication token
VERCEL_ORG_ID              # Vercel organization/team ID
VERCEL_PROJECT_ID          # Vercel project ID
```

## How to Get Vercel Credentials

### Get Vercel Token
1. Go to https://vercel.com/account/tokens
2. Click "Create Token"
3. Name it (e.g., "GitHub Actions")
4. Copy the token and add to GitHub Secrets

### Get Vercel Org ID and Project ID
Run these commands in your terminal:

```bash
# Install Vercel CLI
npm install -g vercel

# Login to Vercel
vercel login

# Link your project (run from frontend directory)
cd frontend
vercel link

# Get your IDs from .vercel/project.json
cat .vercel/project.json
```

The output will show:
```json
{
  "orgId": "team_xxxxxxxxxxxx",
  "projectId": "prj_xxxxxxxxxxxx"
}
```

## How to Get AWS Credentials

### Create IAM User
1. Go to AWS Console → IAM → Users
2. Click "Create User"
3. Username: `github-actions-deployer`
4. Enable "Access key - Programmatic access"
5. Attach policies:
   - `AWSLambda_FullAccess`
   - `IAMFullAccess`
   - `AmazonDynamoDBFullAccess`
   - `AmazonS3FullAccess`
   - `AmazonCognitoPowerUser`
   - `AmazonSESFullAccess`
   - `CloudFormationFullAccess`
   - `AmazonAPIGatewayAdministrator`
6. Save Access Key ID and Secret Access Key

### Get AWS Account ID
```bash
aws sts get-caller-identity --query Account --output text
```

## SES Email Setup (Important!)

AWS SES starts in **sandbox mode**, which limits email sending:

### Initial Setup (First Deployment)
1. Deploy backend first (the pipeline will create SES resources)
2. Go to AWS Console → SES → Verified identities
3. Verify your sender email (`SES_FROM_EMAIL`)
4. Click the verification link in your email inbox

### Production Usage
For production, request SES production access:
1. AWS Console → SES → Account dashboard
2. Click "Request production access"
3. Fill out the form (takes 24-48 hours for approval)

**Note:** Until production access is granted, you can only send emails to verified addresses.

## Environment Configuration

The pipeline automatically configures environment variables for both environments:

### Backend Environment Variables
- Managed by Serverless Framework in `serverless.yml`
- Deployed via CloudFormation
- Includes: `STAGE`, `AWS_REGION`, `SES_FROM_EMAIL`

### Frontend Environment Variables
- Injected during deployment from backend outputs
- Includes:
  ```
  NEXT_PUBLIC_API_URL              # From CloudFormation outputs
  NEXT_PUBLIC_USER_POOL_ID         # From CloudFormation outputs
  NEXT_PUBLIC_USER_POOL_CLIENT_ID  # From CloudFormation outputs
  NEXT_PUBLIC_AWS_REGION           # From workflow env
  ```

## Deployment Process

### Automatic Deployment (Recommended)

**For Development:**
```bash
git checkout develop
git add .
git commit -m "feat: add new feature"
git push origin develop
# Pipeline automatically deploys to dev environment
```

**For Production:**
```bash
git checkout main
git merge develop
git push origin main
# Pipeline automatically deploys to production
```

### Manual Deployment

1. Go to **Actions** tab in GitHub
2. Select workflow (`Deploy to Development` or `Deploy to Production`)
3. Click "Run workflow"
4. For production: Type "deploy" to confirm
5. Click "Run workflow" button

## Monitoring Deployments

### View Deployment Status
1. Go to **Actions** tab in GitHub repository
2. Click on the running/completed workflow
3. View logs for each job (Test, Deploy Backend, Deploy Frontend)

### Deployment Summary
After each deployment, check the **Summary** page for:
- API Gateway URL
- Cognito User Pool IDs
- Deployment URLs
- Rollback commands (if needed)

### View Application Logs
```bash
# Backend logs (Lambda)
serverless logs -f <function-name> --stage <dev|production>

# Or via AWS Console
# CloudWatch → Log groups → /aws/lambda/invoice-generator-<stage>-<function>

# Frontend logs (Vercel)
# Visit Vercel dashboard → Your project → Deployments → Logs
```

## Rollback Procedure

### Backend Rollback
If a backend deployment fails or causes issues:

```bash
# List available deployments
serverless deploy list --stage production

# Rollback to specific timestamp (provided in deployment summary)
serverless rollback -t <timestamp> --stage production

# Or rollback to previous deployment
serverless rollback --stage production
```

### Frontend Rollback
1. Go to Vercel dashboard
2. Navigate to Deployments
3. Find previous working deployment
4. Click "Promote to Production"

## Troubleshooting

### Common Issues

**1. AWS Credentials Invalid**
- Verify secrets are correctly set in GitHub
- Check IAM user has required permissions
- Ensure credentials haven't expired

**2. Serverless Deployment Fails**
- Check CloudFormation stack in AWS Console
- Review error logs in GitHub Actions
- Ensure AWS service limits aren't exceeded

**3. Vercel Deployment Fails**
- Verify Vercel token is valid
- Check project exists in Vercel dashboard
- Ensure Org ID and Project ID are correct

**4. Frontend Can't Connect to Backend**
- Verify API URL is correctly passed from backend deployment
- Check CORS settings in backend
- Ensure Cognito User Pool IDs are correct

**5. Email Sending Fails**
- Verify SES email address in AWS Console
- Check SES is out of sandbox mode (for production)
- Verify `SES_FROM_EMAIL` secret is set correctly

### Debug Steps
1. Check workflow logs in GitHub Actions
2. Review CloudFormation stack events in AWS Console
3. Check Lambda function logs in CloudWatch
4. Test API endpoints manually using Postman/curl
5. Verify environment variables in Vercel dashboard

## Cost Estimation

### AWS Costs (per month)
- Lambda: ~$0-5 (within free tier for low traffic)
- DynamoDB: ~$0-2 (within free tier)
- S3: ~$0-1 (minimal storage)
- API Gateway: ~$3.50 per million requests
- Cognito: Free tier: 50,000 MAUs
- SES: $0.10 per 1,000 emails
- **Estimated Total:** $5-20/month (beyond free tier)

### Vercel Costs
- Free tier: Sufficient for development
- Pro tier: $20/month (for production with custom domains)

### GitHub Actions
- 2,000 minutes/month free for public repos
- 3,000 minutes/month free for private repos (Pro account)
- Each deployment: ~5-10 minutes

## Security Best Practices

1. **Never commit secrets to repository**
2. **Use GitHub Environments** for additional protection
3. **Enable branch protection rules** on `main` branch
4. **Require pull request reviews** before merging
5. **Enable required status checks** for workflows
6. **Rotate AWS credentials** regularly
7. **Use least-privilege IAM policies**
8. **Enable AWS CloudTrail** for audit logging
9. **Review Vercel deployment logs** for suspicious activity
10. **Set up AWS Budget alerts** to avoid unexpected costs

## GitHub Environments Setup (Optional but Recommended)

Create protected environments for additional security:

1. Go to **Settings → Environments**
2. Create `development` environment:
   - No required reviewers
   - No wait timer
3. Create `production` environment:
   - **Required reviewers:** Add team members
   - **Wait timer:** 5 minutes (gives time to cancel)
   - **Deployment branches:** Only `main` branch

## Branch Protection Rules (Recommended)

Protect your `main` branch:

1. Go to **Settings → Branches → Add rule**
2. Branch name pattern: `main`
3. Enable:
   - ✅ Require a pull request before merging
   - ✅ Require approvals (at least 1)
   - ✅ Require status checks to pass before merging
   - ✅ Require branches to be up to date before merging
   - ✅ Include administrators

## Pipeline Customization

### Add Slack Notifications
Add this step to the `notify` job in both workflows:

```yaml
- name: Send Slack notification
  uses: slackapi/slack-github-action@v1
  with:
    payload: |
      {
        "text": "Deployment ${{ job.status }}: ${{ github.repository }}"
      }
  env:
    SLACK_WEBHOOK_URL: ${{ secrets.SLACK_WEBHOOK_URL }}
```

### Add Custom Domain Support
Add DNS configuration step after Vercel deployment:

```yaml
- name: Configure custom domain
  run: |
    vercel domains add yourdomain.com --token=$VERCEL_TOKEN
    vercel alias set <deployment-url> yourdomain.com --token=$VERCEL_TOKEN
```

### Add Database Migrations
Add this step before backend deployment:

```yaml
- name: Run database migrations
  working-directory: ./backend
  run: |
    npm run migrate:up --stage production
```

## Next Steps

1. ✅ Configure all GitHub Secrets
2. ✅ Create and verify SES email address
3. ✅ Set up Vercel project
4. ✅ Test development deployment (push to `develop`)
5. ✅ Verify application works in dev environment
6. ✅ Set up branch protection rules
7. ✅ Create GitHub Environments (production)
8. ✅ Test production deployment (push to `main`)
9. ✅ Request SES production access (if needed)
10. ✅ Set up monitoring and alerting

## Support

For issues or questions:
1. Check workflow logs in GitHub Actions
2. Review this documentation
3. Check AWS CloudFormation events
4. Review Vercel deployment logs
5. Contact DevOps team or create an issue in the repository

---

**Last Updated:** January 19, 2026
**Pipeline Version:** 1.0
**Maintained by:** DevOps Team
