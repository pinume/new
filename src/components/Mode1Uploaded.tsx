import React, { useState, useMemo } from 'react';
import {
  Layers,
  Search,
  Filter,
  Download,
  AlertTriangle,
  CheckCircle2,
  FileCheck,
  RefreshCw,
  TrendingUp,
  Cpu,
  Tv
} from 'lucide-react';
import { UploadedRow, AppConfig } from '../types';
import { exportToExcel } from '../services/excelService';

interface Mode1UploadedProps {
  data: UploadedRow[];
  config: AppConfig;
  onRefresh: () => void;
  isRunning: boolean;
}

export const Mode1Uploaded: React.FC<Mode1UploadedProps> = ({
  data,
  config,
  onRefresh,
  isRunning,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [typeFilter, setTypeFilter] = useState<string>('all');

  const filteredData = useMemo(() => {
    return data.filter((item) => {
      const matchSearch =
        item.txnNo.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.orderNo.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.productName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.brand.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.couponNo.toLowerCase().includes(searchTerm.toLowerCase());

      const matchStatus = statusFilter === 'all' || item.status === statusFilter;
      const matchType = typeFilter === 'all' || item.type === typeFilter;

      return matchSearch && matchStatus && matchType;
    });
  }, [data, searchTerm, statusFilter, typeFilter]);

  const stats = useMemo(() => {
    const validRows = data.filter((r) => r.status === '有效核销');
    const totalSubsidy = validRows.reduce((sum, r) => sum + r.subsidyAmount, 0);
    const totalSales = validRows.reduce((sum, r) => sum + r.salesAmount, 0);
    const applianceRows = validRows.filter((r) => r.type === '家电');
    const applianceSubsidy = applianceRows.reduce((sum, r) => sum + r.subsidyAmount, 0);
    const digitalRows = validRows.filter((r) => r.type === '数码');
    const digitalSubsidy = digitalRows.reduce((sum, r) => sum + r.subsidyAmount, 0);
    const anomalies = data.filter((r) => r.status !== '有效核销').length;

    return {
      totalCount: data.length,
      validCount: validRows.length,
      totalSubsidy: Number(totalSubsidy.toFixed(2)),
      totalSales: Number(totalSales.toFixed(2)),
      applianceCount: applianceRows.length,
      applianceSubsidy: Number(applianceSubsidy.toFixed(2)),
      digitalCount: digitalRows.length,
      digitalSubsidy: Number(digitalSubsidy.toFixed(2)),
      anomalies,
    };
  }, [data]);

  const handleExport = () => {
    const exportRows = filteredData.map((r, i) => ({
      序号: i + 1,
      交易流水号: r.txnNo,
      订单号: r.orderNo,
      补贴品类: r.type,
      编码品类: r.category,
      品牌: r.brand,
      商品名称: r.productName,
      销售金额: r.salesAmount,
      实付金额: r.paidAmount,
      补贴金额: r.subsidyAmount,
      券码: r.couponNo,
      核销状态: r.status,
      交易时间: r.txnTime,
      商户编号: r.merchantCode,
      异常原因: r.issueReason || '',
    }));
    exportToExcel(exportRows, `模式1_已上传数据清洗结果_${new Date().toISOString().slice(0, 10)}`);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner & Processing Info */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-cyan-500/10 text-cyan-400 rounded-xl border border-cyan-500/20">
              <Layers className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold text-white">模式 1: 已上传数据（家电 + 数码）</h2>
                <span className="px-2 py-0.5 text-xs bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded-md">
                  双流水线对齐
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-1">
                根据 <code className="text-cyan-300">config/merchants.yaml</code> 商户编号定位文件并自动完成数据清洗、去重与异常校验
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onRefresh}
              disabled={isRunning}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-colors"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isRunning ? 'animate-spin' : ''}`} />
              <span>重新校验</span>
            </button>
            <button
              onClick={handleExport}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white shadow-md shadow-cyan-600/20 transition-all"
            >
              <Download className="w-3.5 h-3.5" />
              <span>导出 Excel</span>
            </button>
          </div>
        </div>

        {/* Merchant Code Quick Reference */}
        <div className="mt-4 pt-4 border-t border-slate-800/80 grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
          <div className="flex items-center justify-between p-2.5 bg-slate-950/60 rounded-lg border border-slate-800">
            <div className="flex items-center gap-2 text-slate-300">
              <Tv className="w-4 h-4 text-cyan-400" />
              <span>家电商户编号：</span>
            </div>
            <code className="font-mono text-cyan-300 font-semibold">{config.merchants.merchants.家电}</code>
          </div>
          <div className="flex items-center justify-between p-2.5 bg-slate-950/60 rounded-lg border border-slate-800">
            <div className="flex items-center gap-2 text-slate-300">
              <Cpu className="w-4 h-4 text-purple-400" />
              <span>数码商户编号：</span>
            </div>
            <code className="font-mono text-purple-300 font-semibold">{config.merchants.merchants.数码}</code>
          </div>
        </div>
      </div>

      {/* Metrics Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-4">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span>有效核销总额</span>
            <TrendingUp className="w-4 h-4 text-cyan-400" />
          </div>
          <div className="text-xl font-bold text-cyan-400 mt-2 font-mono">
            ¥{stats.totalSubsidy.toLocaleString()}
          </div>
          <div className="text-[11px] text-slate-500 mt-1">
            有效笔数: {stats.validCount} / 总行数: {stats.totalCount}
          </div>
        </div>

        <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-4">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span>家电补贴核销</span>
            <Tv className="w-4 h-4 text-blue-400" />
          </div>
          <div className="text-xl font-bold text-blue-400 mt-2 font-mono">
            ¥{stats.applianceSubsidy.toLocaleString()}
          </div>
          <div className="text-[11px] text-slate-500 mt-1">{stats.applianceCount} 笔绿色节能商品</div>
        </div>

        <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-4">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span>数码3C补贴核销</span>
            <Cpu className="w-4 h-4 text-purple-400" />
          </div>
          <div className="text-xl font-bold text-purple-400 mt-2 font-mono">
            ¥{stats.digitalSubsidy.toLocaleString()}
          </div>
          <div className="text-[11px] text-slate-500 mt-1">{stats.digitalCount} 笔手机/平板/穿戴</div>
        </div>

        <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-4">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span>异常/需复核项</span>
            <AlertTriangle className={`w-4 h-4 ${stats.anomalies > 0 ? 'text-amber-400' : 'text-slate-500'}`} />
          </div>
          <div className={`text-xl font-bold mt-2 font-mono ${stats.anomalies > 0 ? 'text-amber-400' : 'text-emerald-400'}`}>
            {stats.anomalies} 笔
          </div>
          <div className="text-[11px] text-slate-500 mt-1">包含疑似退款与重复流水</div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row gap-3 items-center justify-between bg-slate-900/80 p-3.5 rounded-xl border border-slate-800">
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="搜索流水号、订单号、品牌、券码..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-950 border border-slate-700 rounded-lg text-slate-200 placeholder-slate-500 focus:outline-none focus:border-cyan-500"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <div className="flex items-center gap-1.5 text-xs text-slate-400">
            <Filter className="w-3.5 h-3.5" />
            <span>状态:</span>
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="text-xs bg-slate-950 border border-slate-700 rounded-lg px-2.5 py-1.5 text-slate-300 focus:outline-none focus:border-cyan-500"
          >
            <option value="all">全部状态</option>
            <option value="有效核销">有效核销</option>
            <option value="疑似退款">疑似退款</option>
            <option value="金额不符">金额不符</option>
            <option value="重复流水">重复流水</option>
          </select>

          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="text-xs bg-slate-950 border border-slate-700 rounded-lg px-2.5 py-1.5 text-slate-300 focus:outline-none focus:border-cyan-500"
          >
            <option value="all">全部品类</option>
            <option value="家电">家电</option>
            <option value="数码">数码</option>
          </select>
        </div>
      </div>

      {/* Main Data Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-950 text-slate-400 font-semibold border-b border-slate-800">
              <tr>
                <th className="py-3 px-3.5">交易流水号 / 订单号</th>
                <th className="py-3 px-3">品类</th>
                <th className="py-3 px-3">品牌 / 商品名称</th>
                <th className="py-3 px-3 text-right">销售金额</th>
                <th className="py-3 px-3 text-right">补贴金额</th>
                <th className="py-3 px-3">券码</th>
                <th className="py-3 px-3">交易时间</th>
                <th className="py-3 px-3">核销状态</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-mono">
              {filteredData.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-8 text-center text-slate-500">
                    未找到匹配的数据
                  </td>
                </tr>
              ) : (
                filteredData.map((row) => {
                  let statusBadge = (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                      <CheckCircle2 className="w-3 h-3" />
                      有效核销
                    </span>
                  );

                  if (row.status === '疑似退款') {
                    statusBadge = (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] bg-amber-500/10 text-amber-400 border border-amber-500/20">
                        <AlertTriangle className="w-3 h-3" />
                        疑似退款
                      </span>
                    );
                  } else if (row.status === '重复流水') {
                    statusBadge = (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] bg-rose-500/10 text-rose-400 border border-rose-500/20">
                        <AlertTriangle className="w-3 h-3" />
                        重复流水
                      </span>
                    );
                  }

                  return (
                    <tr key={row.id} className="hover:bg-slate-800/40 transition-colors">
                      <td className="py-3 px-3.5">
                        <div className="font-semibold text-slate-200">{row.txnNo}</div>
                        <div className="text-[11px] text-slate-500">{row.orderNo}</div>
                      </td>
                      <td className="py-3 px-3 font-sans">
                        <span
                          className={`px-2 py-0.5 rounded text-[11px] font-medium ${
                            row.type === '家电'
                              ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20'
                              : 'bg-purple-500/10 text-purple-400 border border-purple-500/20'
                          }`}
                        >
                          {row.type} · {row.category.split('-')[1] || row.category}
                        </span>
                      </td>
                      <td className="py-3 px-3 font-sans max-w-xs">
                        <div className="text-slate-200 font-medium truncate" title={row.productName}>
                          {row.productName}
                        </div>
                        <div className="text-[11px] text-slate-400">品牌: {row.brand}</div>
                      </td>
                      <td className="py-3 px-3 text-right text-slate-300">
                        ¥{row.salesAmount.toLocaleString()}
                      </td>
                      <td className="py-3 px-3 text-right font-bold text-cyan-400">
                        ¥{row.subsidyAmount.toLocaleString()}
                      </td>
                      <td className="py-3 px-3 text-[11px] text-slate-400">{row.couponNo}</td>
                      <td className="py-3 px-3 text-[11px] text-slate-400 font-sans">{row.txnTime}</td>
                      <td className="py-3 px-3 font-sans">{statusBadge}</td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
