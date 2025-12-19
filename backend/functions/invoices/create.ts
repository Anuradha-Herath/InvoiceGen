import { APIGatewayProxyHandler } from 'aws-lambda';
import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient, PutCommand } from '@aws-sdk/lib-dynamodb';
import { v4 as uuidv4 } from 'uuid';
import { errorResponse, successResponse } from '@/libs/response';
import { getUserIdFromEvent } from '@/libs/auth';
import { CreateInvoiceRequest } from '@/models/invoice';
import { validateAndNormalizeInvoice } from '@/libs/validation';

const dynamoClient = DynamoDBDocumentClient.from(new DynamoDBClient({ region: process.env.REGION }));

export const handler: APIGatewayProxyHandler = async (event) => {
  try {
    const userId = getUserIdFromEvent(event);
    if (!userId) {
      return errorResponse(401, 'Unauthorized');
    }

    const body: CreateInvoiceRequest = JSON.parse(event.body || '{}');
    
    // Validate invoice data and calculations
    const validation = validateAndNormalizeInvoice(body);
    if (!validation.isValid) {
      return errorResponse(400, validation.errors?.join('; ') || 'Validation failed');
    }

    const invoiceId = uuidv4();
    const now = new Date().toISOString();

    const invoice = {
      id: invoiceId,
      userId,
      ...validation.data,
      status: 'draft',
      pdfUrl: null,
      createdAt: now,
      updatedAt: now,
    };

    const command = new PutCommand({
      TableName: process.env.INVOICES_TABLE,
      Item: invoice,
    });

    await dynamoClient.send(command);

    return successResponse(invoice, 201);
  } catch (error: any) {
    console.error('Create invoice error:', error);
    return errorResponse(500, error.message || 'Failed to create invoice');
  }
};
