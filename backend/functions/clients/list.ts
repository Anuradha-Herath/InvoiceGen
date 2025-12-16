import { APIGatewayProxyHandler } from 'aws-lambda';
import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient, QueryCommand } from '@aws-sdk/lib-dynamodb';
import { errorResponse, successResponse } from '@/libs/response';
import { getUserIdFromEvent } from '@/libs/auth';

const dynamoClient = DynamoDBDocumentClient.from(new DynamoDBClient({ region: process.env.REGION }));

export const handler: APIGatewayProxyHandler = async (event) => {
  try {
    const userId = getUserIdFromEvent(event);
    if (!userId) {
      return errorResponse(401, 'Unauthorized');
    }

    const limit = parseInt(event.queryStringParameters?.limit || '50', 10);
    const lastKey = event.queryStringParameters?.lastKey ? JSON.parse(event.queryStringParameters.lastKey) : undefined;

    const command = new QueryCommand({
      TableName: process.env.CLIENTS_TABLE,
      KeyConditionExpression: 'userId = :userId',
      ExpressionAttributeValues: {
        ':userId': userId,
      },
      Limit: limit,
      ExclusiveStartKey: lastKey,
      ScanIndexForward: false, // Most recent first
    });

    const result = await dynamoClient.send(command);

    return successResponse({
      items: result.Items || [],
      lastKey: result.LastEvaluatedKey,
      count: result.Count,
    });
  } catch (error: any) {
    console.error('List clients error:', error);
    return errorResponse(500, error.message || 'Failed to list clients');
  }
};
