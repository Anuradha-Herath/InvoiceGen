import { APIGatewayProxyHandler } from 'aws-lambda';
import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient, GetCommand, UpdateCommand } from '@aws-sdk/lib-dynamodb';
import { S3Client, PutObjectCommand, GetObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import chromium from '@sparticuz/chromium';
import puppeteer from 'puppeteer-core';
import { errorResponse, successResponse } from '@/libs/response';
import { getUserIdFromEvent } from '@/libs/auth';
import { generateInvoiceHTML } from '@/libs/pdfTemplate';
import { Invoice } from '@/models/invoice';

const dynamoClient = DynamoDBDocumentClient.from(new DynamoDBClient({ region: process.env.REGION }));
const s3Client = new S3Client({ region: process.env.REGION });

export const handler: APIGatewayProxyHandler = async (event) => {
  let browser = null;

  try {
    const userId = getUserIdFromEvent(event);
    if (!userId) {
      return errorResponse(401, 'Unauthorized');
    }

    const invoiceId = event.pathParameters?.invoiceId;
    if (!invoiceId) {
      return errorResponse(400, 'Invoice ID is required');
    }

    // Get invoice data
    const getCommand = new GetCommand({
      TableName: process.env.INVOICES_TABLE,
      Key: { id: invoiceId },
    });

    const result = await dynamoClient.send(getCommand);
    if (!result.Item) {
      return errorResponse(404, 'Invoice not found');
    }

    if (result.Item.userId !== userId) {
      return errorResponse(403, 'Access denied');
    }

    // Generate PDF using Puppeteer
    browser = await puppeteer.launch({
      args: chromium.args,
      defaultViewport: chromium.defaultViewport,
      executablePath: await chromium.executablePath(),
      headless: true,
    });

    const page = await browser.newPage();
    const html = generateInvoiceHTML(result.Item as unknown as Invoice);
    
    await page.setContent(html, { waitUntil: 'networkidle0' });
    const pdfBuffer = await page.pdf({
      format: 'A4',
      printBackground: true,
      margin: {
        top: '20px',
        right: '20px',
        bottom: '20px',
        left: '20px',
      },
    });

    await browser.close();
    browser = null;

    // Upload PDF to S3
    const s3Key = `${userId}/${invoiceId}.pdf`;
    const uploadCommand = new PutObjectCommand({
      Bucket: process.env.INVOICES_BUCKET,
      Key: s3Key,
      Body: pdfBuffer,
      ContentType: 'application/pdf',
    });

    await s3Client.send(uploadCommand);

    // Generate presigned URL valid for 24 hours
    const getObjectCommand = new GetObjectCommand({
      Bucket: process.env.INVOICES_BUCKET,
      Key: s3Key,
    });
    const pdfUrl = await getSignedUrl(s3Client, getObjectCommand, { expiresIn: 86400 });

    // Update invoice with PDF URL
    const updateCommand = new UpdateCommand({
      TableName: process.env.INVOICES_TABLE,
      Key: { id: invoiceId },
      UpdateExpression: 'SET pdfUrl = :pdfUrl, #status = :status, updatedAt = :updatedAt',
      ExpressionAttributeNames: {
        '#status': 'status',
      },
      ExpressionAttributeValues: {
        ':pdfUrl': pdfUrl,
        ':status': 'generated',
        ':updatedAt': new Date().toISOString(),
      },
      ReturnValues: 'ALL_NEW',
    });

    const updateResult = await dynamoClient.send(updateCommand);

    return successResponse({
      invoice: updateResult.Attributes,
      pdfUrl,
    });
  } catch (error: any) {
    console.error('Generate PDF error:', error);
    return errorResponse(500, error.message || 'Failed to generate PDF');
  } finally {
    if (browser) {
      await browser.close();
    }
  }
};
