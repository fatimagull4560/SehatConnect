export function printHtml(html: string, title = 'SehatConnect — Print') {
  const win = window.open('', '_blank', 'width=800,height=700');
  if (!win) {
    alert('Please allow pop-ups to print this document.');
    return;
  }
  win.document.write(`<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8" />
  <title>${title}</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body { font-family: 'Segoe UI', Arial, sans-serif; font-size: 13px; color: #1a1a1a; background: #fff; padding: 32px; }
    h1 { font-size: 22px; font-weight: 700; color: #1565C0; }
    h2 { font-size: 16px; font-weight: 700; color: #1565C0; margin-bottom: 4px; }
    h3 { font-size: 14px; font-weight: 700; margin-bottom: 4px; }
    .header { display: flex; justify-content: space-between; align-items: flex-start; padding-bottom: 16px; border-bottom: 2px solid #1565C0; margin-bottom: 20px; }
    .logo-area h1 { margin-bottom: 2px; }
    .logo-area p { color: #555; font-size: 11px; }
    .invoice-no { text-align: right; }
    .invoice-no .no { font-family: monospace; font-size: 18px; font-weight: 700; color: #1565C0; }
    .invoice-no .date { color: #555; font-size: 11px; margin-top: 4px; }
    .patient-box { background: #f5f7fa; border-radius: 8px; padding: 12px 16px; margin-bottom: 20px; }
    .patient-box .label { font-size: 10px; text-transform: uppercase; letter-spacing: 0.5px; color: #888; font-weight: 700; }
    .patient-box .value { font-weight: 700; font-size: 14px; }
    table { width: 100%; border-collapse: collapse; margin-bottom: 16px; }
    thead tr { background: #1565C0; color: #fff; }
    thead th { padding: 8px 12px; text-align: left; font-size: 12px; font-weight: 600; }
    tbody tr { border-bottom: 1px solid #e5e7eb; }
    tbody tr:nth-child(even) { background: #f9fafb; }
    tbody td { padding: 8px 12px; }
    .total-row { background: #EBF3FF !important; font-weight: 700; }
    .badge { display: inline-block; padding: 2px 10px; border-radius: 20px; font-size: 11px; font-weight: 700; text-transform: capitalize; }
    .badge-paid { background: #d1fae5; color: #065f46; }
    .badge-partial { background: #fef3c7; color: #92400e; }
    .badge-unpaid { background: #fee2e2; color: #991b1b; }
    .summary { display: flex; gap: 16px; margin-bottom: 20px; }
    .summary-box { flex: 1; border: 1px solid #e5e7eb; border-radius: 8px; padding: 12px; text-align: center; }
    .summary-box .s-label { font-size: 10px; text-transform: uppercase; color: #888; font-weight: 700; margin-bottom: 4px; }
    .summary-box .s-value { font-size: 16px; font-weight: 800; }
    .footer { margin-top: 32px; padding-top: 16px; border-top: 1px solid #e5e7eb; display: flex; justify-content: space-between; align-items: center; }
    .footer p { font-size: 10px; color: #888; }
    .watermark { color: #1565C0; font-weight: 700; font-size: 11px; }
    @media print {
      body { padding: 16px; }
      @page { margin: 1cm; }
    }
  </style>
</head>
<body>${html}<script>window.onload=function(){window.print();setTimeout(function(){window.close();},800);}<\/script></body>
</html>`);
  win.document.close();
}

export function buildInvoiceHtml(bill: {
  invoiceNo: string; patient: string; phone: string; date: string;
  services: { name: string; amount: number }[];
  totalAmount: number; paidAmount: number;
  status: string; paymentMethod: string;
}) {
  const balance = bill.totalAmount - bill.paidAmount;
  const statusBadge = `<span class="badge badge-${bill.status}">${bill.status}</span>`;
  const rows = bill.services.map(s => `
    <tr><td>${s.name}</td><td style="text-align:right;font-weight:600;">Rs ${s.amount.toLocaleString()}</td></tr>
  `).join('');

  return `
    <div class="header">
      <div class="logo-area">
        <h1>SehatConnect POS</h1>
        <p>Healthcare Management System • Quetta, Pakistan</p>
        <p style="margin-top:4px;font-size:10px;color:#888;">Tel: 0300-0000000 | info@sehatconnect.pk</p>
      </div>
      <div class="invoice-no">
        <div class="no">${bill.invoiceNo}</div>
        <div class="date">Date: ${bill.date}</div>
        <div style="margin-top:6px;">${statusBadge}</div>
      </div>
    </div>

    <div class="patient-box">
      <div style="display:flex;gap:32px;">
        <div><div class="label">Patient</div><div class="value">${bill.patient}</div></div>
        <div><div class="label">Phone</div><div class="value">${bill.phone || '—'}</div></div>
        <div><div class="label">Payment</div><div class="value">${bill.paymentMethod || '—'}</div></div>
      </div>
    </div>

    <h3>Services & Charges</h3>
    <table>
      <thead><tr><th>Description</th><th style="text-align:right;">Amount</th></tr></thead>
      <tbody>
        ${rows}
        <tr class="total-row">
          <td>Total</td>
          <td style="text-align:right;">Rs ${bill.totalAmount.toLocaleString()}</td>
        </tr>
        <tr>
          <td style="color:#065f46;">Amount Paid</td>
          <td style="text-align:right;color:#065f46;font-weight:700;">Rs ${bill.paidAmount.toLocaleString()}</td>
        </tr>
        ${balance > 0 ? `<tr><td style="color:#991b1b;">Balance Due</td><td style="text-align:right;color:#991b1b;font-weight:700;">Rs ${balance.toLocaleString()}</td></tr>` : ''}
      </tbody>
    </table>

    <div class="footer">
      <p>Thank you for choosing SehatConnect POS<br>This is a computer-generated invoice and does not require a signature.</p>
      <div class="watermark">SehatConnect POS</div>
    </div>
  `;
}

export function buildReportHtml(title: string, date: string, contentHtml: string) {
  return `
    <div class="header">
      <div class="logo-area">
        <h1>SehatConnect POS</h1>
        <p>Analytics & Reports • Quetta, Pakistan</p>
      </div>
      <div class="invoice-no">
        <div style="font-size:15px;font-weight:700;color:#1565C0;">${title}</div>
        <div class="date">Generated: ${date}</div>
      </div>
    </div>
    ${contentHtml}
    <div class="footer">
      <p>Generated by SehatConnect POS • Confidential Report</p>
      <div class="watermark">SehatConnect POS</div>
    </div>
  `;
}
