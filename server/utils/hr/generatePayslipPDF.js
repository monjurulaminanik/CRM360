const PDFDocument = require('pdfkit');

/**
 * Compiles a high-fidelity PDF payslip in memory and returns a Buffer.
 * Fully formatted with brand styling and local BDT currency symbols.
 */
const generatePayslipPDF = (payroll) => {
  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument({ margin: 50, size: 'A4' });
      const buffers = [];

      doc.on('data', (chunk) => buffers.push(chunk));
      doc.on('end', () => {
        const pdfData = Buffer.concat(buffers);
        resolve(pdfData);
      });

      const {
        employee,
        month,
        year,
        basicSalary,
        totalAllowances,
        totalDeductions,
        bonus,
        taxDeducted,
        netSalary,
        workingDays,
        presentDays,
        overtime,
      } = payroll;

      const empName = employee.fullName || `${employee.firstName} ${employee.lastName}`;

      // ── Logo and Corporate Header ──────────────────────────────────────────
      doc.fillColor('#2D55FF')
         .fontSize(22)
         .text('Dawat IT & Consultancy', 50, 50)
         .fontSize(10)
         .fillColor('#4B5563')
         .text('All-in-One Client OS (D360)', 50, 78)
         .text('Dhaka, Bangladesh · www.dawatit.com', 50, 92);

      // Payslip Title info
      doc.fillColor('#1F2937')
         .fontSize(15)
         .text('MONTHLY PAYSLIP', 400, 50, { align: 'right' })
         .fontSize(10)
         .fillColor('#4B5563')
         .text(`Period: ${month}/${year}`, 400, 73, { align: 'right' })
         .text('Status: COMPLETED', 400, 87, { align: 'right' });

      doc.strokeColor('#E5E7EB').lineWidth(1).moveTo(50, 115).lineTo(545, 115).stroke();

      // ── Employee metadata block ─────────────────────────────────────────────
      doc.fontSize(11)
         .fillColor('#1F2937')
         .text(`Employee ID:  ${employee.employeeId || 'N/A'}`, 50, 130)
         .text(`Name:         ${empName}`, 50, 145)
         .text(`Designation:  ${employee.designation || 'Software Engineer'}`, 50, 160);

      doc.text(`Working Days:  ${workingDays}`, 320, 130)
         .text(`Present Days:  ${presentDays}`, 320, 145)
         .text(`Overtime Hours: ${overtime} hrs`, 320, 160);

      doc.strokeColor('#E5E7EB').lineWidth(1).moveTo(50, 185).lineTo(545, 185).stroke();

      // ── Earnings vs Deductions Table ────────────────────────────────────────
      doc.fontSize(12).fillColor('#2D55FF').text('Salary Details Summary', 50, 205);

      // Table headers
      doc.fontSize(10).fillColor('#4B5563')
         .text('Earnings', 50, 225)
         .text('Amount (BDT)', 220, 225, { align: 'right' })
         .text('Deductions', 310, 225)
         .text('Amount (BDT)', 480, 225, { align: 'right' });

      doc.strokeColor('#2D55FF').lineWidth(1.5).moveTo(50, 240).lineTo(545, 240).stroke();

      // Table Row 1: Basic & Income Tax
      doc.fillColor('#1F2937')
         .text('Basic Salary', 50, 255)
         .text(`৳${basicSalary.toLocaleString('en-IN')}`, 220, 255, { align: 'right' })
         .text('Income Tax', 310, 255)
         .text(`৳${taxDeducted.toLocaleString('en-IN')}`, 480, 255, { align: 'right' });

      // Table Row 2: Allowances & Deductions
      doc.text('Performance Allowances', 50, 275)
         .text(`৳${totalAllowances.toLocaleString('en-IN')}`, 220, 275, { align: 'right' })
         .text('Other Deductions', 310, 275)
         .text(`৳${totalDeductions.toLocaleString('en-IN')}`, 480, 275, { align: 'right' });

      // Table Row 3: Bonus
      doc.text('Bonus & Incentives', 50, 295)
         .text(`৳${bonus.toLocaleString('en-IN')}`, 220, 295, { align: 'right' })
         .text('', 310, 295)
         .text('', 480, 295);

      doc.strokeColor('#E5E7EB').lineWidth(1).moveTo(50, 315).lineTo(545, 315).stroke();

      // ── Sub-totals summary ──────────────────────────────────────────────────
      const totalEarnings = basicSalary + totalAllowances + bonus;
      const totalDeductionsCombined = taxDeducted + totalDeductions;

      doc.fontSize(10).fillColor('#4B5563')
         .text('Total Earnings:', 50, 330)
         .text(`৳${totalEarnings.toLocaleString('en-IN')}`, 220, 330, { align: 'right' })
         .text('Total Deductions:', 310, 330)
         .text(`৳${totalDeductionsCombined.toLocaleString('en-IN')}`, 480, 330, { align: 'right' });

      doc.strokeColor('#E5E7EB').lineWidth(1).moveTo(50, 350).lineTo(545, 350).stroke();

      // ── High-contrast Take-Home Net Pay block ───────────────────────────────
      doc.rect(50, 370, 495, 45).fill('#EFF6FF');
      doc.fillColor('#1E3A8A').fontSize(13).text('Net Take-Home Salary:', 70, 386);
      doc.text(`৳${netSalary.toLocaleString('en-IN')}`, 430, 386, { align: 'right' });

      // ── Footnote & Disclaimer ───────────────────────────────────────────────
      doc.fontSize(8).fillColor('#9CA3AF')
         .text('This is a system-generated operational payslip and does not require a physical signature.', 50, 720, { align: 'center' })
         .text('Generated via D360 Human Resource Suite.', 50, 735, { align: 'center' });

      doc.end();
    } catch (err) {
      reject(err);
    }
  });
};

module.exports = generatePayslipPDF;
