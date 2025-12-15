import { APIGatewayProxyHandler } from 'aws-lambda';
import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient, GetCommand } from '@aws-sdk/lib-dynamodb';
import { errorResponse, successResponse } from '@/libs/response';
import { getUserIdFromEvent } from '@/libs/auth';

const dynamoClient = DynamoDBDocumentClient.from(new DynamoDBClient({ region: process.env.REGION }));

export const handler: APIGatewayProxyHandler = async (event) => {
  try {
    const userId = getUserIdFromEvent(event);
    if (!userId) {
      return errorResponse(401, 'Unauthorized');
    }

    const invoiceId = event.pathParameters?.id;
    if (!invoiceId) {
      return errorResponse(400, 'Invoice ID is required');
    }

    const command = new GetCommand({
      TableName: process.env.INVOICES_TABLE,
      Key: { id: invoiceId },
    });

    const result = await dynamoClient.send(command);

    if (!result.Item) {
      return errorResponse(404, 'Invoice not found');
    }

    // Verify the invoice belongs to the user
    if (result.Item.userId !== userId) {
      return errorResponse(403, 'Access denied');
    }

    return successResponse(result.Item);
  } catch (error: any) {
    console.error('Get invoice error:', error);
    return errorResponse(500, error.message || 'Failed to retrieve invoice');
  }
};
