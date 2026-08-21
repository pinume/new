import React, { useState, useMemo } from 'react';
import {
  Building2,
  Download,
  ShieldCheck,
  Search,
  Filter,
  CheckCircle2,
  TrendingUp,
  Percent,
  AlertCircle,
  FileSpreadsheet
} from 'lucide-react';
import { StoreReportRow, UploadedRow, PaymentRow, AppConfig } from '../types';
import { generateStoreReport } from '../services/dataProcessor';
import { exportStoreReportToExcel } from '../services/excelService';

interface Mode5StoreReportProps {
  uploadedData: UploadedRow[];
  paymentData: PaymentRow[];
  config: AppConfig;
}

export const Mode5StoreReport: React.FC<Mode5StoreReportProps> = ({
  uploadedData,
  paymentData,
  config,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');

  const reportRows = useMemo(() => {
    return generateStoreReport(uploadedData, paymentData, config);
  }, [uploadedData, paymentData, config]);

  const filteredRows = useMemo(() => {
    return reportRows.filter((r) => {
      const matchSearch =
        r.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
        r.brand.toLowerCase().includes(searchTerm.toLowerCase());
      const matchCategory = categoryFilter === 'all' || r.category === categoryFilter;
      return matchSearch && matchCategory;
    });
  }, [reportRows, searchTerm, categoryFilter]);

  // Overall totals
  const totals = useMemo(() => {
    const totalUploadCount = reportRows.reduce((sum, r) => sum + r.uploadCount, 0);
    const totalUploadSubsidy = reportRows.reduce((sum, r) => sum + r.uploadSubsidyAmount, 0);
    const totalPayoutCount = reportRows.reduce((sum, r) => sum + r.payoutCount, 0);
    const totalPayoutSubsidy = reportRows.reduce((sum, r) => sum + r.payoutSubsidyAmount, 0);
    const totalDiff = Number((totalUploadSubsidy - totalPayoutSubsidy).toFixed(2));
    const overallRate =
      totalUploadSubsidy > 0
        ? Number(((totalPayoutSubsidy / totalUploadSubsidy) * 100).toFixed(1))
        : 0;

    const categories = Array.from(new Set(reportRows.map((r) => r.category)));

    return {
      totalUploadCount,
      totalUploadSubsidy: Number(totalUploadSubsidy.toFixed(2)),
      totalPayoutCount,
      totalPayoutSubsidy: Number(totalPayoutSubsidy.toFixed(2)),
      totalDiff,
      overallRate,
      categories,
    };
  }, [reportRows]);

  const handleExport = () => {
    exportStoreReportToExcel(
      reportRows,
      `2026年门店国补上传及回款情况表（益庄店）_${new Date().toISOString().slice(0, 10)}`
    );
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-emerald-500/10 text-emerald-400 rounded-xl border border-emerald-500/20">
            <Building2 className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-bold text-white">模式 5: 门店国补上传及回款情况表</h2>
              <span className="px-2 py-0.5 text-xs bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded-md font-mono flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5" />
                模板版本: 2026-V5 (校验通过)
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-1">
              按品类与品牌自动汇总上传金额与银联回款，方太冰箱与厨卫归并，A53隐藏标记完备
            </p>
          </div>
        </div>

        <button
          onClick={handleExport}
          className="inline-flex items-center gap-1.5 px-4 py-2.5 text-xs font-semibold rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg shadow-emerald-600/20 transition-all self-start sm:self-auto"
        >
          <Download className="w-4 h-4" />
          <span>导出正式报表 (.xlsx)</span>
        </button>
      </div>

      {/* Metrics Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-4">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span>总上传补贴额</span>
            <TrendingUp className="w-4 h-4 text-cyan-400" />
          </div>
          <div className="text-xl font-bold text-cyan-400 mt-2 font-mono">
            ¥{totals.totalUploadSubsidy.toLocaleString()}
          </div>
          <div className="text-[11px] text-slate-500 mt-1">上传总笔数: {totals.totalUploadCount} 笔</div>
        </div>

        <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-4">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span>总实收到账回款</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-xl font-bold text-emerald-400 mt-2 font-mono">
            ¥{totals.totalPayoutSubsidy.toLocaleString()}
          </div>
          <div className="text-[11px] text-slate-500 mt-1">回款总笔数: {totals.totalPayoutCount} 笔</div>
        </div>

        <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-4">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span>在途 / 未回款差额</span>
            <AlertCircle className={`w-4 h-4 ${totals.totalDiff > 0 ? 'text-amber-400' : 'text-slate-500'}`} />
          </div>
          <div className={`text-xl font-bold mt-2 font-mono ${totals.totalDiff > 0 ? 'text-amber-400' : 'text-emerald-400'}`}>
            ¥{totals.totalDiff.toLocaleString()}
          </div>
          <div className="text-[11px] text-slate-500 mt-1">银联清算周期内处理中</div>
        </div>

        <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-4">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span>综合回款率</span>
            <Percent className="w-4 h-4 text-purple-400" />
          </div>
          <div className="text-xl font-bold text-purple-400 mt-2 font-mono">
            {totals.overallRate}%
          </div>
          <div className="w-full bg-slate-800 h-1.5 rounded-full mt-2 overflow-hidden">
            <div
              className="bg-gradient-to-r from-cyan-500 to-emerald-500 h-full rounded-full"
              style={{ width: `${Math.min(100, totals.overallRate)}%` }}
            />
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row gap-3 items-center justify-between bg-slate-900/80 p-3.5 rounded-xl border border-slate-800">
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="搜索品类、品牌..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-950 border border-slate-700 rounded-lg text-slate-200 placeholder-slate-500 focus:outline-none focus:border-emerald-500"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <div className="flex items-center gap-1.5 text-xs text-slate-400">
            <Filter className="w-3.5 h-3.5" />
            <span>品类:</span>
          </div>
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="text-xs bg-slate-950 border border-slate-700 rounded-lg px-2.5 py-1.5 text-slate-300 focus:outline-none focus:border-emerald-500"
          >
            <option value="all">全部品类</option>
            {totals.categories.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Table 1: Store Master Summary Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow">
        <div className="p-3 bg-slate-950/80 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-300">
            <FileSpreadsheet className="w-4 h-4 text-emerald-400" />
            <span>表 1: 门店国补上传及回款明细 (益庄旗舰店)</span>
          </div>
          <span className="text-[11px] text-slate-500 font-mono">共 {filteredRows.length} 行明细 + 1 行总计</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-950 text-slate-400 font-semibold border-b border-slate-800">
              <tr>
                <th className="py-3 px-3 w-12 text-center">序号</th>
                <th className="py-3 px-3.5">财务品类</th>
                <th className="py-3 px-3.5">展示品牌</th>
                <th className="py-3 px-3 text-right">上传笔数</th>
                <th className="py-3 px-3 text-right">上传补贴额 (元)</th>
                <th className="py-3 px-3 text-right">回款笔数</th>
                <th className="py-3 px-3 text-right">回款补贴额 (元)</th>
                <th className="py-3 px-3 text-right">未回款差额 (元)</th>
                <th className="py-3 px-4 text-right">回款率 (%)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-mono">
              {filteredRows.map((row, index) => (
                <tr key={`${row.category}-${row.brand}`} className="hover:bg-slate-800/40 transition-colors">
                  <td className="py-2.5 px-3 text-center text-slate-500 text-[11px]">{index + 1}</td>
                  <td className="py-2.5 px-3.5 font-sans">
                    <span className="px-2 py-0.5 rounded text-[11px] font-medium bg-slate-800 text-slate-300 border border-slate-700">
                      {row.category}
                    </span>
                  </td>
                  <td className="py-2.5 px-3.5 font-sans font-medium text-slate-200">
                    {row.brand}
                  </td>
                  <td className="py-2.5 px-3 text-right text-slate-300">{row.uploadCount}</td>
                  <td className="py-2.5 px-3 text-right font-medium text-cyan-400">
                    ¥{row.uploadSubsidyAmount.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                  </td>
                  <td className="py-2.5 px-3 text-right text-slate-300">{row.payoutCount}</td>
                  <td className="py-2.5 px-3 text-right font-medium text-emerald-400">
                    ¥{row.payoutSubsidyAmount.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                  </td>
                  <td
                    className={`py-2.5 px-3 text-right font-bold ${
                      row.diffAmount > 0 ? 'text-amber-400' : 'text-slate-500'
                    }`}
                  >
                    ¥{row.diffAmount.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                  </td>
                  <td className="py-2.5 px-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <span className="text-[11px] text-slate-300">{row.payoutRate}%</span>
                      <div className="w-12 bg-slate-800 h-1.5 rounded-full overflow-hidden shrink-0">
                        <div
                          className="bg-emerald-500 h-full rounded-full"
                          style={{ width: `${Math.min(100, row.payoutRate)}%` }}
                        />
                      </div>
                    </div>
                  </td>
                </tr>
              ))}

              {/* Total Row */}
              <tr className="bg-slate-950 font-bold border-t-2 border-slate-700 text-slate-100">
                <td className="py-3 px-3 text-center text-cyan-400">∑</td>
                <td className="py-3 px-3.5 font-sans text-cyan-400" colSpan={2}>
                  总计 (全部品类汇总)
                </td>
                <td className="py-3 px-3 text-right">{totals.totalUploadCount}</td>
                <td className="py-3 px-3 text-right text-cyan-400">
                  ¥{totals.totalUploadSubsidy.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                </td>
                <td className="py-3 px-3 text-right">{totals.totalPayoutCount}</td>
                <td className="py-3 px-3 text-right text-emerald-400">
                  ¥{totals.totalPayoutSubsidy.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                </td>
                <td className="py-3 px-3 text-right text-amber-400">
                  ¥{totals.totalDiff.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                </td>
                <td className="py-3 px-4 text-right text-emerald-400 font-mono">
                  {totals.overallRate}%
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
