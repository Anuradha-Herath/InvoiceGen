import { Invoice } from '@/models/invoice';

export const generateInvoiceHTML = (invoice: Invoice): string => {
  const formatCurrency = (amount: number, currency: string) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency,
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Invoice ${invoice.invoiceNumber || invoice.id}</title>
  <style>
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }
    
    body {
      font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;
      font-size: 14px;
      color: #333;
      line-height: 1.6;
      padding: 40px;
    }
    
    .invoice-container {
      max-width: 800px;
      margin: 0 auto;
    }
    
    .header {
      margin-bottom: 40px;
      border-bottom: 2px solid #007bff;
      padding-bottom: 20px;
    }
    
    .header h1 {
      color: #007bff;
      font-size: 32px;
      margin-bottom: 10px;
    }
    
    .invoice-info {
      display: flex;
      justify-content: space-between;
      margin-bottom: 30px;
    }
    
    .info-section h3 {
      color: #007bff;
      margin-bottom: 10px;
      font-size: 16px;
    }
    
    .info-section p {
      margin: 5px 0;
    }
    
    table {
      width: 100%;
      border-collapse: collapse;
      margin-bottom: 30px;
    }
    
    table thead {
      background-color: #007bff;
      color: white;
    }
    
    table th {
      padding: 12px;
      text-align: left;
      font-weight: 600;
    }
    
    table td {
      padding: 12px;
      border-bottom: 1px solid #ddd;
    }
    
    table tbody tr:hover {
      background-color: #f8f9fa;
    }
    
    .text-right {
      text-align: right;
    }
    
    .totals {
      margin-left: auto;
      width: 300px;
    }
    
    .totals-row {
      display: flex;
      justify-content: space-between;
      padding: 8px 0;
    }
    
    .totals-row.total {
      border-top: 2px solid #007bff;
      font-weight: bold;
      font-size: 18px;
      margin-top: 10px;
      padding-top: 15px;
    }
    
    .notes {
      margin-top: 30px;
      padding: 20px;
      background-color: #f8f9fa;
      border-left: 4px solid #007bff;
    }
    
    .notes h3 {
      color: #007bff;
      margin-bottom: 10px;
    }
    
    .footer {
      margin-top: 50px;
      text-align: center;
      color: #666;
      font-size: 12px;
    }
  </style>
</head>
<body>
  <div class="invoice-container">
    <div class="header">
      <h1>INVOICE</h1>
      <p><strong>Invoice #:</strong> ${invoice.invoiceNumber || invoice.id}</p>
      <p><strong>Date:</strong> ${formatDate(invoice.issueDate)}</p>
      ${invoice.dueDate ? `<p><strong>Due Date:</strong> ${formatDate(invoice.dueDate)}</p>` : ''}
    </div>
    
    <div class="invoice-info">
      <div class="info-section">
        <h3>Bill To:</h3>
        <p><strong>${invoice.client.name}</strong></p>
        <p>${invoice.client.email}</p>
        ${invoice.client.address ? `<p>${invoice.client.address}</p>` : ''}
        ${invoice.client.phone ? `<p>${invoice.client.phone}</p>` : ''}
      </div>
      
      <div class="info-section text-right">
        <h3>Status:</h3>
        <p><strong style="text-transform: uppercase;">${invoice.status}</strong></p>
      </div>
    </div>
    
    <table>
      <thead>
        <tr>
          <th>Description</th>
          <th class="text-right">Quantity</th>
          <th class="text-right">Unit Price</th>
          <th class="text-right">Amount</th>
        </tr>
      </thead>
      <tbody>
        ${invoice.items.map(item => `
          <tr>
            <td>${item.description}</td>
            <td class="text-right">${item.quantity}</td>
            <td class="text-right">${formatCurrency(item.unitPrice, invoice.currency)}</td>
            <td class="text-right">${formatCurrency(item.amount, invoice.currency)}</td>
          </tr>
        `).join('')}
      </tbody>
    </table>
    
    <div class="totals">
      <div class="totals-row">
        <span>Subtotal:</span>
        <span>${formatCurrency(invoice.subtotal, invoice.currency)}</span>
      </div>
      ${invoice.tax ? `
        <div class="totals-row">
          <span>Tax ${invoice.taxRate ? `(${invoice.taxRate}%)` : ''}:</span>
          <span>${formatCurrency(invoice.tax, invoice.currency)}</span>
        </div>
      ` : ''}
      <div class="totals-row total">
        <span>Total:</span>
        <span>${formatCurrency(invoice.total, invoice.currency)}</span>
      </div>
    </div>
    
    ${invoice.notes ? `
      <div class="notes">
        <h3>Notes:</h3>
        <p>${invoice.notes}</p>
      </div>
    ` : ''}
    
    <div class="footer">
      <p>Thank you for your business!</p>
      <p>Generated on ${formatDate(new Date().toISOString())}</p>
    </div>
  </div>
</body>
</html>
  `;
};
