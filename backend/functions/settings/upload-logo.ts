import { APIGatewayProxyHandler } from 'aws-lambda';
import { S3Client, PutObjectCommand, GetObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient, UpdateCommand } from '@aws-sdk/lib-dynamodb';
import { errorResponse, successResponse } from '@/libs/response';
import { getUserIdFromEvent } from '@/libs/auth';
import { v4 as uuidv4 } from 'uuid';

const s3Client = new S3Client({ region: process.env.REGION });
const dynamoClient = DynamoDBDocumentClient.from(new DynamoDBClient({ region: process.env.REGION }));

export const handler: APIGatewayProxyHandler = async (event) => {
  try {
    const userId = getUserIdFromEvent(event);
    if (!userId) {
      return errorResponse(401, 'Unauthorized');
    }

    // For simplicity, assume base64 encoded image is in the body
    const body: any = JSON.parse(event.body || '{}');
    
    if (!body.imageData || !body.fileName) {
      return errorResponse(400, 'imageData and fileName are required');
    }

    // Validate image type
    const validTypes = ['image/png', 'image/jpeg', 'image/gif', 'image/svg+xml'];
    if (!validTypes.includes(body.mimeType || 'image/jpeg')) {
      return errorResponse(400, 'Invalid image type. Supported: png, jpeg, gif, svg');
    }

    // Decode base64 and upload to S3
    const buffer = Buffer.from(body.imageData, 'base64');
    const key = `logos/${userId}/${uuidv4()}-${body.fileName}`;

    const uploadCommand = new PutObjectCommand({
      Bucket: process.env.INVOICES_BUCKET,
      Key: key,
      Body: buffer,
      ContentType: body.mimeType || 'image/jpeg',
      Metadata: {
        userId,
      },
    });

    await s3Client.send(uploadCommand);

    // Generate a presigned URL valid for 7 days
    const getCommand = new GetObjectCommand({
      Bucket: process.env.INVOICES_BUCKET,
      Key: key,
    });
    const logoUrl = await getSignedUrl(s3Client, getCommand, { expiresIn: 604800 }); // 7 days

    // Update company settings with logo URL
    const now = new Date().toISOString();
    const updateCommand = new UpdateCommand({
      TableName: process.env.COMPANY_SETTINGS_TABLE,
      Key: { userId },
      UpdateExpression: 'SET logoUrl = :logoUrl, updatedAt = :updatedAt',
      ExpressionAttributeValues: {
        ':logoUrl': logoUrl,
        ':updatedAt': now,
      },
      ReturnValues: 'ALL_NEW',
    });

    const result = await dynamoClient.send(updateCommand);

    return successResponse({
      logoUrl,
      message: 'Logo uploaded successfully',
    }, 200);
  } catch (error: any) {
    console.error('Logo upload error:', error);
    return errorResponse(500, error.message || 'Failed to upload logo');
  }
};
