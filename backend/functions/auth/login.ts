import { APIGatewayProxyHandler } from 'aws-lambda';
import {
  CognitoIdentityProviderClient,
  InitiateAuthCommand,
  AuthFlowType,
} from '@aws-sdk/client-cognito-identity-provider';
import { errorResponse, successResponse } from '@/libs/response';
import { LoginRequest } from '@/models/auth';

const cognitoClient = new CognitoIdentityProviderClient({ region: process.env.REGION });

export const handler: APIGatewayProxyHandler = async (event) => {
  try {
    const body: LoginRequest = JSON.parse(event.body || '{}');
    const { email, password } = body;

    if (!email || !password) {
      return errorResponse(400, 'Email and password are required');
    }

    const command = new InitiateAuthCommand({
      AuthFlow: AuthFlowType.USER_PASSWORD_AUTH,
      ClientId: process.env.USER_POOL_CLIENT_ID,
      AuthParameters: {
        USERNAME: email,
        PASSWORD: password,
      },
    });

    const result = await cognitoClient.send(command);

    return successResponse({
      accessToken: result.AuthenticationResult?.AccessToken,
      idToken: result.AuthenticationResult?.IdToken,
      refreshToken: result.AuthenticationResult?.RefreshToken,
      expiresIn: result.AuthenticationResult?.ExpiresIn,
    });
  } catch (error: any) {
    console.error('Login error:', error);
    
    if (error.name === 'NotAuthorizedException') {
      return errorResponse(401, 'Invalid email or password');
    }
    
    return errorResponse(500, error.message || 'Failed to authenticate');
  }
};
