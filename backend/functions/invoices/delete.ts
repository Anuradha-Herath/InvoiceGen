import { APIGatewayProxyHandler } from 'aws-lambda';
import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient, GetCommand, DeleteCommand } from '@aws-sdk/lib-dynamodb';
import { S3Client, DeleteObjectCommand } from '@aws-sdk/client-s3';
import { errorResponse, successResponse } from '@/libs/response';
import { getUserIdFromEvent } from '@/libs/auth';

const dynamoClient = DynamoDBDocumentClient.from(new DynamoDBClient({ region: process.env.REGION }));
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

    // Verify invoice exists and belongs to user
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

    // Delete PDF from S3 if exists
    if (result.Item.pdfUrl) {
      const deleteS3Command = new DeleteObjectCommand({
        Bucket: process.env.INVOICES_BUCKET,
        Key: `${userId}/${invoiceId}.pdf`,
      });
      await s3Client.send(deleteS3Command);
    }

    // Delete invoice from DynamoDB
    const deleteCommand = new DeleteCommand({
      TableName: process.env.INVOICES_TABLE,
      Key: { id: invoiceId },
    });

    await dynamoClient.send(deleteCommand);

    return successResponse({ message: 'Invoice deleted successfully' });
  } catch (error: any) {
    console.error('Delete invoice error:', error);
    return errorResponse(500, error.message || 'Failed to delete invoice');
  }
};
