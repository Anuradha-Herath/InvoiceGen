import { APIGatewayProxyHandler } from 'aws-lambda';
import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient, UpdateCommand, GetCommand } from '@aws-sdk/lib-dynamodb';
import { CognitoIdentityProviderClient, AdminUpdateUserAttributesCommand } from '@aws-sdk/client-cognito-identity-provider';
import { errorResponse, successResponse } from '@/libs/response';
import { getUserIdFromEvent } from '@/libs/auth';
import { UpdateProfileRequest } from '@/models/settings';
import Joi from 'joi';

const dynamoClient = DynamoDBDocumentClient.from(new DynamoDBClient({ region: process.env.REGION }));
const cognitoClient = new CognitoIdentityProviderClient({ region: process.env.REGION });

const profileSchema = Joi.object({
  name: Joi.string().optional().min(1).max(200),
  email: Joi.string().email().optional(),
});

export const handler: APIGatewayProxyHandler = async (event) => {
  try {
    const userId = getUserIdFromEvent(event);
    if (!userId) {
      return errorResponse(401, 'Unauthorized');
    }

    if (event.requestContext.http.method === 'GET') {
      const command = new GetCommand({
        TableName: process.env.USERS_TABLE,
        Key: { id: userId },
      });

      const result = await dynamoClient.send(command);
      if (!result.Item) {
        return errorResponse(404, 'User not found');
      }

      return successResponse(result.Item);
    }

    if (event.requestContext.http.method === 'PUT') {
      const body: UpdateProfileRequest = JSON.parse(event.body || '{}');
      
      const { error, value } = profileSchema.validate(body, { abortEarly: false });
      if (error) {
        return errorResponse(400, error.details[0].message);
      }

      const now = new Date().toISOString();

      // Get current user to fetch cognitoSub
      const getUserCommand = new GetCommand({
        TableName: process.env.USERS_TABLE,
        Key: { id: userId },
      });

      const userResult = await dynamoClient.send(getUserCommand);
      if (!userResult.Item) {
        return errorResponse(404, 'User not found');
      }

      // Update Cognito attributes if email is being changed
      if (value.email && value.email !== userResult.Item.email) {
        const cognitoUpdateCommand = new AdminUpdateUserAttributesCommand({
          UserPoolId: process.env.USER_POOL_ID,
          Username: userResult.Item.cognitoSub,
          UserAttributes: [
            { Name: 'email', Value: value.email },
          ],
        });

        await cognitoClient.send(cognitoUpdateCommand);
      }

      const updateExpression = Object.keys(value)
        .map((key) => `${key} = :${key}`)
        .join(', ');

      const expressionAttributeValues: any = {
        ':updatedAt': now,
      };

      Object.entries(value).forEach(([key, val]) => {
        expressionAttributeValues[`:${key}`] = val;
      });

      const updateCommand = new UpdateCommand({
        TableName: process.env.USERS_TABLE,
        Key: { id: userId },
        UpdateExpression: `SET ${updateExpression}, updatedAt = :updatedAt`,
        ExpressionAttributeValues: expressionAttributeValues,
        ReturnValues: 'ALL_NEW',
      });

      const result = await dynamoClient.send(updateCommand);

      return successResponse(result.Attributes);
    }

    return errorResponse(405, 'Method not allowed');
  } catch (error: any) {
    console.error('Profile update error:', error);
    return errorResponse(500, error.message || 'Failed to update profile');
  }
};
