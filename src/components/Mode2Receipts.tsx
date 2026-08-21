import React, { useState, useMemo } from 'react';
import {
  Receipt,
  Search,
  Filter,
  Download,
  Wallet,
  Users,
  CheckCircle2,
  TrendingUp,
  DollarSign
} from 'lucide-react';
import { ReceiptRow } from '../types';
import { exportToExcel } from '../services/excelService';

interface Mode2ReceiptsProps {
  data: ReceiptRow[];
}

export const Mode2Receipts: React.FC<Mode2ReceiptsProps> = ({ data }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [payMethodFilter, setPayMethodFilter] = useState<string>('all');
  const [cashierFilter, setCashierFilter] = useState<string>('all');

  const filteredData = useMemo(() => {
    return data.filter((item) => {
      const matchSearch =
        item.receiptNo.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.salesOrderNo.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.cashier.toLowerCase().includes(searchTerm.toLowerCase());

      const matchPayMethod = payMethodFilter === 'all' || item.payMethod === payMethodFilter;
      const matchCashier = cashierFilter === 'all' || item.cashier === cashierFilter;

      return matchSearch && matchPayMethod && matchCashier;
    });
  }, [data, searchTerm, payMethodFilter, cashierFilter]);

  // Summaries
  const stats = useMemo(() => {
    const totalAmount = data.reduce((sum, r) => sum + r.amount, 0);
    const totalDiscount = data.reduce((sum, r) => sum + r.couponDiscount, 0);
    const subsidyReceipts = data.filter((r) => r.payMethod === '国补专享' || r.payMethod === '银联云闪付');
    const subsidyAmount = subsidyReceipts.reduce((sum, r) => sum + r.amount, 0);

    // Method breakdown
    const methodMap: Record<string, { count: number; amount: number; discount: number }> = {};
    const cashierMap: Record<string, { count: number; amount: number }> = {};

    for (const r of data) {
      if (!methodMap[r.payMethod]) {
        methodMap[r.payMethod] = { count: 0, amount: 0, discount: 0 };
      }
      methodMap[r.payMethod].count += 1;
      methodMap[r.payMethod].amount += r.amount;
      methodMap[r.payMethod].discount += r.couponDiscount;

      if (!cashierMap[r.cashier]) {
        cashierMap[r.cashier] = { count: 0, amount: 0 };
      }
      cashierMap[r.cashier].count += 1;
      cashierMap[r.cashier].amount += r.amount;
    }

    return {
      totalCount: data.length,
      totalAmount: Number(totalAmount.toFixed(2)),
      totalDiscount: Number(totalDiscount.toFixed(2)),
      subsidyAmount: Number(subsidyAmount.toFixed(2)),
      methodBreakdown: Object.entries(methodMap).map(([method, val]) => ({
        method,
        count: val.count,
        amount: Number(val.amount.toFixed(2)),
        discount: Number(val.discount.toFixed(2)),
      })),
      cashierList: Object.keys(cashierMap),
      cashierBreakdown: Object.entries(cashierMap).map(([cashier, val]) => ({
        cashier,
        count: val.count,
        amount: Number(val.amount.toFixed(2)),
      })),
    };
  }, [data]);

  const handleExport = () => {
    const exportRows = filteredData.map((r, i) => ({
      序号: i + 1,
      收款单号: r.receiptNo,
      销售单号: r.salesOrderNo,
      收款方式: r.payMethod,
      实收金额: r.amount,
      优惠券抵扣: r.couponDiscount,
      收款时间: r.paidAt,
      收银员: r.cashier,
      门店: r.store,
      对账状态: r.settled ? '已结算' : '待结算',
    }));
    exportToExcel(exportRows, `模式2_收款单统计汇总_${new Date().toISOString().slice(0, 10)}`);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-blue-500/10 text-blue-400 rounded-xl border border-blue-500/20">
            <Receipt className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-bold text-white">模式 2: 收款单统计</h2>
              <span className="px-2 py-0.5 text-xs bg-blue-500/10 text-blue-400 border border-blue-500/20 rounded-md">
                POS 对账口径
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-1">
              汇总门店销售终端生成的收款单流水，统计各收款渠道实收金额与补贴券抵扣
            </p>
          </div>
        </div>

        <button
          onClick={handleExport}
          className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold rounded-lg bg-blue-600 hover:bg-blue-500 text-white shadow-md shadow-blue-600/20 transition-all self-start sm:self-auto"
        >
          <Download className="w-3.5 h-3.5" />
          <span>导出收款单统计</span>
        </button>
      </div>

      {/* Metrics Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-4">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span>实收总金额</span>
            <DollarSign className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-xl font-bold text-emerald-400 mt-2 font-mono">
            ¥{stats.totalAmount.toLocaleString()}
          </div>
          <div className="text-[11px] text-slate-500 mt-1">总笔数: {stats.totalCount} 笔收款流水</div>
        </div>

        <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-4">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span>国补优惠券抵扣</span>
            <TrendingUp className="w-4 h-4 text-cyan-400" />
          </div>
          <div className="text-xl font-bold text-cyan-400 mt-2 font-mono">
            ¥{stats.totalDiscount.toLocaleString()}
          </div>
          <div className="text-[11px] text-slate-500 mt-1">政府消费补贴直接抵扣</div>
        </div>

        <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-4">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span>国补专享/云闪付通道</span>
            <Wallet className="w-4 h-4 text-blue-400" />
          </div>
          <div className="text-xl font-bold text-blue-400 mt-2 font-mono">
            ¥{stats.subsidyAmount.toLocaleString()}
          </div>
          <div className="text-[11px] text-slate-500 mt-1">银联专线补贴核销实收</div>
        </div>

        <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-4">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span>收银人员参与</span>
            <Users className="w-4 h-4 text-purple-400" />
          </div>
          <div className="text-xl font-bold text-purple-400 mt-2 font-mono">
            {stats.cashierList.length} 人
          </div>
          <div className="text-[11px] text-slate-500 mt-1">全员核销操作均已登记</div>
        </div>
      </div>

      {/* Payment Channel Cards */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-4">
        <h3 className="text-xs font-semibold text-slate-300 mb-3 flex items-center gap-1.5">
          <Wallet className="w-3.5 h-3.5 text-cyan-400" />
          <span>收款方式分布汇总</span>
        </h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {stats.methodBreakdown.map((m) => (
            <div key={m.method} className="bg-slate-950 p-3 rounded-lg border border-slate-800/80">
              <div className="text-slate-400 text-xs font-medium">{m.method}</div>
              <div className="text-base font-bold text-slate-200 mt-1 font-mono">
                ¥{m.amount.toLocaleString()}
              </div>
              <div className="text-[11px] text-cyan-400/80 mt-1">
                抵扣: ¥{m.discount.toLocaleString()} ({m.count}笔)
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Search & Filter Bar */}
      <div className="flex flex-col sm:flex-row gap-3 items-center justify-between bg-slate-900/80 p-3.5 rounded-xl border border-slate-800">
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="搜索收款单号、销售单号、收银员..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-950 border border-slate-700 rounded-lg text-slate-200 placeholder-slate-500 focus:outline-none focus:border-blue-500"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <div className="flex items-center gap-1.5 text-xs text-slate-400">
            <Filter className="w-3.5 h-3.5" />
            <span>渠道:</span>
          </div>
          <select
            value={payMethodFilter}
            onChange={(e) => setPayMethodFilter(e.target.value)}
            className="text-xs bg-slate-950 border border-slate-700 rounded-lg px-2.5 py-1.5 text-slate-300 focus:outline-none focus:border-blue-500"
          >
            <option value="all">全部收款方式</option>
            {stats.methodBreakdown.map((m) => (
              <option key={m.method} value={m.method}>
                {m.method}
              </option>
            ))}
          </select>

          <select
            value={cashierFilter}
            onChange={(e) => setCashierFilter(e.target.value)}
            className="text-xs bg-slate-950 border border-slate-700 rounded-lg px-2.5 py-1.5 text-slate-300 focus:outline-none focus:border-blue-500"
          >
            <option value="all">全部收银员</option>
            {stats.cashierList.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Main Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-950 text-slate-400 font-semibold border-b border-slate-800">
              <tr>
                <th className="py-3 px-3.5">收款单号</th>
                <th className="py-3 px-3">关联销售单号</th>
                <th className="py-3 px-3">收款方式</th>
                <th className="py-3 px-3 text-right">收款金额</th>
                <th className="py-3 px-3 text-right">券抵扣金额</th>
                <th className="py-3 px-3">收款时间</th>
                <th className="py-3 px-3">收银员 / 门店</th>
                <th className="py-3 px-3">状态</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-mono">
              {filteredData.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-8 text-center text-slate-500">
                    未找到匹配的收款记录
                  </td>
                </tr>
              ) : (
                filteredData.map((row) => (
                  <tr key={row.id} className="hover:bg-slate-800/40 transition-colors">
                    <td className="py-3 px-3.5 font-semibold text-slate-200">{row.receiptNo}</td>
                    <td className="py-3 px-3 text-slate-400">{row.salesOrderNo}</td>
                    <td className="py-3 px-3 font-sans">
                      <span className="px-2 py-0.5 rounded text-[11px] font-medium bg-slate-800 text-slate-300 border border-slate-700">
                        {row.payMethod}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-right font-bold text-slate-200">
                      ¥{row.amount.toLocaleString()}
                    </td>
                    <td className="py-3 px-3 text-right text-cyan-400 font-semibold">
                      ¥{row.couponDiscount.toLocaleString()}
                    </td>
                    <td className="py-3 px-3 text-[11px] text-slate-400 font-sans">{row.paidAt}</td>
                    <td className="py-3 px-3 text-[11px] text-slate-300 font-sans">
                      {row.cashier} · {row.store}
                    </td>
                    <td className="py-3 px-3 font-sans">
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                        <CheckCircle2 className="w-3 h-3" />
                        已结算
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
