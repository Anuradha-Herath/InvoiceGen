import { APIGatewayProxyHandler } from 'aws-lambda';
import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient, GetCommand, UpdateCommand } from '@aws-sdk/lib-dynamodb';
import { SESClient, SendEmailCommand } from '@aws-sdk/client-ses';
import { S3Client, GetObjectCommand } from '@aws-sdk/client-s3';
import { errorResponse, successResponse } from '@/libs/response';
import { getUserIdFromEvent } from '@/libs/auth';
import { SendEmailRequest } from '@/models/email';

const dynamoClient = DynamoDBDocumentClient.from(new DynamoDBClient({ region: process.env.REGION }));
const sesClient = new SESClient({ region: process.env.SES_REGION || process.env.REGION });
const s3Client = new S3Client({ region: process.env.REGION });

// Replace template variables with actual values
const replaceTemplateVariables = (template: string, data: any): string => {
  let result = template;
  
  const variables: { [key: string]: string } = {
    '{{company_name}}': data.companyName || '',
    '{{client_name}}': data.clientName || '',
    '{{invoice_number}}': data.invoiceNumber || '',
    '{{invoice_amount}}': data.invoiceAmount || '',
    '{{due_date}}': data.dueDate || '',
  };

  Object.entries(variables).forEach(([key, value]) => {
    result = result.replace(new RegExp(key, 'g'), value);
  });

  return result;
};

export const handler: APIGatewayProxyHandler = async (event) => {
  try {
    const userId = getUserIdFromEvent(event);
    if (!userId) {
      return errorResponse(401, 'Unauthorized');
    }

    const invoiceId = event.pathParameters?.id;
    if (!invoiceId) {
      return errorResponse(400, 'Invoice ID is required');
    }

    const body: SendEmailRequest = JSON.parse(event.body || '{}');
    const { recipientEmail, message } = body;

    if (!recipientEmail) {
      return errorResponse(400, 'Recipient email is required');
    }

    // Get invoice data
    const getCommand = new GetCommand({
      TableName: process.env.INVOICES_TABLE,
      Key: { userId, id: invoiceId },
    });

    const result = await dynamoClient.send(getCommand);
    if (!result.Item) {
      return errorResponse(404, 'Invoice not found');
    }

    if (result.Item.userId !== userId) {
      return errorResponse(403, 'Access denied');
    }

    if (!result.Item.pdfUrl) {
      return errorResponse(400, 'Invoice PDF not generated yet');
    }

    // Get email template
    const templateCommand = new GetCommand({
      TableName: process.env.EMAIL_TEMPLATES_TABLE,
      Key: { userId },
    });

    const templateResult = await dynamoClient.send(templateCommand);
    
    // Default template values
    let emailSubject = 'Invoice from {{company_name}}';
    let emailMessage = `Hello {{client_name}},\n\nPlease find attached your invoice #{{invoice_number}} for {{invoice_amount}}.\n\nDue date: {{due_date}}\n\nThank you!`;

    if (templateResult.Item) {
      emailSubject = templateResult.Item.subject;
      emailMessage = templateResult.Item.message;
    }

    // Get company settings for company name
    const companyCommand = new GetCommand({
      TableName: process.env.COMPANY_SETTINGS_TABLE,
      Key: { userId },
    });

    const companyResult = await dynamoClient.send(companyCommand);
    const companyName = companyResult.Item?.name || 'Invoice Generator';

    // Prepare template data
    const templateData = {
      companyName,
      clientName: result.Item.client.name,
      invoiceNumber: result.Item.invoiceNumber || invoiceId,
      invoiceAmount: `${result.Item.currency} ${result.Item.total}`,
      dueDate: result.Item.dueDate || 'Not specified',
    };

    // Replace variables in subject and message
    const finalSubject = replaceTemplateVariables(emailSubject, templateData);
    const finalMessage = message || replaceTemplateVariables(emailMessage, templateData);

    // Get PDF from S3
    const s3Key = `${userId}/${invoiceId}.pdf`;
    const getObjectCommand = new GetObjectCommand({
      Bucket: process.env.INVOICES_BUCKET,
      Key: s3Key,
    });

    const s3Object = await s3Client.send(getObjectCommand);
    const pdfBuffer = await s3Object.Body?.transformToByteArray();

    if (!pdfBuffer) {
      return errorResponse(500, 'Failed to retrieve PDF');
    }

    // Send email with SES
    const emailParams = {
      Source: process.env.SES_FROM_EMAIL!,
      Destination: {
        ToAddresses: [recipientEmail],
      },
      Message: {
        Subject: {
          Data: finalSubject,
        },
        Body: {
          Text: {
            Data: finalMessage,
          },
        },
      },
    };

    const sendCommand = new SendEmailCommand(emailParams);
    await sesClient.send(sendCommand);

    // Update invoice status to 'sent'
    const now = new Date().toISOString();
    const updateCommand = new UpdateCommand({
      TableName: process.env.INVOICES_TABLE,
      Key: { userId, id: invoiceId },
      UpdateExpression: 'SET #status = :status, updatedAt = :updatedAt',
      ExpressionAttributeNames: {
        '#status': 'status',
      },
      ExpressionAttributeValues: {
        ':status': 'sent',
        ':updatedAt': now,
      },
    });

    await dynamoClient.send(updateCommand);

    return successResponse({
      message: 'Invoice sent successfully',
      recipient: recipientEmail,
    });
  } catch (error: any) {
    console.error('Send email error:', error);
    return errorResponse(500, error.message || 'Failed to send email');
  }
};
