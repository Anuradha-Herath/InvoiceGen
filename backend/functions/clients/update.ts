import { APIGatewayProxyHandler } from 'aws-lambda';
import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient, UpdateCommand } from '@aws-sdk/lib-dynamodb';
import { errorResponse, successResponse } from '@/libs/response';
import { getUserIdFromEvent } from '@/libs/auth';
import { UpdateClientRequest } from '@/models/client';
import Joi from 'joi';

const dynamoClient = DynamoDBDocumentClient.from(new DynamoDBClient({ region: process.env.REGION }));

const updateClientSchema = Joi.object({
  name: Joi.string().optional().min(1).max(200),
  email: Joi.string().email().optional(),
  phone: Joi.string().optional().max(50),
  company: Joi.string().optional().max(200),
  address: Joi.string().optional().max(500),
}).min(1);

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

    const body: UpdateClientRequest = JSON.parse(event.body || '{}');
    
    const { error, value } = updateClientSchema.validate(body, { abortEarly: false });
    if (error) {
      return errorResponse(400, error.details[0].message);
    }

    // Filter out empty strings to avoid updating with empty values
    const filteredValue: any = {};
    Object.entries(value).forEach(([key, val]) => {
      if (val !== '') {
        filteredValue[key] = val;
      }
    });

    if (Object.keys(filteredValue).length === 0) {
      return errorResponse(400, 'At least one field must be provided for update');
    }

    const now = new Date().toISOString();
    const updateExpression = Object.keys(filteredValue)
      .map((key) => `${key} = :${key}`)
      .join(', ');

    const expressionAttributeValues: any = {
      ':updatedAt': now,
    };

    Object.entries(filteredValue).forEach(([key, val]) => {
      expressionAttributeValues[`:${key}`] = val;
    });

    const command = new UpdateCommand({
      TableName: process.env.CLIENTS_TABLE,
      Key: {
        userId,
        id: clientId,
      },
      UpdateExpression: `SET ${updateExpression}, updatedAt = :updatedAt`,
      ExpressionAttributeValues: expressionAttributeValues,
      ReturnValues: 'ALL_NEW',
    });

    const result = await dynamoClient.send(command);

    return successResponse(result.Attributes);
  } catch (error: any) {
    console.error('Update client error:', error);
    return errorResponse(500, error.message || 'Failed to update client');
  }
};
