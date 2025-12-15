import Joi from 'joi';
import { CreateInvoiceRequest } from '@/models/invoice';

const invoiceItemSchema = Joi.object({
  description: Joi.string().required().min(1).max(500),
  quantity: Joi.number().required().min(0.01),
  unitPrice: Joi.number().required().min(0),
  amount: Joi.number().required().min(0),
});

const invoiceClientSchema = Joi.object({
  name: Joi.string().required().min(1).max(200),
  email: Joi.string().email().required(),
  address: Joi.string().optional().max(500),
  phone: Joi.string().optional().max(50),
});

export const invoiceSchema = Joi.object({
  invoiceNumber: Joi.string().optional().max(50),
  client: invoiceClientSchema.required(),
  items: Joi.array().items(invoiceItemSchema).min(1).required(),
  subtotal: Joi.number().required().min(0),
  tax: Joi.number().optional().min(0),
  taxRate: Joi.number().optional().min(0).max(100),
  total: Joi.number().required().min(0),
  currency: Joi.string().required().length(3).uppercase(),
  issueDate: Joi.string().isoDate().required(),
  dueDate: Joi.string().isoDate().optional(),
  notes: Joi.string().optional().max(1000),
});

export const validateInvoice = (data: CreateInvoiceRequest) => {
  return invoiceSchema.validate(data, { abortEarly: false });
};
