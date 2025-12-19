import { APIGatewayProxyHandler } from 'aws-lambda';
import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient, GetCommand, PutCommand } from '@aws-sdk/lib-dynamodb';
import { errorResponse, successResponse } from '@/libs/response';
import { getUserIdFromEvent } from '@/libs/auth';
import { UpdateEmailTemplateRequest } from '@/models/settings';
import Joi from 'joi';

const dynamoClient = DynamoDBDocumentClient.from(new DynamoDBClient({ region: process.env.REGION }));

const emailTemplateSchema = Joi.object({
  subject: Joi.string().optional().max(200),
  message: Joi.string().optional().max(2000),
});

// Extract template variables from a string
const extractTemplateVariables = (text: string): string[] => {
  const regex = /\{\{([^}]+)\}\}/g;
  const variables: string[] = [];
  let match;
  while ((match = regex.exec(text)) !== null) {
    variables.push(`{{${match[1]}}}`);
  }
  return [...new Set(variables)];
};

export const handler: APIGatewayProxyHandler = async (event) => {
  try {
    const userId = getUserIdFromEvent(event);
    if (!userId) {
      return errorResponse(401, 'Unauthorized');
    }

    if (event.requestContext.httpMethod === 'GET') {
      const command = new GetCommand({
        TableName: process.env.EMAIL_TEMPLATES_TABLE,
        Key: { userId },
      });

      const result = await dynamoClient.send(command);
      if (!result.Item) {
        return successResponse({
          userId,
          subject: 'Invoice from {{company_name}}',
          message: `Hello {{client_name}},\n\nPlease find attached your invoice #{{invoice_number}} for {{invoice_amount}}.\n\nDue date: {{due_date}}\n\nThank you!`,
          variables: ['{{company_name}}', '{{client_name}}', '{{invoice_number}}', '{{invoice_amount}}', '{{due_date}}'],
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        });
      }

      return successResponse(result.Item);
    }

    if (event.requestContext.httpMethod === 'PUT') {
      const body: UpdateEmailTemplateRequest = JSON.parse(event.body || '{}');
      
      const { error, value } = emailTemplateSchema.validate(body, { abortEarly: false });
      if (error) {
        return errorResponse(400, error.details[0].message);
      }

      const now = new Date().toISOString();

      // Extract variables from subject and message
      const subjectVars = value.subject ? extractTemplateVariables(value.subject) : [];
      const messageVars = value.message ? extractTemplateVariables(value.message) : [];
      const allVariables = [...new Set([...subjectVars, ...messageVars])];

      const template = {
        userId,
        ...value,
        variables: allVariables,
        createdAt: new Date().toISOString(),
        updatedAt: now,
      };

      const command = new PutCommand({
        TableName: process.env.EMAIL_TEMPLATES_TABLE,
        Item: template,
      });

      await dynamoClient.send(command);

      return successResponse(template, 200);
    }

    return errorResponse(405, 'Method not allowed');
  } catch (error: any) {
    console.error('Email template error:', error);
    return errorResponse(500, error.message || 'Failed to handle email template');
  }
};
