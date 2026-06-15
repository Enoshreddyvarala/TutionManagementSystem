import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import type { FeeTransaction, Student } from '@/types';
import { formatCurrency, formatDate } from '@/lib/utils';
import { formatCoveredMonths } from '@/lib/fees/ledger';

interface ReceiptData {
  transaction: FeeTransaction;
  student: Student;
  instituteName?: string;
  instituteAddress?: string;
  coveredMonths?: string[];
}

export function generateReceiptPDF(data: ReceiptData): jsPDF {
  const { transaction, student, instituteName = 'Tuition Management System', instituteAddress = '', coveredMonths = [] } = data;

  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();

  // Header
  doc.setFontSize(18);
  doc.setFont('helvetica', 'bold');
  doc.text(instituteName, pageWidth / 2, 20, { align: 'center' });

  if (instituteAddress) {
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text(instituteAddress, pageWidth / 2, 28, { align: 'center' });
  }

  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text('FEE RECEIPT', pageWidth / 2, 42, { align: 'center' });

  doc.setLineWidth(0.5);
  doc.line(20, 46, pageWidth - 20, 46);

  // Receipt details
  const startY = 55;
  doc.setFontSize(11);
  doc.setFont('helvetica', 'normal');

  const details = [
    ['Receipt No:', transaction.receipt_number],
    ['Date:', formatDate(transaction.payment_date)],
    ['Student Name:', student.name],
    ['Student ID:', student.student_code],
    ['Amount Paid:', formatCurrency(transaction.amount)],
    ['Payment Mode:', transaction.payment_mode.replace('_', ' ').toUpperCase()],
  ];

  if (transaction.remarks) {
    details.push(['Remarks:', transaction.remarks]);
  }

  let y = startY;
  details.forEach(([label, value]) => {
    doc.setFont('helvetica', 'bold');
    doc.text(label, 20, y);
    doc.setFont('helvetica', 'normal');
    doc.text(String(value), 70, y);
    y += 8;
  });

  if (coveredMonths.length > 0) {
    y += 5;
    doc.setFont('helvetica', 'bold');
    doc.text('Covered Months:', 20, y);
    doc.setFont('helvetica', 'normal');
    doc.text(formatCoveredMonths(coveredMonths), 70, y);
  }

  // Amount box
  y += 15;
  doc.setFillColor(240, 240, 240);
  doc.rect(20, y, pageWidth - 40, 20, 'F');
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text(`Total: ${formatCurrency(transaction.amount)}`, pageWidth / 2, y + 13, { align: 'center' });

  // Footer
  doc.setFontSize(9);
  doc.setFont('helvetica', 'italic');
  doc.text('This is a computer-generated receipt.', pageWidth / 2, 270, { align: 'center' });
  doc.text(`Generated on ${formatDate(new Date())}`, pageWidth / 2, 276, { align: 'center' });

  return doc;
}

export function downloadReceipt(data: ReceiptData, filename?: string): void {
  const doc = generateReceiptPDF(data);
  doc.save(filename ?? `receipt-${data.transaction.receipt_number}.pdf`);
}

export function generateCollectionReportPDF(
  title: string,
  rows: Record<string, string | number>[],
  columns: { header: string; dataKey: string }[]
): jsPDF {
  const doc = new jsPDF('landscape');
  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.text(title, 14, 20);
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text(`Generated: ${formatDate(new Date())}`, 14, 28);

  autoTable(doc, {
    startY: 35,
    head: [columns.map((c) => c.header)],
    body: rows.map((row) => columns.map((c) => String(row[c.dataKey] ?? ''))),
    styles: { fontSize: 9 },
    headStyles: { fillColor: [59, 130, 246] },
  });

  return doc;
}
