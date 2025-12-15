# Deployment Guide

## Backend Deployment (AWS Lambda)

### Prerequisites
- AWS CLI configured with credentials
- Serverless Framework installed globally (optional)

### Deploy to Development

```bash
cd backend
npm run deploy
```

### Deploy to Production

```bash
cd backend
npm run deploy -- --stage production --region us-east-1
```

### Post-Deployment

After deployment, you'll receive outputs including:
- API Gateway endpoint
- Cognito User Pool ID
- Cognito Client ID
- S3 Bucket name

Save these values and update your environment files.

### Verify Deployment

```bash
# Test the API
curl https://your-api-gateway-url/dev/invoices

# View function logs
serverless logs -f createInvoice --tail
```

## Frontend Deployment

### Option 1: Vercel (Recommended)

1. Install Vercel CLI:
```bash
npm install -g vercel
```

2. Deploy:
```bash
cd frontend
vercel
```

3. Configure environment variables in Vercel dashboard

### Option 2: AWS Amplify

1. Push code to GitHub repository
2. Go to AWS Amplify Console
3. Connect your repository
4. Configure build settings:
   - Build command: `npm run build`
   - Output directory: `.next`
5. Add environment variables
6. Deploy

### Option 3: Docker + ECS/Fargate

1. Create Dockerfile in frontend:
```dockerfile
FROM node:18-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM node:18-alpine AS runner
WORKDIR /app
ENV NODE_ENV production
COPY --from=builder /app/next.config.js ./
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./package.json

EXPOSE 3000
CMD ["npm", "start"]
```

2. Build and push:
```bash
docker build -t invoice-frontend .
docker tag invoice-frontend:latest your-ecr-repo/invoice-frontend:latest
docker push your-ecr-repo/invoice-frontend:latest
```

3. Deploy to ECS/Fargate

## Environment Variables

### Backend (.env.local)
```
AWS_REGION=us-east-1
USER_POOL_ID=us-east-1_xxxxxxxxx
USER_POOL_CLIENT_ID=xxxxxxxxxxxxxxxxxx
SES_FROM_EMAIL=noreply@yourdomain.com
STAGE=production
```

### Frontend (.env.local)
```
NEXT_PUBLIC_API_URL=https://api-id.execute-api.us-east-1.amazonaws.com/production
NEXT_PUBLIC_USER_POOL_ID=us-east-1_xxxxxxxxx
NEXT_PUBLIC_USER_POOL_CLIENT_ID=xxxxxxxxxxxxxxxxxx
NEXT_PUBLIC_AWS_REGION=us-east-1
```

## Domain Configuration

### API Gateway Custom Domain

1. Register domain in Route53 or your DNS provider
2. Request SSL certificate in ACM
3. Create custom domain in API Gateway
4. Map to your API
5. Update DNS records

### Frontend Custom Domain

For Vercel:
```bash
vercel domains add yourdomain.com
```

For Amplify:
1. Go to Domain Management
2. Add custom domain
3. Configure DNS

## Monitoring

### Backend Monitoring

Enable CloudWatch logs and metrics:

```yaml
# In serverless.yml
provider:
  logs:
    restApi: true
  tracing:
    lambda: true
    apiGateway: true
```

### Set Up Alarms

```bash
# Create CloudWatch alarm for errors
aws cloudwatch put-metric-alarm \
  --alarm-name invoice-api-errors \
  --alarm-description "Alert on API errors" \
  --metric-name Errors \
  --namespace AWS/Lambda \
  --statistic Sum \
  --period 300 \
  --threshold 10 \
  --comparison-operator GreaterThanThreshold
```

## CI/CD Pipeline

### GitHub Actions Example

Create `.github/workflows/deploy.yml`:

```yaml
name: Deploy

on:
  push:
    branches: [main]

jobs:
  deploy-backend:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - uses: actions/setup-node@v2
        with:
          node-version: '18'
      - name: Install dependencies
        run: cd backend && npm ci
      - name: Deploy to AWS
        run: cd backend && npx serverless deploy --stage production
        env:
          AWS_ACCESS_KEY_ID: ${{ secrets.AWS_ACCESS_KEY_ID }}
          AWS_SECRET_ACCESS_KEY: ${{ secrets.AWS_SECRET_ACCESS_KEY }}

  deploy-frontend:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - name: Deploy to Vercel
        uses: amondnet/vercel-action@v20
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.VERCEL_ORG_ID }}
          vercel-project-id: ${{ secrets.VERCEL_PROJECT_ID }}
```

## Rollback

### Backend Rollback

```bash
# List deployments
serverless deploy list

# Rollback to timestamp
serverless rollback --timestamp 1234567890
```

### Frontend Rollback

For Vercel:
```bash
vercel rollback
```

## Security Checklist

- [ ] Environment variables secured
- [ ] API Gateway throttling enabled
- [ ] Cognito password policy enforced
- [ ] S3 bucket not publicly accessible
- [ ] CloudWatch logs enabled
- [ ] SSL/TLS certificates valid
- [ ] CORS configured for production domains only
- [ ] IAM roles follow least privilege
- [ ] SES out of sandbox mode (if needed)
- [ ] Rate limiting implemented

## Performance Optimization

### Backend
- Configure Lambda reserved concurrency
- Enable API Gateway caching
- Optimize Lambda memory allocation
- Use DynamoDB provisioned capacity for predictable workloads

### Frontend
- Enable Next.js caching
- Configure CDN (CloudFront/Vercel Edge)
- Optimize images with Next.js Image component
- Enable compression

## Backup and Disaster Recovery

### DynamoDB Backup

Enable point-in-time recovery:

```bash
aws dynamodb update-continuous-backups \
  --table-name invoice-generator-api-invoices-production \
  --point-in-time-recovery-specification PointInTimeRecoveryEnabled=true
```

### S3 Versioning

Enable versioning for PDF bucket:

```bash
aws s3api put-bucket-versioning \
  --bucket invoice-generator-pdfs-production \
  --versioning-configuration Status=Enabled
```

## Cost Optimization

1. Enable DynamoDB on-demand billing for unpredictable traffic
2. Use S3 Intelligent-Tiering for PDFs
3. Set Lambda timeout appropriately (not too high)
4. Enable API Gateway caching to reduce Lambda invocations
5. Use CloudWatch Logs retention policies
6. Delete old S3 PDFs with lifecycle policies

## Troubleshooting Deployment

### Common Issues

**Issue**: Serverless deploy fails with permissions error
**Solution**: Verify IAM user has required permissions

**Issue**: Frontend can't connect to API
**Solution**: Check CORS configuration and API Gateway URL

**Issue**: PDF generation fails
**Solution**: Increase Lambda memory and timeout, check Chrome layer

**Issue**: Email sending fails
**Solution**: Verify SES email, check if out of sandbox mode

## Support

For deployment issues, check:
1. CloudWatch Logs
2. Serverless Framework documentation
3. AWS documentation
4. GitHub Issues
