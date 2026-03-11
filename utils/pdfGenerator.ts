import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { Transaction, Member } from '../types';

export const generateReceiptPDF = (transaction: Transaction, member: Member) => {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a5' // Formato recibo
  });

  // Colores de marca
  const orange = [249, 115, 22]; // #f97316
  const dark = [17, 24, 39]; // #111827

  // Cabecera
  doc.setFillColor(dark[0], dark[1], dark[2]);
  doc.rect(0, 0, 148, 30, 'F');
  
  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(22);
  doc.text('GymMaster', 10, 20);
  doc.setTextColor(orange[0], orange[1], orange[2]);
  doc.text('PRO', 55, 20);

  doc.setFontSize(10);
  doc.setTextColor(255, 255, 255);
  doc.text('RECIBO DE PAGO OFICIAL', 100, 20);

  // Información del Pago
  doc.setTextColor(dark[0], dark[1], dark[2]);
  doc.setFontSize(12);
  doc.text('DETALLES DEL SOCIO:', 10, 45);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  doc.text(`Nombre: ${member.nombre}`, 10, 52);
  doc.text(`Email: ${member.email}`, 10, 58);
  doc.text(`ID Socio: ${member.id.substring(0, 8)}`, 10, 64);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12);
  doc.text('DETALLES DE TRANSACCIÓN:', 80, 45);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  doc.text(`Folio: ${transaction.id.substring(0, 8).toUpperCase()}`, 80, 52);
  doc.text(`Fecha: ${new Date(transaction.fecha).toLocaleDateString()}`, 80, 58);
  doc.text(`Método: ${transaction.metodo}`, 80, 64);

  // Tabla de conceptos
  autoTable(doc, {
    startY: 75,
    head: [['Descripción', 'Concepto', 'Monto']],
    body: [[
      `Pago de Membresía ${transaction.tipo}`,
      'Servicio Gimnasio',
      `$${transaction.monto.toFixed(2)} MXN`
    ]],
    headStyles: { fillColor: [17, 24, 39], textColor: [255, 255, 255], fontStyle: 'bold' },
    styles: { fontSize: 10, cellPadding: 5 },
  });

  // Total
  const finalY = (doc as any).lastAutoTable.finalY + 10;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(14);
  doc.text(`TOTAL PAGADO:`, 80, finalY);
  doc.setTextColor(orange[0], orange[1], orange[2]);
  doc.text(`$${transaction.monto.toFixed(2)} MXN`, 118, finalY);

  // Footer / Firma
  doc.setTextColor(150, 150, 150);
  doc.setFontSize(8);
  doc.text('Este documento es un comprobante de pago electrónico.', 10, 140);
  doc.text('GymMaster PRO - Aurum Capital', 10, 144);

  doc.save(`Recibo_${transaction.id.substring(0, 8)}.pdf`);
};

export const generateFinanceReportPDF = (transactions: Transaction[], stats: any) => {
  const doc = new jsPDF();

  const orange = [249, 115, 22];
  const dark = [17, 24, 39];

  // Cabecera Reporte
  doc.setFillColor(dark[0], dark[1], dark[2]);
  doc.rect(0, 0, 210, 40, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(24);
  doc.text('GymMaster PRO', 10, 25);
  doc.setFontSize(12);
  doc.text('REPORTE FINANCIERO MENSUAL', 140, 25);

  // Resumen Ejecutivo
  doc.setTextColor(dark[0], dark[1], dark[2]);
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text('RESUMEN EJECUTIVO', 10, 55);

  autoTable(doc, {
    startY: 60,
    body: [
      ['Ingresos Totales', `$${stats.totalIngresos.toLocaleString()} MXN`],
      ['Transacciones Realizadas', `${transactions.length}`],
      ['Ticket Promedio', `$${(stats.totalIngresos / (transactions.length || 1)).toFixed(2)} MXN`],
      ['Fecha de Reporte', new Date().toLocaleDateString()]
    ],
    styles: { fontSize: 10 },
    columnStyles: { 0: { fontStyle: 'bold', cellWidth: 50 } }
  });

  // Listado de Transacciones
  doc.text('HISTORIAL DE MOVIMIENTOS', 10, (doc as any).lastAutoTable.finalY + 15);

  autoTable(doc, {
    startY: (doc as any).lastAutoTable.finalY + 20,
    head: [['ID', 'Fecha', 'Método', 'Tipo', 'Monto']],
    body: transactions.map(t => [
      t.id.substring(0, 8).toUpperCase(),
      new Date(t.fecha).toLocaleDateString(),
      t.metodo,
      t.tipo,
      `$${t.monto.toFixed(2)}`
    ]),
    headStyles: { fillColor: [249, 115, 22] },
    styles: { fontSize: 9 }
  });

  doc.save(`Reporte_Financiero_${new Date().getMonth() + 1}.pdf`);
};
