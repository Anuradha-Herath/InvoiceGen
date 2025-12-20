import { APIGatewayProxyHandler } from 'aws-lambda';
import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient, GetCommand, UpdateCommand } from '@aws-sdk/lib-dynamodb';
import { errorResponse, successResponse } from '@/libs/response';
import { getUserIdFromEvent } from '@/libs/auth';
import { UpdateInvoiceRequest } from '@/models/invoice';

const dynamoClient = DynamoDBDocumentClient.from(new DynamoDBClient({ region: process.env.REGION }));

export const handler: APIGatewayProxyHandler = async (event) => {
  try {
    const userId = getUserIdFromEvent(event);
    if (!userId) {
      return errorResponse(401, 'Unauthorized');
    }

    const invoiceId = event.pathParameters?.invoiceId;
    if (!invoiceId) {
      return errorResponse(400, 'Invoice ID is required');
    }

    // Verify invoice exists and belongs to user
    const getCommand = new GetCommand({
      TableName: process.env.INVOICES_TABLE,
      Key: { id: invoiceId },
    });

    const existingInvoice = await dynamoClient.send(getCommand);
    if (!existingInvoice.Item) {
      return errorResponse(404, 'Invoice not found');
    }

    if (existingInvoice.Item.userId !== userId) {
      return errorResponse(403, 'Access denied');
    }

    const body: UpdateInvoiceRequest = JSON.parse(event.body || '{}');

    console.log('Update invoice request:', {
      invoiceId,
      userId,
      bodyKeys: Object.keys(body),
    });

    // Basic validation for update data
    if (body.items && (!Array.isArray(body.items) || body.items.length === 0)) {
      return errorResponse(400, 'Items must be a non-empty array');
    }

    if (body.items) {
      for (const item of body.items) {
        if (!item.description || item.quantity <= 0 || item.unitPrice < 0) {
          return errorResponse(400, 'Invalid item data: description required, quantity must be > 0, unitPrice must be >= 0');
        }
      }
    }

    if (body.client) {
      if (!body.client.name || !body.client.email) {
        return errorResponse(400, 'Client must have name and email');
      }
    }

    if (body.total !== undefined && body.total < 0) {
      return errorResponse(400, 'Total must be >= 0');
    }

    if (body.currency && body.currency.length !== 3) {
      return errorResponse(400, 'Currency must be a 3-letter code');
    }

    // Build update expression dynamically
    const updateExpressions: string[] = [];
    const expressionAttributeNames: Record<string, string> = {};
    const expressionAttributeValues: Record<string, any> = {};

    Object.entries(body).forEach(([key, value]) => {
      if (value !== undefined && key !== 'id' && key !== 'userId') {
        updateExpressions.push(`#${key} = :${key}`);
        expressionAttributeNames[`#${key}`] = key;
        expressionAttributeValues[`:${key}`] = value;
      }
    });

    updateExpressions.push('#updatedAt = :updatedAt');
    expressionAttributeNames['#updatedAt'] = 'updatedAt';
    expressionAttributeValues[':updatedAt'] = new Date().toISOString();

    const updateCommand = new UpdateCommand({
      TableName: process.env.INVOICES_TABLE,
      Key: { id: invoiceId },
      UpdateExpression: `SET ${updateExpressions.join(', ')}`,
      ExpressionAttributeNames: expressionAttributeNames,
      ExpressionAttributeValues: expressionAttributeValues,
      ReturnValues: 'ALL_NEW',
    });

    const result = await dynamoClient.send(updateCommand);

    return successResponse(result.Attributes);
  } catch (error: any) {
    console.error('Update invoice error:', error);
    return errorResponse(500, error.message || 'Failed to update invoice');
  }
};
