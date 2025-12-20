import { APIGatewayProxyHandler } from 'aws-lambda';
import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient, UpdateCommand } from '@aws-sdk/lib-dynamodb';
import { errorResponse, successResponse } from '@/libs/response';
import { getUserIdFromEvent } from '@/libs/auth';
import Joi from 'joi';

const dynamoClient = DynamoDBDocumentClient.from(new DynamoDBClient({ region: process.env.REGION }));

const statusSchema = Joi.object({
  status: Joi.string().required().valid('draft', 'generated', 'sent', 'paid'),
});

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

    const body = JSON.parse(event.body || '{}');
    
    const { error, value } = statusSchema.validate(body, { abortEarly: false });
    if (error) {
      return errorResponse(400, error.details[0].message);
    }

    const now = new Date().toISOString();

    const command = new UpdateCommand({
      TableName: process.env.INVOICES_TABLE,
      Key: {
        userId,
        id: invoiceId,
      },
      UpdateExpression: 'SET #status = :status, updatedAt = :updatedAt',
      ExpressionAttributeNames: {
        '#status': 'status',
      },
      ExpressionAttributeValues: {
        ':status': value.status,
        ':updatedAt': now,
      },
      ReturnValues: 'ALL_NEW',
    });

    const result = await dynamoClient.send(command);

    return successResponse(result.Attributes);
  } catch (error: any) {
    console.error('Update invoice status error:', error);
    return errorResponse(500, error.message || 'Failed to update invoice status');
  }
};
