import React, { useState } from 'react';
import {
  Upload,
  X,
  FileSpreadsheet,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  Sparkles
} from 'lucide-react';
import { parseExcelFile } from '../services/excelService';

interface FileUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onImportData: (type: string, rows: any[], fileName: string) => void;
}

export const FileUploadModal: React.FC<FileUploadModalProps> = ({
  isOpen,
  onClose,
  onImportData,
}) => {
  const [selectedType, setSelectedType] = useState<string>('uploaded');
  const [isProcessing, setIsProcessing] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsProcessing(true);
    try {
      const rows = await parseExcelFile(file);
      onImportData(selectedType, rows, file.name);
      setSuccessMsg(`成功导入 ${file.name}，共解析 ${rows.length} 行数据！`);
      setTimeout(() => {
        setSuccessMsg(null);
        onClose();
      }, 1500);
    } catch (err: any) {
      alert(`解析 Excel 失败: ${err.message}`);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-xs p-4">
      <div className="bg-slate-900 border border-slate-700 rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-5">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <Upload className="w-5 h-5 text-cyan-400" />
            <h3 className="text-base font-bold text-white">导入数据文件 (data/ 目录)</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="space-y-3">
          <label className="block text-xs font-semibold text-slate-300">
            选择导入的数据目标类型：
          </label>
          <div className="grid grid-cols-2 gap-2">
            {[
              { id: 'uploaded', label: '1. 已上传数据 (家电/数码)' },
              { id: 'receipts', label: '2. 门店收款单流水' },
              { id: 'payment', label: '3. 银联回款清算明细' },
              { id: 'coupons', label: '4. 销售用券审核明细' },
            ].map((t) => (
              <button
                key={t.id}
                onClick={() => setSelectedType(t.id)}
                className={`p-2.5 rounded-xl border text-xs text-left transition-all ${
                  selectedType === t.id
                    ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/50'
                    : 'bg-slate-950 text-slate-400 border-slate-800 hover:border-slate-700'
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>
        </div>

        {/* Drag and Drop Box */}
        <div className="border-2 border-dashed border-slate-700 hover:border-cyan-500/60 rounded-xl p-6 text-center bg-slate-950/60 transition-colors">
          <FileSpreadsheet className="w-10 h-10 text-slate-500 mx-auto mb-2" />
          <div className="text-xs text-slate-300 font-medium">
            点击或拖拽 Excel 文件 (.xlsx, .xls) 到此处
          </div>
          <p className="text-[11px] text-slate-500 mt-1">
            支持标准导出格式与多列映射自动识别
          </p>

          <label className="mt-4 inline-flex items-center gap-1.5 px-4 py-2 bg-cyan-600 hover:bg-cyan-500 text-white rounded-lg text-xs font-semibold cursor-pointer shadow-md shadow-cyan-600/20 transition-all">
            <Upload className="w-3.5 h-3.5" />
            <span>选择本地文件</span>
            <input
              type="file"
              accept=".xlsx,.xls,.csv"
              onChange={handleFileUpload}
              className="hidden"
              disabled={isProcessing}
            />
          </label>
        </div>

        {successMsg && (
          <div className="p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-xl text-xs text-emerald-400 flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>{successMsg}</span>
          </div>
        )}

        <div className="text-[11px] text-slate-500 flex items-start gap-1.5">
          <Sparkles className="w-3.5 h-3.5 text-cyan-400 shrink-0 mt-0.5" />
          <span>
            系统内置自动数据规范化，即使字段标题顺序不同也会智能匹配至对应属性。
          </span>
        </div>
      </div>
    </div>
  );
};
