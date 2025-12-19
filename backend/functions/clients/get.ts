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

    const clientId = event.pathParameters?.clientId;
    if (!clientId) {
      return errorResponse(400, 'Client ID is required');
    }

    const command = new GetCommand({
      TableName: process.env.CLIENTS_TABLE,
      Key: {
        userId,
        id: clientId,
      },
    });

    const result = await dynamoClient.send(command);

    if (!result.Item) {
      return errorResponse(404, 'Client not found');
    }

    return successResponse(result.Item);
  } catch (error: any) {
    console.error('Get client error:', error);
    return errorResponse(500, error.message || 'Failed to get client');
  }
};
