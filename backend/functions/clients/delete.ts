import { APIGatewayProxyHandler } from 'aws-lambda';
import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient, DeleteCommand } from '@aws-sdk/lib-dynamodb';
import { errorResponse, successResponse } from '@/libs/response';
import { getUserIdFromEvent } from '@/libs/auth';

const dynamoClient = DynamoDBDocumentClient.from(new DynamoDBClient({ region: process.env.REGION }));

export const handler: APIGatewayProxyHandler = async (event) => {
  try {
    const userId = getUserIdFromEvent(event);
    if (!userId) {
      return errorResponse(401, 'Unauthorized');
    }

    const clientId = event.pathParameters?.clientId;
    if (!clientId) {
      return errorResponse(400, 'Client ID is required');
    }

    const command = new DeleteCommand({
      TableName: process.env.CLIENTS_TABLE,
      Key: {
        userId,
        id: clientId,
      },
    });

    await dynamoClient.send(command);

    return successResponse({ message: 'Client deleted successfully' });
  } catch (error: any) {
    console.error('Delete client error:', error);
    return errorResponse(500, error.message || 'Failed to delete client');
  }
};
