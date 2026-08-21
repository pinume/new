import React, { useState, useMemo } from 'react';
import {
  TicketCheck,
  Search,
  Filter,
  Download,
  CheckCircle2,
  AlertCircle,
  AlertTriangle,
  FileSpreadsheet,
  HelpCircle
} from 'lucide-react';
import { CouponAuditRow } from '../types';
import { exportToExcel } from '../services/excelService';

interface Mode4CouponAuditProps {
  data: CouponAuditRow[];
}

export const Mode4CouponAudit: React.FC<Mode4CouponAuditProps> = ({ data }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [matchStatusFilter, setMatchStatusFilter] = useState<string>('all');
  const [typeFilter, setTypeFilter] = useState<string>('all');

  const filteredData = useMemo(() => {
    return data.filter((item) => {
      const matchSearch =
        item.couponCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.posOrderNo.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.platformTxnNo.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.productName.toLowerCase().includes(searchTerm.toLowerCase());

      const matchStatus = matchStatusFilter === 'all' || item.matchStatus === matchStatusFilter;
      const matchType = typeFilter === 'all' || item.productType === typeFilter;

      return matchSearch && matchStatus && matchType;
    });
  }, [data, searchTerm, matchStatusFilter, typeFilter]);

  const stats = useMemo(() => {
    const totalCouponDiscount = data.reduce((sum, r) => sum + r.couponDiscount, 0);
    const totalPlatformSubsidy = data.reduce((sum, r) => sum + r.platformSubsidy, 0);
    const totalDiff = data.reduce((sum, r) => sum + Math.abs(r.diffAmount), 0);

    const matched = data.filter((r) => r.matchStatus === '完全匹配').length;
    const discrepancies = data.filter((r) => r.matchStatus === '金额不一致').length;
    const missingInPos = data.filter((r) => r.matchStatus === '平台有单门店未入账').length;
    const missingInPlatform = data.filter((r) => r.matchStatus === '门店有单平台未核销').length;

    return {
      totalCount: data.length,
      totalCouponDiscount: Number(totalCouponDiscount.toFixed(2)),
      totalPlatformSubsidy: Number(totalPlatformSubsidy.toFixed(2)),
      totalDiff: Number(totalDiff.toFixed(2)),
      matched,
      discrepancies,
      missingInPos,
      missingInPlatform,
    };
  }, [data]);

  const handleExport = () => {
    const exportRows = filteredData.map((r, i) => ({
      序号: i + 1,
      券码: r.couponCode,
      用券活动名称: r.couponName,
      门店POS订单号: r.posOrderNo,
      平台交易流水号: r.platformTxnNo,
      商品品类: r.productType,
      商品名称: r.productName,
      订单金额: r.orderAmount,
      门店券抵扣额: r.couponDiscount,
      平台核销补贴额: r.platformSubsidy,
      差额: r.diffAmount,
      审核对账结果: r.matchStatus,
      审核时间: r.verifiedAt,
      备注说明: r.notes || '',
    }));
    exportToExcel(exportRows, `模式4_销售用券审核明细_${new Date().toISOString().slice(0, 10)}`);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-amber-500/10 text-amber-400 rounded-xl border border-amber-500/20">
            <TicketCheck className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-bold text-white">模式 4: 审核明细（销售用券情况统计）</h2>
              <span className="px-2 py-0.5 text-xs bg-amber-500/10 text-amber-400 border border-amber-500/20 rounded-md">
                POS vs 国补平台对账
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-1">
              比对门店销售系统中顾客使用的国补优惠券抵扣与政府核销平台实发补贴数据，核查未核销或金额差异
            </p>
          </div>
        </div>

        <button
          onClick={handleExport}
          className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold rounded-lg bg-amber-600 hover:bg-amber-500 text-white shadow-md shadow-amber-600/20 transition-all self-start sm:self-auto"
        >
          <Download className="w-3.5 h-3.5" />
          <span>导出审核明细</span>
        </button>
      </div>

      {/* Metrics Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-4">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span>完全匹配记录</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-xl font-bold text-emerald-400 mt-2 font-mono">
            {stats.matched} / {stats.totalCount}
          </div>
          <div className="text-[11px] text-slate-500 mt-1">
            匹配率: {((stats.matched / (stats.totalCount || 1)) * 100).toFixed(1)}%
          </div>
        </div>

        <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-4">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span>门店抵扣总额</span>
            <TicketCheck className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-xl font-bold text-amber-400 mt-2 font-mono">
            ¥{stats.totalCouponDiscount.toLocaleString()}
          </div>
          <div className="text-[11px] text-slate-500 mt-1">POS 优惠券折让总额</div>
        </div>

        <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-4">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span>平台已核销金额</span>
            <FileSpreadsheet className="w-4 h-4 text-cyan-400" />
          </div>
          <div className="text-xl font-bold text-cyan-400 mt-2 font-mono">
            ¥{stats.totalPlatformSubsidy.toLocaleString()}
          </div>
          <div className="text-[11px] text-slate-500 mt-1">政府端确认的应拨付额</div>
        </div>

        <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-4">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span>需核实差额</span>
            <AlertCircle className={`w-4 h-4 ${stats.totalDiff > 0 ? 'text-rose-400' : 'text-slate-500'}`} />
          </div>
          <div className={`text-xl font-bold mt-2 font-mono ${stats.totalDiff > 0 ? 'text-rose-400' : 'text-slate-400'}`}>
            ¥{stats.totalDiff.toLocaleString()}
          </div>
          <div className="text-[11px] text-slate-500 mt-1">
            {stats.missingInPlatform + stats.discrepancies} 笔需财务复核
          </div>
        </div>
      </div>

      {/* Search & Filter Bar */}
      <div className="flex flex-col sm:flex-row gap-3 items-center justify-between bg-slate-900/80 p-3.5 rounded-xl border border-slate-800">
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="搜索券码、POS订单号、流水号、商品..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-950 border border-slate-700 rounded-lg text-slate-200 placeholder-slate-500 focus:outline-none focus:border-amber-500"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <div className="flex items-center gap-1.5 text-xs text-slate-400">
            <Filter className="w-3.5 h-3.5" />
            <span>状态:</span>
          </div>
          <select
            value={matchStatusFilter}
            onChange={(e) => setMatchStatusFilter(e.target.value)}
            className="text-xs bg-slate-950 border border-slate-700 rounded-lg px-2.5 py-1.5 text-slate-300 focus:outline-none focus:border-amber-500"
          >
            <option value="all">全部对账结果</option>
            <option value="完全匹配">完全匹配</option>
            <option value="金额不一致">金额不一致</option>
            <option value="门店有单平台未核销">门店有单平台未核销</option>
            <option value="平台有单门店未入账">平台有单门店未入账</option>
          </select>

          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="text-xs bg-slate-950 border border-slate-700 rounded-lg px-2.5 py-1.5 text-slate-300 focus:outline-none focus:border-amber-500"
          >
            <option value="all">全部品类</option>
            <option value="家电">家电</option>
            <option value="数码">数码</option>
          </select>
        </div>
      </div>

      {/* Main Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-950 text-slate-400 font-semibold border-b border-slate-800">
              <tr>
                <th className="py-3 px-3.5">券码 / 活动</th>
                <th className="py-3 px-3">POS订单号 / 平台流水</th>
                <th className="py-3 px-3">商品品类 / 名称</th>
                <th className="py-3 px-3 text-right">门店券抵扣</th>
                <th className="py-3 px-3 text-right">平台补贴额</th>
                <th className="py-3 px-3 text-right">差额</th>
                <th className="py-3 px-3">对账状态</th>
                <th className="py-3 px-3">说明</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-mono">
              {filteredData.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-8 text-center text-slate-500">
                    未找到匹配的销售用券审核明细
                  </td>
                </tr>
              ) : (
                filteredData.map((row) => {
                  let statusBadge = (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                      <CheckCircle2 className="w-3 h-3" />
                      完全匹配
                    </span>
                  );

                  if (row.matchStatus === '门店有单平台未核销') {
                    statusBadge = (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] bg-rose-500/10 text-rose-400 border border-rose-500/20">
                        <AlertCircle className="w-3 h-3" />
                        平台未核销
                      </span>
                    );
                  } else if (row.matchStatus === '金额不一致') {
                    statusBadge = (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] bg-amber-500/10 text-amber-400 border border-amber-500/20">
                        <AlertTriangle className="w-3 h-3" />
                        金额不一致
                      </span>
                    );
                  }

                  return (
                    <tr key={row.id} className="hover:bg-slate-800/40 transition-colors">
                      <td className="py-3 px-3.5">
                        <div className="font-semibold text-slate-200">{row.couponCode}</div>
                        <div className="text-[11px] text-slate-500 font-sans truncate max-w-[180px]">
                          {row.couponName}
                        </div>
                      </td>
                      <td className="py-3 px-3">
                        <div className="text-slate-300">{row.posOrderNo}</div>
                        <div className="text-[11px] text-slate-500">{row.platformTxnNo}</div>
                      </td>
                      <td className="py-3 px-3 font-sans max-w-xs truncate">
                        <span
                          className={`px-1.5 py-0.2 rounded text-[10px] mr-1.5 ${
                            row.productType === '家电'
                              ? 'bg-blue-500/10 text-blue-400'
                              : 'bg-purple-500/10 text-purple-400'
                          }`}
                        >
                          {row.productType}
                        </span>
                        <span className="text-slate-200">{row.productName}</span>
                      </td>
                      <td className="py-3 px-3 text-right text-slate-200">
                        ¥{row.couponDiscount.toLocaleString()}
                      </td>
                      <td className="py-3 px-3 text-right text-slate-200 font-semibold">
                        ¥{row.platformSubsidy.toLocaleString()}
                      </td>
                      <td
                        className={`py-3 px-3 text-right font-bold ${
                          row.diffAmount !== 0 ? 'text-rose-400' : 'text-emerald-400'
                        }`}
                      >
                        {row.diffAmount !== 0 ? `+¥${row.diffAmount.toLocaleString()}` : '¥0.00'}
                      </td>
                      <td className="py-3 px-3 font-sans">{statusBadge}</td>
                      <td className="py-3 px-3 font-sans text-slate-400 text-[11px]">
                        {row.notes || '-'}
                      </td>
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
