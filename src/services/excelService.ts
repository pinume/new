import * as XLSX from 'xlsx';
import { UploadedRow, ReceiptRow, PaymentRow, CouponAuditRow, StoreReportRow } from '../types';

export function exportToExcel(data: any[], fileName: string, sheetName = 'Sheet1') {
  const ws = XLSX.utils.json_to_sheet(data);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, sheetName);
  XLSX.writeFile(wb, `${fileName}.xlsx`);
}

export function exportStoreReportToExcel(reportRows: StoreReportRow[], fileName: string) {
  const wb = XLSX.utils.book_new();

  // Create Table 1 Header & rows
  const exportData = reportRows.map((r, index) => ({
    序号: index + 1,
    品类: r.category,
    品牌: r.brand,
    上传笔数: r.uploadCount,
    '上传补贴额(元)': r.uploadSubsidyAmount,
    回款笔数: r.payoutCount,
    '回款补贴额(元)': r.payoutSubsidyAmount,
    '未回款差额(元)': r.diffAmount,
    '回款率(%)': `${r.payoutRate}%`,
  }));

  // Totals
  const totalUploadCount = reportRows.reduce((sum, r) => sum + r.uploadCount, 0);
  const totalUploadSubsidy = reportRows.reduce((sum, r) => sum + r.uploadSubsidyAmount, 0);
  const totalPayoutCount = reportRows.reduce((sum, r) => sum + r.payoutCount, 0);
  const totalPayoutSubsidy = reportRows.reduce((sum, r) => sum + r.payoutSubsidyAmount, 0);
  const totalDiff = Number((totalUploadSubsidy - totalPayoutSubsidy).toFixed(2));
  const totalRate = totalUploadSubsidy > 0 ? ((totalPayoutSubsidy / totalUploadSubsidy) * 100).toFixed(1) : '0.0';

  exportData.push({
    序号: '总计' as any,
    品类: '全部品类',
    品牌: '全品牌',
    上传笔数: totalUploadCount,
    '上传补贴额(元)': Number(totalUploadSubsidy.toFixed(2)),
    回款笔数: totalPayoutCount,
    '回款补贴额(元)': Number(totalPayoutSubsidy.toFixed(2)),
    '未回款差额(元)': totalDiff,
    '回款率(%)': `${totalRate}%`,
  });

  const ws = XLSX.utils.json_to_sheet(exportData);

  // Hidden version identifier in A53 according to 2026-V5 specification
  // Ensure cell A53 has the version tag: "模板版本：2026-V5"
  ws['A53'] = { t: 's', v: '模板版本：2026-V5' };

  XLSX.utils.book_append_sheet(wb, ws, '门店国补上传及回款情况表');
  XLSX.writeFile(wb, `${fileName}.xlsx`);
}

export function parseExcelFile(file: File): Promise<any[]> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target?.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: 'array' });
        const firstSheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[firstSheetName];
        const json = XLSX.utils.sheet_to_json(worksheet);
        resolve(json);
      } catch (err) {
        reject(err);
      }
    };
    reader.onerror = (error) => reject(error);
    reader.readAsArrayBuffer(file);
  });
}
