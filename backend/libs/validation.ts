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
  company: Joi.string().optional().max(200),
});

export const invoiceSchema = Joi.object({
  invoiceNumber: Joi.string().optional().max(50),
  client: invoiceClientSchema.required(),
  items: Joi.array().items(invoiceItemSchema).min(1).required(),
  subtotal: Joi.number().required().min(0),
  tax: Joi.number().optional().min(0),
  taxRate: Joi.number().optional().min(0).max(100),
  discount: Joi.number().optional().min(0).max(100),
  total: Joi.number().required().min(0),
  currency: Joi.string().required().length(3).uppercase(),
  issueDate: Joi.string().isoDate().required(),
  dueDate: Joi.string().isoDate().optional(),
  notes: Joi.string().optional().max(1000),
});

export const validateInvoice = (data: CreateInvoiceRequest) => {
  return invoiceSchema.validate(data, { abortEarly: false });
};

/**
 * Validate and calculate invoice totals
 * Ensures:
 * - lineAmount = quantity * unitPrice for each item
 * - subtotal = sum of all lineAmounts
 * - tax = subtotal * (taxRate / 100) if tax rate is provided
 * - total = subtotal - discount + tax (if applicable)
 */
export const validateAndNormalizeInvoice = (data: CreateInvoiceRequest): { 
  isValid: boolean; 
  data?: CreateInvoiceRequest; 
  errors?: string[] 
} => {
  const errors: string[] = [];

  // Validate basic schema
  const { error, value } = invoiceSchema.validate(data, { abortEarly: false });
  if (error) {
    return {
      isValid: false,
      errors: error.details.map(d => d.message),
    };
  }

  // Validate lineAmount for each item
  let calculatedSubtotal = 0;
  value.items.forEach((item: any, index: number) => {
    const calculatedAmount = Math.round(item.quantity * item.unitPrice * 100) / 100;
    const providedAmount = Math.round(item.amount * 100) / 100;

    // Allow small rounding differences (0.01 tolerance)
    if (Math.abs(calculatedAmount - providedAmount) > 0.01) {
      errors.push(
        `Item ${index + 1}: lineAmount should be ${calculatedAmount} (quantity × unitPrice), but got ${providedAmount}`
      );
    }
    calculatedSubtotal += calculatedAmount;
  });

  // Validate subtotal
  const providedSubtotal = Math.round(value.subtotal * 100) / 100;
  calculatedSubtotal = Math.round(calculatedSubtotal * 100) / 100;
  if (Math.abs(calculatedSubtotal - providedSubtotal) > 0.01) {
    errors.push(
      `Subtotal should be ${calculatedSubtotal} (sum of all line amounts), but got ${providedSubtotal}`
    );
  }

  // Validate tax calculation if tax is provided
  if (value.tax !== undefined && value.tax !== null) {
    const expectedTax = Math.round(calculatedSubtotal * ((value.taxRate || 0) / 100) * 100) / 100;
    const providedTax = Math.round(value.tax * 100) / 100;
    if (Math.abs(expectedTax - providedTax) > 0.01) {
      errors.push(
        `Tax should be ${expectedTax} (subtotal × taxRate%), but got ${providedTax}`
      );
    }
  }

  // Validate total
  // Calculate discount amount from discount percentage
  const discountPercentage = (value.discount || 0);
  const discountAmount = Math.round(calculatedSubtotal * (discountPercentage / 100) * 100) / 100;
  const taxAmount = value.tax || 0;
  const expectedTotal = Math.round((calculatedSubtotal - discountAmount + taxAmount) * 100) / 100;
  const providedTotal = Math.round(value.total * 100) / 100;
  if (Math.abs(expectedTotal - providedTotal) > 0.01) {
    errors.push(
      `Total should be ${expectedTotal} (subtotal - (subtotal × discount%) + tax), but got ${providedTotal}`
    );
  }

  if (errors.length > 0) {
    return { isValid: false, errors };
  }

  return { isValid: true, data: value };
};
