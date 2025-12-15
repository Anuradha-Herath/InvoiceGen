export interface SendEmailRequest {
  recipientEmail: string;
  message?: string;
}

export interface EmailAttachment {
  filename: string;
  content: Buffer;
  contentType: string;
}
