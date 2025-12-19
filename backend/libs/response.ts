import { APIResponse } from '@/models/response';

const corsHeaders = {
  'Content-Type': 'application/json',
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token',
  'Access-Control-Allow-Methods': 'GET,POST,PUT,PATCH,DELETE,OPTIONS',
  'Access-Control-Allow-Credentials': true,
};

export const successResponse = (data: any, statusCode: number = 200): APIResponse => {
  return {
    statusCode,
    headers: corsHeaders,
    body: JSON.stringify(data),
  };
};

export const errorResponse = (statusCode: number, message: string): APIResponse => {
  return {
    statusCode,
    headers: corsHeaders,
    body: JSON.stringify({
      error: message,
    }),
  };
};
