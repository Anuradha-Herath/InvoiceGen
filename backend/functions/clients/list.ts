import { APIGatewayProxyHandler } from 'aws-lambda';
import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient, QueryCommand } from '@aws-sdk/lib-dynamodb';
import { errorResponse, successResponse } from '@/libs/response';
import { getUserIdFromEvent } from '@/libs/auth';
import { validatePaginationParams, encodePaginationKey } from '@/libs/pagination';

const dynamoClient = DynamoDBDocumentClient.from(new DynamoDBClient({ region: process.env.REGION }));

export const handler: APIGatewayProxyHandler = async (event) => {
  try {
    const userId = getUserIdFromEvent(event);
    if (!userId) {
      return errorResponse(401, 'Unauthorized');
    }

    const { limit, lastKey } = validatePaginationParams(
      event.queryStringParameters?.limit,
      event.queryStringParameters?.lastKey
    );

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

    const response: any = {
      items: result.Items || [],
      count: result.Count || 0,
    };

    // Include encoded lastKey if more items exist
    if (result.LastEvaluatedKey) {
      response.lastKey = encodePaginationKey(result.LastEvaluatedKey);
    }

    return successResponse(response);
  } catch (error: any) {
    console.error('List clients error:', error);
    return errorResponse(500, error.message || 'Failed to list clients');
  }
};
