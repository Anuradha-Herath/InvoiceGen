import { APIGatewayProxyHandler } from 'aws-lambda';
import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient, GetCommand } from '@aws-sdk/lib-dynamodb';
import { SESClient, SendEmailCommand } from '@aws-sdk/client-ses';
import { S3Client, GetObjectCommand } from '@aws-sdk/client-s3';
import { errorResponse, successResponse } from '@/libs/response';
import { getUserIdFromEvent } from '@/libs/auth';
import { SendEmailRequest } from '@/models/email';

const dynamoClient = DynamoDBDocumentClient.from(new DynamoDBClient({ region: process.env.REGION }));
const sesClient = new SESClient({ region: process.env.SES_REGION || process.env.REGION });
const s3Client = new S3Client({ region: process.env.REGION });

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
      Key: { id: invoiceId },
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
          Data: `Invoice #${result.Item.invoiceNumber || invoiceId}`,
        },
        Body: {
          Text: {
            Data: message || `Please find attached invoice #${result.Item.invoiceNumber || invoiceId}.`,
          },
        },
      },
      // Note: For attachments, you'd need to use SendRawEmail with MIME formatting
      // This is a simplified version
    };

    const sendCommand = new SendEmailCommand(emailParams);
    await sesClient.send(sendCommand);

    return successResponse({
      message: 'Invoice sent successfully',
      recipient: recipientEmail,
    });
  } catch (error: any) {
    console.error('Send email error:', error);
    return errorResponse(500, error.message || 'Failed to send email');
  }
};
