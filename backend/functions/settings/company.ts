import { APIGatewayProxyHandler } from 'aws-lambda';
import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient, GetCommand, PutCommand } from '@aws-sdk/lib-dynamodb';
import { errorResponse, successResponse } from '@/libs/response';
import { getUserIdFromEvent } from '@/libs/auth';
import { UpdateCompanySettingsRequest } from '@/models/settings';
import Joi from 'joi';

const dynamoClient = DynamoDBDocumentClient.from(new DynamoDBClient({ region: process.env.REGION }));

const companySettingsSchema = Joi.object({
  name: Joi.string().optional().max(200),
  address: Joi.string().optional().max(500),
  phone: Joi.string().optional().max(50),
  email: Joi.string().email().optional(),
  website: Joi.string().optional().max(200),
  taxId: Joi.string().optional().max(50),
});

export const handler: APIGatewayProxyHandler = async (event) => {
  try {
    const userId = getUserIdFromEvent(event);
    if (!userId) {
      return errorResponse(401, 'Unauthorized');
    }

    if (event.requestContext.http.method === 'GET') {
      const command = new GetCommand({
        TableName: process.env.COMPANY_SETTINGS_TABLE,
        Key: { userId },
      });

      const result = await dynamoClient.send(command);
      if (!result.Item) {
        return successResponse({
          userId,
          name: undefined,
          address: undefined,
          phone: undefined,
          email: undefined,
          website: undefined,
          taxId: undefined,
          logoUrl: undefined,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        });
      }

      return successResponse(result.Item);
    }

    if (event.requestContext.http.method === 'PUT') {
      const body: UpdateCompanySettingsRequest = JSON.parse(event.body || '{}');
      
      const { error, value } = companySettingsSchema.validate(body, { abortEarly: false });
      if (error) {
        return errorResponse(400, error.details[0].message);
      }

      const now = new Date().toISOString();

      const settings = {
        userId,
        ...value,
        updatedAt: now,
      };

      const command = new PutCommand({
        TableName: process.env.COMPANY_SETTINGS_TABLE,
        Item: {
          userId,
          ...value,
          createdAt: new Date().toISOString(),
          updatedAt: now,
        },
      });

      await dynamoClient.send(command);

      return successResponse(settings, 200);
    }

    return errorResponse(405, 'Method not allowed');
  } catch (error: any) {
    console.error('Company settings error:', error);
    return errorResponse(500, error.message || 'Failed to handle company settings');
  }
};
