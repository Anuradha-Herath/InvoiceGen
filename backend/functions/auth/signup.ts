import { APIGatewayProxyHandler } from 'aws-lambda';
import { CognitoIdentityProviderClient, SignUpCommand } from '@aws-sdk/client-cognito-identity-provider';
import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient, PutCommand } from '@aws-sdk/lib-dynamodb';
import { v4 as uuidv4 } from 'uuid';
import { errorResponse, successResponse } from '@/libs/response';
import { SignupRequest } from '@/models/auth';

const cognitoClient = new CognitoIdentityProviderClient({ region: process.env.REGION });
const dynamoClient = DynamoDBDocumentClient.from(new DynamoDBClient({ region: process.env.REGION }));

export const handler: APIGatewayProxyHandler = async (event) => {
  try {
    const body: SignupRequest = JSON.parse(event.body || '{}');
    const { email, password, name } = body;

    if (!email || !password || !name) {
      return errorResponse(400, 'Email, password, and name are required');
    }

    // Sign up user in Cognito
    const signUpCommand = new SignUpCommand({
      ClientId: process.env.USER_POOL_CLIENT_ID,
      Username: email,
      Password: password,
      UserAttributes: [
        { Name: 'email', Value: email },
        { Name: 'name', Value: name },
      ],
    });

    const signUpResult = await cognitoClient.send(signUpCommand);

    // Create user record in DynamoDB
    const userId = uuidv4();
    const putCommand = new PutCommand({
      TableName: process.env.USERS_TABLE,
      Item: {
        id: userId,
        email,
        name,
        cognitoSub: signUpResult.UserSub,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
    });

    await dynamoClient.send(putCommand);

    return successResponse({
      message: 'User created successfully',
      userId,
      userConfirmed: signUpResult.UserConfirmed,
    });
  } catch (error: any) {
    console.error('Signup error:', error);
    return errorResponse(500, error.message || 'Failed to create user');
  }
};
