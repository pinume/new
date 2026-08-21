import React, { useState, useMemo } from 'react';
import {
  CreditCard,
  Search,
  Filter,
  Download,
  Building2,
  Tv,
  Cpu,
  ArrowRight,
  TrendingUp,
  Sparkles
} from 'lucide-react';
import { PaymentRow, AppConfig } from '../types';
import { exportToExcel } from '../services/excelService';

interface Mode3PaymentProps {
  data: PaymentRow[];
  config: AppConfig;
}

export const Mode3Payment: React.FC<Mode3PaymentProps> = ({ data, config }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [brandFilter, setBrandFilter] = useState<string>('all');

  const filteredData = useMemo(() => {
    return data.filter((item) => {
      const matchSearch =
        item.payoutNo.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.productName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.displayBrand.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.originalBrand.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.financialCategory.toLowerCase().includes(searchTerm.toLowerCase());

      const matchCategory = categoryFilter === 'all' || item.financialCategory === categoryFilter;
      const matchBrand = brandFilter === 'all' || item.displayBrand === brandFilter;

      return matchSearch && matchCategory && matchBrand;
    });
  }, [data, searchTerm, categoryFilter, brandFilter]);

  const stats = useMemo(() => {
    const totalSubsidy = data.reduce((sum, r) => sum + r.subsidyAmount, 0);
    const totalSales = data.reduce((sum, r) => sum + r.orderAmount, 0);

    const applianceRows = data.filter((r) => r.subsidyType === '家电');
    const applianceSubsidy = applianceRows.reduce((sum, r) => sum + r.subsidyAmount, 0);

    const digitalRows = data.filter((r) => r.subsidyType === '数码');
    const digitalSubsidy = digitalRows.reduce((sum, r) => sum + r.subsidyAmount, 0);

    // Group by category
    const catMap: Record<string, { count: number; subsidy: number }> = {};
    // Group by brand
    const brandMap: Record<string, { count: number; subsidy: number }> = {};

    for (const r of data) {
      if (!catMap[r.financialCategory]) {
        catMap[r.financialCategory] = { count: 0, subsidy: 0 };
      }
      catMap[r.financialCategory].count += 1;
      catMap[r.financialCategory].subsidy += r.subsidyAmount;

      if (!brandMap[r.displayBrand]) {
        brandMap[r.displayBrand] = { count: 0, subsidy: 0 };
      }
      brandMap[r.displayBrand].count += 1;
      brandMap[r.displayBrand].subsidy += r.subsidyAmount;
    }

    return {
      totalCount: data.length,
      totalSubsidy: Number(totalSubsidy.toFixed(2)),
      totalSales: Number(totalSales.toFixed(2)),
      applianceCount: applianceRows.length,
      applianceSubsidy: Number(applianceSubsidy.toFixed(2)),
      digitalCount: digitalRows.length,
      digitalSubsidy: Number(digitalSubsidy.toFixed(2)),
      categories: Object.entries(catMap).map(([name, v]) => ({
        name,
        count: v.count,
        subsidy: Number(v.subsidy.toFixed(2)),
      })),
      brands: Object.entries(brandMap).map(([name, v]) => ({
        name,
        count: v.count,
        subsidy: Number(v.subsidy.toFixed(2)),
      })),
    };
  }, [data]);

  const handleExport = () => {
    const exportRows = filteredData.map((r, i) => ({
      序号: i + 1,
      银联回款流水号: r.payoutNo,
      商户编号: r.merchantCode,
      补贴类型: r.subsidyType,
      品类编码: r.categoryCode,
      财务大类: r.financialCategory,
      原始品牌: r.originalBrand,
      归一化母品牌: r.normalizedBrand,
      报表展示品牌: r.displayBrand,
      商品名称: r.productName,
      订单金额: r.orderAmount,
      已回款补贴额: r.subsidyAmount,
      清算日期: r.settlementDate,
      回款状态: r.status,
    }));
    exportToExcel(exportRows, `模式3_回款明细汇总_${new Date().toISOString().slice(0, 10)}`);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-indigo-500/10 text-indigo-400 rounded-xl border border-indigo-500/20">
            <CreditCard className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-bold text-white">模式 3: 回款明细（家电 + 数码）</h2>
              <span className="px-2 py-0.5 text-xs bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 rounded-md">
                品牌归一 & 美的系归并
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-1">
              通过 <code className="text-cyan-300">config/payment_brands.yaml</code> 执行关键词优先级匹配、子品牌归一化及洗衣机/冰箱美的系合并
            </p>
          </div>
        </div>

        <button
          onClick={handleExport}
          className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white shadow-md shadow-indigo-600/20 transition-all self-start sm:self-auto"
        >
          <Download className="w-3.5 h-3.5" />
          <span>导出回款明细</span>
        </button>
      </div>

      {/* Metrics Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-4">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span>银联清算回款总额</span>
            <TrendingUp className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-xl font-bold text-emerald-400 mt-2 font-mono">
            ¥{stats.totalSubsidy.toLocaleString()}
          </div>
          <div className="text-[11px] text-slate-500 mt-1">到账订单: {stats.totalCount} 笔</div>
        </div>

        <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-4">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span>家电回款补贴</span>
            <Tv className="w-4 h-4 text-blue-400" />
          </div>
          <div className="text-xl font-bold text-blue-400 mt-2 font-mono">
            ¥{stats.applianceSubsidy.toLocaleString()}
          </div>
          <div className="text-[11px] text-slate-500 mt-1">{stats.applianceCount} 笔清算记录</div>
        </div>

        <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-4">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span>数码3C回款补贴</span>
            <Cpu className="w-4 h-4 text-purple-400" />
          </div>
          <div className="text-xl font-bold text-purple-400 mt-2 font-mono">
            ¥{stats.digitalSubsidy.toLocaleString()}
          </div>
          <div className="text-[11px] text-slate-500 mt-1">{stats.digitalCount} 笔清算记录</div>
        </div>

        <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-4">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span>品牌覆盖</span>
            <Building2 className="w-4 h-4 text-cyan-400" />
          </div>
          <div className="text-xl font-bold text-cyan-400 mt-2 font-mono">
            {stats.brands.length} 个
          </div>
          <div className="text-[11px] text-slate-500 mt-1">涵盖主要家电与数码厂家</div>
        </div>
      </div>

      {/* Rules Notice Box */}
      <div className="p-4 bg-slate-900/80 border border-slate-800 rounded-xl flex flex-wrap items-center gap-4 text-xs">
        <div className="flex items-center gap-2 text-indigo-400 font-semibold">
          <Sparkles className="w-4 h-4" />
          <span>当前生效归并规则：</span>
        </div>
        <div className="flex items-center gap-2 bg-slate-950 px-2.5 py-1 rounded-md border border-slate-800 text-slate-300">
          <span>子品牌归一：</span>
          <span className="text-slate-400">COLMO/华凌 → 美的</span>
          <span className="text-slate-400">卡萨帝/统帅/Leader → 海尔</span>
          <span className="text-slate-400">晶弘 → 格力</span>
        </div>
        <div className="flex items-center gap-2 bg-slate-950 px-2.5 py-1 rounded-md border border-slate-800 text-slate-300">
          <span>美的系大类归并：</span>
          <span className="text-slate-400">洗衣机 / 冰箱品类中 (美的 + 小天鹅 + 东芝) → 「美的系」</span>
        </div>
      </div>

      {/* Search & Filter Bar */}
      <div className="flex flex-col sm:flex-row gap-3 items-center justify-between bg-slate-900/80 p-3.5 rounded-xl border border-slate-800">
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="搜索流水号、品牌、品类、商品名..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-950 border border-slate-700 rounded-lg text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-500"
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
            className="text-xs bg-slate-950 border border-slate-700 rounded-lg px-2.5 py-1.5 text-slate-300 focus:outline-none focus:border-indigo-500"
          >
            <option value="all">全部财务大类</option>
            {stats.categories.map((c) => (
              <option key={c.name} value={c.name}>
                {c.name}
              </option>
            ))}
          </select>

          <select
            value={brandFilter}
            onChange={(e) => setBrandFilter(e.target.value)}
            className="text-xs bg-slate-950 border border-slate-700 rounded-lg px-2.5 py-1.5 text-slate-300 focus:outline-none focus:border-indigo-500"
          >
            <option value="all">全部报表品牌</option>
            {stats.brands.map((b) => (
              <option key={b.name} value={b.name}>
                {b.name}
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
                <th className="py-3 px-3.5">银联清算流水号</th>
                <th className="py-3 px-3">财务大类</th>
                <th className="py-3 px-3">原始识别 → 报表品牌</th>
                <th className="py-3 px-3">商品名称</th>
                <th className="py-3 px-3 text-right">订单金额</th>
                <th className="py-3 px-3 text-right">回款补贴额</th>
                <th className="py-3 px-3">清算日期</th>
                <th className="py-3 px-3">状态</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-mono">
              {filteredData.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-8 text-center text-slate-500">
                    未找到匹配的回款明细
                  </td>
                </tr>
              ) : (
                filteredData.map((row) => (
                  <tr key={row.id} className="hover:bg-slate-800/40 transition-colors">
                    <td className="py-3 px-3.5 font-semibold text-slate-200">{row.payoutNo}</td>
                    <td className="py-3 px-3 font-sans">
                      <span className="px-2 py-0.5 rounded text-[11px] font-medium bg-slate-800 text-slate-300 border border-slate-700">
                        {row.financialCategory}
                      </span>
                    </td>
                    <td className="py-3 px-3 font-sans">
                      <div className="flex items-center gap-1.5">
                        <span className="text-slate-400 text-[11px]">{row.originalBrand}</span>
                        {row.originalBrand !== row.displayBrand && (
                          <>
                            <ArrowRight className="w-3 h-3 text-indigo-400" />
                            <span className="px-1.5 py-0.2 bg-indigo-500/10 text-indigo-300 border border-indigo-500/20 rounded font-semibold text-[11px]">
                              {row.displayBrand}
                            </span>
                          </>
                        )}
                      </div>
                    </td>
                    <td className="py-3 px-3 font-sans max-w-xs truncate text-slate-200" title={row.productName}>
                      {row.productName}
                    </td>
                    <td className="py-3 px-3 text-right text-slate-400">
                      ¥{row.orderAmount.toLocaleString()}
                    </td>
                    <td className="py-3 px-3 text-right font-bold text-emerald-400">
                      ¥{row.subsidyAmount.toLocaleString()}
                    </td>
                    <td className="py-3 px-3 text-[11px] text-slate-400 font-sans">{row.settlementDate}</td>
                    <td className="py-3 px-3 font-sans">
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                        {row.status}
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
