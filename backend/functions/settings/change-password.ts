import { APIGatewayProxyHandler } from 'aws-lambda';
import { CognitoIdentityProviderClient, AdminSetUserPasswordCommand } from '@aws-sdk/client-cognito-identity-provider';
import { errorResponse, successResponse } from '@/libs/response';
import { getUserIdFromEvent } from '@/libs/auth';
import { ChangePasswordRequest } from '@/models/settings';
import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient, GetCommand } from '@aws-sdk/lib-dynamodb';
import Joi from 'joi';

const cognitoClient = new CognitoIdentityProviderClient({ region: process.env.REGION });
const dynamoClient = DynamoDBDocumentClient.from(new DynamoDBClient({ region: process.env.REGION }));

const passwordSchema = Joi.object({
  currentPassword: Joi.string().required().min(8),
  newPassword: Joi.string().required().min(8),
});

export const handler: APIGatewayProxyHandler = async (event) => {
  try {
    const userId = getUserIdFromEvent(event);
    if (!userId) {
      return errorResponse(401, 'Unauthorized');
    }

    const body: ChangePasswordRequest = JSON.parse(event.body || '{}');
    
    const { error, value } = passwordSchema.validate(body, { abortEarly: false });
    if (error) {
      return errorResponse(400, error.details[0].message);
    }

    // Get user cognito sub
    const getUserCommand = new GetCommand({
      TableName: process.env.USERS_TABLE,
      Key: { id: userId },
    });

    const userResult = await dynamoClient.send(getUserCommand);
    if (!userResult.Item) {
      return errorResponse(404, 'User not found');
    }

    // Update Cognito password (this requires admin context, use AdminSetUserPasswordCommand)
    // Note: For security, consider using InitiateAuth with USER_PASSWORD_AUTH for verification first
    const cognitoUpdateCommand = new AdminSetUserPasswordCommand({
      UserPoolId: process.env.USER_POOL_ID,
      Username: userResult.Item.cognitoSub,
      Password: value.newPassword,
      Permanent: true,
    });

    await cognitoClient.send(cognitoUpdateCommand);

    return successResponse({ message: 'Password changed successfully' });
  } catch (error: any) {
    console.error('Password change error:', error);
    return errorResponse(500, error.message || 'Failed to change password');
  }
};
