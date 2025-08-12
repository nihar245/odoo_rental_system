import PDFDocument from 'pdfkit';
import fs from 'fs';
import path from 'path';

export const generateInvoicePDF = async (invoiceData) => {
  return new Promise((resolve, reject) => {
    try {
      // Create a new PDF document
      const doc = new PDFDocument({
        size: 'A4',
        margin: 50
      });

      // Create a buffer to store the PDF
      const chunks = [];
      doc.on('data', chunk => chunks.push(chunk));
      doc.on('end', () => resolve(Buffer.concat(chunks)));

      // Add company header
      doc.fontSize(24)
         .font('Helvetica-Bold')
         .fillColor('#1f2937')
         .text('RENTAL MANAGEMENT SYSTEM', { align: 'center' });

      doc.moveDown(0.5);
      doc.fontSize(14)
         .font('Helvetica')
         .fillColor('#6b7280')
         .text('Professional Equipment Rental Services', { align: 'center' });

      doc.moveDown(2);

      // Invoice header section
      doc.fontSize(20)
         .font('Helvetica-Bold')
         .fillColor('#1f2937')
         .text('INVOICE');

      doc.moveDown(0.5);
      doc.fontSize(12)
         .font('Helvetica')
         .fillColor('#6b7280')
         .text(`Invoice Number: ${invoiceData.invoice_number}`);

      doc.moveDown(0.5);
      doc.text(`Issue Date: ${invoiceData.issued_date}`);
      doc.text(`Due Date: ${invoiceData.due_date}`);

      doc.moveDown(2);

      // Customer and Company information in two columns
      const leftColumn = 50;
      const rightColumn = 300;

      // Customer Information
      doc.fontSize(14)
         .font('Helvetica-Bold')
         .fillColor('#1f2937')
         .text('BILL TO:', leftColumn);

      doc.moveDown(0.5);
      doc.fontSize(12)
         .font('Helvetica')
         .fillColor('#374151')
         .text(invoiceData.customer.name, leftColumn)
         .text(invoiceData.customer.email, leftColumn)
         .text(invoiceData.customer.phone, leftColumn)
         .text(invoiceData.customer.address, leftColumn);

      // Company Information
      doc.fontSize(14)
         .font('Helvetica-Bold')
         .fillColor('#1f2937')
         .text('FROM:', rightColumn);

      doc.moveDown(0.5);
      doc.fontSize(12)
         .font('Helvetica')
         .fillColor('#374151')
         .text('Rental Management System', rightColumn)
         .text('123 Business Street', rightColumn)
         .text('City, State 12345', rightColumn)
         .text('Phone: (555) 123-4567', rightColumn)
         .text('Email: info@rental.com', rightColumn);

      doc.moveDown(3);

      // Product and Rental Details
      doc.fontSize(16)
         .font('Helvetica-Bold')
         .fillColor('#1f2937')
         .text('RENTAL DETAILS');

      doc.moveDown(1);

      // Product information
      doc.fontSize(12)
         .font('Helvetica-Bold')
         .fillColor('#374151')
         .text('Product Information:', 50);

      doc.moveDown(0.5);
      doc.fontSize(11)
         .font('Helvetica')
         .fillColor('#6b7280')
         .text(`Product Name: ${invoiceData.product.name}`, 70)
         .text(`Quantity: ${invoiceData.product.quantity}`, 70);

      doc.moveDown(1);

      // Rental period
      doc.fontSize(12)
         .font('Helvetica-Bold')
         .fillColor('#374151')
         .text('Rental Period:', 50);

      doc.moveDown(0.5);
      doc.fontSize(11)
         .font('Helvetica')
         .fillColor('#6b7280')
         .text(`Start Date: ${invoiceData.rental_period.start_date}`, 70)
         .text(`End Date: ${invoiceData.rental_period.end_date}`, 70)
         .text(`Total Days: ${invoiceData.rental_period.total_days} days`, 70);

      doc.moveDown(2);

      // Pricing breakdown table
      doc.fontSize(16)
         .font('Helvetica-Bold')
         .fillColor('#1f2937')
         .text('PRICING BREAKDOWN');

      doc.moveDown(1);

      // Table headers
      const tableTop = doc.y;
      const tableLeft = 50;
      const col1Width = 200;
      const col2Width = 100;
      const col3Width = 100;

      // Draw table headers
      doc.fontSize(11)
         .font('Helvetica-Bold')
         .fillColor('#ffffff')
         .rect(tableLeft, tableTop, col1Width, 25)
         .fill()
         .fillColor('#1f2937')
         .text('Description', tableLeft + 10, tableTop + 8);

      doc.rect(tableLeft + col1Width, tableTop, col2Width, 25)
         .fill()
         .fillColor('#ffffff')
         .text('Rate', tableLeft + col1Width + 10, tableTop + 8);

      doc.rect(tableLeft + col1Width + col2Width, tableTop, col3Width, 25)
         .fill()
         .fillColor('#ffffff')
         .text('Amount', tableLeft + col1Width + col2Width + 10, tableTop + 8);

      // Table content
      let currentY = tableTop + 25;

      // Daily rate row
      doc.fontSize(10)
         .font('Helvetica')
         .fillColor('#374151')
         .text('Daily Rate', tableLeft + 10, currentY + 8);
      doc.text(`$${invoiceData.pricing.daily_rate}/day`, tableLeft + col1Width + 10, currentY + 8);
      doc.text(`$${(invoiceData.pricing.daily_rate * invoiceData.rental_period.total_days).toFixed(2)}`, tableLeft + col1Width + col2Width + 10, currentY + 8);

      currentY += 25;

      // Security deposit row (if applicable)
      if (invoiceData.security_deposit > 0) {
        doc.text('Security Deposit', tableLeft + 10, currentY + 8);
        doc.text('N/A', tableLeft + col1Width + 10, currentY + 8);
        doc.text(`$${invoiceData.security_deposit.toFixed(2)}`, tableLeft + col1Width + col2Width + 10, currentY + 8);
        currentY += 25;
      }

      // Late fees row (if applicable)
      if (invoiceData.late_fees > 0) {
        doc.text('Late Fees', tableLeft + 10, currentY + 8);
        doc.text('N/A', tableLeft + col1Width + 10, currentY + 8);
        doc.text(`$${invoiceData.late_fees.toFixed(2)}`, tableLeft + col1Width + col2Width + 10, currentY + 8);
        currentY += 25;
      }

      // Draw table borders
      doc.strokeColor('#d1d5db')
         .lineWidth(1)
         .rect(tableLeft, tableTop, col1Width + col2Width + col3Width, currentY - tableTop)
         .stroke();

      // Vertical lines
      doc.moveTo(tableLeft + col1Width, tableTop)
         .lineTo(tableLeft + col1Width, currentY)
         .stroke();

      doc.moveTo(tableLeft + col1Width + col2Width, tableTop)
         .lineTo(tableLeft + col1Width + col2Width, currentY)
         .stroke();

      // Horizontal lines
      doc.moveTo(tableLeft, tableTop + 25)
         .lineTo(tableLeft + col1Width + col2Width + col3Width, tableTop + 25)
         .stroke();

      doc.moveDown(2);

      // Total section
      const totalLeft = tableLeft + col1Width + col2Width;
      const totalWidth = col3Width;

      doc.fontSize(12)
         .font('Helvetica-Bold')
         .fillColor('#374151')
         .text('Subtotal:', totalLeft, doc.y)
         .text(`$${invoiceData.subtotal.toFixed(2)}`, totalLeft + totalWidth - 60, doc.y);

      doc.moveDown(0.5);
      doc.text('Security Deposit:', totalLeft, doc.y)
         .text(`$${invoiceData.security_deposit.toFixed(2)}`, totalLeft + totalWidth - 60, doc.y);

      if (invoiceData.late_fees > 0) {
        doc.moveDown(0.5);
        doc.text('Late Fees:', totalLeft, doc.y)
           .text(`$${invoiceData.late_fees.toFixed(2)}`, totalLeft + totalWidth - 60, doc.y);
      }

      doc.moveDown(0.5);
      doc.fontSize(14)
         .font('Helvetica-Bold')
         .fillColor('#1f2937')
         .text('TOTAL:', totalLeft, doc.y)
         .text(`$${invoiceData.total_amount.toFixed(2)}`, totalLeft + totalWidth - 60, doc.y);

      doc.moveDown(3);

      // Payment details
      doc.fontSize(14)
         .font('Helvetica-Bold')
         .fillColor('#1f2937')
         .text('PAYMENT DETAILS');

      doc.moveDown(1);
      doc.fontSize(11)
         .font('Helvetica')
         .fillColor('#374151')
         .text(`Payment Method: ${invoiceData.payment_details.payment_method}`, 50)
         .text(`Upfront Payment: $${invoiceData.payment_details.upfront_payment.toFixed(2)}`, 50)
         .text(`Remaining Balance: $${invoiceData.payment_details.remaining_balance.toFixed(2)}`, 50)
         .text(`Payment Status: ${invoiceData.payment_status.toUpperCase()}`, 50);

      // Installments (if any)
      if (invoiceData.payment_details.installments && invoiceData.payment_details.installments.length > 0) {
        doc.moveDown(1);
        doc.fontSize(12)
           .font('Helvetica-Bold')
           .fillColor('#374151')
           .text('Installment Schedule:', 50);

        doc.moveDown(0.5);
        invoiceData.payment_details.installments.forEach((installment, index) => {
          const status = installment.paid ? 'PAID' : 'PENDING';
          const paidDate = installment.paid_date ? ` (Paid: ${installment.paid_date})` : '';
          doc.fontSize(10)
             .font('Helvetica')
             .fillColor('#6b7280')
             .text(`Installment ${index + 1}: $${installment.amount.toFixed(2)} - Due: ${installment.due_date} - ${status}${paidDate}`, 70);
        });
      }

      doc.moveDown(3);

      // Notes section
      if (invoiceData.notes) {
        doc.fontSize(12)
           .font('Helvetica-Bold')
           .fillColor('#374151')
           .text('Notes:', 50);

        doc.moveDown(0.5);
        doc.fontSize(10)
           .font('Helvetica')
           .fillColor('#6b7280')
           .text(invoiceData.notes, 70);
      }

      doc.moveDown(3);

      // Footer
      doc.fontSize(10)
         .font('Helvetica')
         .fillColor('#9ca3af')
         .text('Thank you for choosing our rental services!', { align: 'center' });

      doc.moveDown(0.5);
      doc.text('For any questions, please contact us at info@rental.com or call (555) 123-4567', { align: 'center' });

      // Finalize the PDF
      doc.end();

    } catch (error) {
      reject(error);
    }
  });
};
