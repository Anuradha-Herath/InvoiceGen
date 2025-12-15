import { APIGatewayProxyEvent } from 'aws-lambda';

export const getUserIdFromEvent = (event: APIGatewayProxyEvent): string | null => {
  try {
    // Extract user ID from Cognito authorizer context
    const claims = event.requestContext.authorizer?.claims;
    return claims?.sub || null;
  } catch (error) {
    console.error('Error extracting user ID:', error);
    return null;
  }
};

export const getEmailFromEvent = (event: APIGatewayProxyEvent): string | null => {
  try {
    const claims = event.requestContext.authorizer?.claims;
    return claims?.email || null;
  } catch (error) {
    console.error('Error extracting email:', error);
    return null;
  }
};
