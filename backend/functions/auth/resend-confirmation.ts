import { APIGatewayProxyHandler } from 'aws-lambda';
import { CognitoIdentityProviderClient, ResendConfirmationCodeCommand } from '@aws-sdk/client-cognito-identity-provider';
import { errorResponse, successResponse } from '@/libs/response';
import Joi from 'joi';

const cognitoClient = new CognitoIdentityProviderClient({ region: process.env.REGION });

const resendCodeSchema = Joi.object({
  email: Joi.string().email().required(),
});

export const handler: APIGatewayProxyHandler = async (event) => {
  try {
    const body = JSON.parse(event.body || '{}');

    const { error, value } = resendCodeSchema.validate(body, { abortEarly: false });
    if (error) {
      return errorResponse(400, error.details[0].message);
    }

    console.log('Resending confirmation code for:', value.email);

    const resendCommand = new ResendConfirmationCodeCommand({
      ClientId: process.env.USER_POOL_CLIENT_ID,
      Username: value.email,
    });

    await cognitoClient.send(resendCommand);

    console.log('Confirmation code resent successfully:', value.email);

    return successResponse({
      message: 'Verification code sent to your email',
      email: value.email,
    });
  } catch (error: any) {
    console.error('Resend confirmation error:', error);

    // Handle specific Cognito errors
    if (error.name === 'UserNotFoundException') {
      return errorResponse(404, 'User not found');
    }
    if (error.name === 'NotAuthorizedException') {
      return errorResponse(400, 'User is already confirmed');
    }
    if (error.name === 'LimitExceededException') {
      return errorResponse(429, 'Too many attempts. Please try again later');
    }

    return errorResponse(500, error.message || 'Failed to resend confirmation code');
  }
};
