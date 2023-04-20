import PDFDocument from "pdfkit";
import fs from "fs";
import path, { resolve } from "path";
import dotenv from "dotenv";
dotenv.config();

export const generateInvoice = async (invoiceData, productDetails) => {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument();
    const invoicePath = path.join("invoices", "invoice.pdf"); // Path to save the generated PDF

    // Pipe PDF document to a writable stream
    doc.pipe(fs.createWriteStream(invoicePath));

    // Add content to the PDF
    doc.fontSize(14).text("Invoice", { underline: true });
    doc.font("Helvetica-Bold").fontSize(25).fillColor("black");
    doc.text("e shopee", { align: "right" });

    // Add delivery address field
    doc.text("Delivery Address:", { underline: true });
    doc.fontSize(14).text(`Name: ${invoiceData?.address.full_name}`);
    doc.text(`Street: ${invoiceData?.address.street_name}`);
    doc.text(`Apartment: ${invoiceData?.address.apartment_number}`);
    doc.text(`City: ${invoiceData?.address.city}`);
    doc.text(`State: ${invoiceData?.address.state}`);
    doc.text(`Postal Code: ${invoiceData?.address.postal_code}`);
    doc.text(`Mobile Number: ${invoiceData?.address.mobile_Number}`);

    // Add seller address field
    doc.text("Seller Address:", { underline: true });
    doc.fontSize(14).text(`Name: e shopee logistics ltd`);
    doc.text(`Street: Kakkanad`);
    doc.text(`City: Cochin`);
    doc.text(`State: Kerala`);
    doc.text(`Postal Code: 652021`);
    doc.text(`Mobile Number: 9888552210`);

    doc.text("------------------------------");
    doc.fontSize(16).text("Items:", { underline: true });
    productDetails.forEach((item) => {
      doc
        .fontSize(14)
        .text(`${item.name} - ${item.quantity} - Rs ${item.price}`);
    });
    doc.text("------------------------------");
    doc.fontSize(16).text(`Total: Rs ${invoiceData?.total_amount}`);

    // End the PDF document
    doc.end();

    // Resolve with the generated invoice file path
    resolve(invoicePath);
  });
};

export const generateSalesReport = async (orders) => {
  return new Promise((resolve, reject) => {
    // Create a new PDF document
    const doc = new PDFDocument();
    const salesPath = path.join("sales", "sales_report.pdf"); // Path to save the generated PDF

    doc.pipe(fs.createWriteStream(salesPath));

    // Set up the PDF document properties

    doc.font("Helvetica-Bold");
    doc.fontSize(20).text("Sales Report", { align: "center" });

    // Loop through each order in the orders array
    orders.forEach((order) => {
      doc.moveDown(1);
      doc.font("Helvetica-Bold").fontSize(16).text(`Order ID: ${order?._id}`);
      doc
        .font("Helvetica")
        .fontSize(12)
        .text(`Total Amount: $${order?.total_amount}`);
      doc
        .font("Helvetica")
        .fontSize(12)
        .text(`Payment Status: ${order?.payment_status}`);
      doc
        .font("Helvetica")
        .fontSize(12)
        .text(`Order Status: ${order?.order_status}`);
      doc
        .font("Helvetica")
        .fontSize(12)
        .text(`Order Date: ${order?.order_date}`);
      doc
        .font("Helvetica")
        .fontSize(12)
        .text(`Return Reason: ${order?.return_reason}`);
      doc
        .font("Helvetica")
        .fontSize(12)
        .text(`Return Status: ${order?.return_status}`);
      doc.font("Helvetica").fontSize(12).text(`Refund: ${order?.refund}`);
     doc.font("Helvetica").fontSize(12).text(`Items:`, { underline: true });

      // Loop through each item in the order's items array
      order.items.forEach((item) => {
        doc.font("Helvetica").fontSize(12).text(`- Item ID: ${item.itemId}`);
        doc
          .font("Helvetica")
          .fontSize(12)
          .text(`  Item Name: ${item?.itemName}`);
        doc.font("Helvetica").fontSize(12).text(`  Quantity: ${item.quantity}`);
        doc.font("Helvetica").fontSize(12).text(`  Price: $${item.price}`);
      });

      doc.moveDown(1);
    });
    resolve(salesPath);
  });
};
