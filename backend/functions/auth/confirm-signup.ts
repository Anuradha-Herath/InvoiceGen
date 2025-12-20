import { APIGatewayProxyHandler } from 'aws-lambda';
import { CognitoIdentityProviderClient, ConfirmSignUpCommand } from '@aws-sdk/client-cognito-identity-provider';
import { errorResponse, successResponse } from '@/libs/response';
import Joi from 'joi';

const cognitoClient = new CognitoIdentityProviderClient({ region: process.env.REGION });

const confirmSignupSchema = Joi.object({
  email: Joi.string().email().required(),
  code: Joi.string().length(6).required(),
});

export const handler: APIGatewayProxyHandler = async (event) => {
  try {
    const body = JSON.parse(event.body || '{}');

    const { error, value } = confirmSignupSchema.validate(body, { abortEarly: false });
    if (error) {
      return errorResponse(400, error.details[0].message);
    }

    console.log('Confirming signup for:', value.email);

    const confirmCommand = new ConfirmSignUpCommand({
      ClientId: process.env.USER_POOL_CLIENT_ID,
      Username: value.email,
      ConfirmationCode: value.code,
    });

    await cognitoClient.send(confirmCommand);

    console.log('Email confirmed successfully:', value.email);

    return successResponse({
      message: 'Email verified successfully',
      email: value.email,
    });
  } catch (error: any) {
    console.error('Confirm signup error:', error);
    
    // Handle specific Cognito errors
    if (error.name === 'CodeMismatchException') {
      return errorResponse(400, 'Invalid verification code');
    }
    if (error.name === 'NotAuthorizedException') {
      return errorResponse(400, 'User is already confirmed or does not exist');
    }
    if (error.name === 'ExpiredCodeException') {
      return errorResponse(400, 'Verification code has expired');
    }

    return errorResponse(500, error.message || 'Failed to confirm email');
  }
};
