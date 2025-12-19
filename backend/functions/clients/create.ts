import { APIGatewayProxyHandler } from 'aws-lambda';
import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient, PutCommand } from '@aws-sdk/lib-dynamodb';
import { v4 as uuidv4 } from 'uuid';
import { errorResponse, successResponse } from '@/libs/response';
import { getUserIdFromEvent } from '@/libs/auth';
import { CreateClientRequest } from '@/models/client';
import Joi from 'joi';

const dynamoClient = DynamoDBDocumentClient.from(new DynamoDBClient({ region: process.env.REGION }));

const clientSchema = Joi.object({
  name: Joi.string().required().min(1).max(200),
  email: Joi.string().email().required(),
  phone: Joi.string().optional().max(50),
  company: Joi.string().optional().max(200),
  address: Joi.string().optional().max(500),
});

export const handler: APIGatewayProxyHandler = async (event) => {
  try {
    const userId = getUserIdFromEvent(event);
    if (!userId) {
      return errorResponse(401, 'Unauthorized');
    }

    const body: CreateClientRequest = JSON.parse(event.body || '{}');
    
    const { error, value } = clientSchema.validate(body, { abortEarly: false });
    if (error) {
      return errorResponse(400, error.details[0].message);
    }

    const clientId = uuidv4();
    const now = new Date().toISOString();

    const client = {
      id: clientId,
      userId,
      ...value,
      invoices: 0,
      createdAt: now,
      updatedAt: now,
    };

    const command = new PutCommand({
      TableName: process.env.CLIENTS_TABLE,
      Item: client,
    });

    await dynamoClient.send(command);

    return successResponse(client, 201);
  } catch (error: any) {
    console.error('Create client error:', error);
    return errorResponse(500, error.message || 'Failed to create client');
  }
};
