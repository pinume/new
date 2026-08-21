import React from 'react';
import {
  FileSpreadsheet,
  Layers,
  Receipt,
  CreditCard,
  TicketCheck,
  Building2,
  Settings,
  Play,
  Terminal,
  Upload,
  RefreshCw
} from 'lucide-react';
import { ModeType } from '../types';

interface NavbarProps {
  activeMode: ModeType;
  onSelectMode: (mode: ModeType) => void;
  onRunAll: () => void;
  isRunning: boolean;
  onOpenUpload: () => void;
  onToggleConsole: () => void;
  showConsole: boolean;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeMode,
  onSelectMode,
  onRunAll,
  isRunning,
  onOpenUpload,
  onToggleConsole,
  showConsole,
}) => {
  const navItems = [
    { id: 1 as ModeType, label: '模式 1: 已上传数据', icon: Layers, desc: '家电 + 数码补贴核销' },
    { id: 2 as ModeType, label: '模式 2: 收款单统计', icon: Receipt, desc: '门店收款单与对账' },
    { id: 3 as ModeType, label: '模式 3: 回款明细', icon: CreditCard, desc: '银联清算与品牌归一' },
    { id: 4 as ModeType, label: '模式 4: 审核明细', icon: TicketCheck, desc: '销售用券情况统计' },
    { id: 5 as ModeType, label: '模式 5: 门店报表', icon: Building2, desc: '2026-V5 上传回款表' },
  ];

  return (
    <header className="sticky top-0 z-40 bg-slate-900/90 backdrop-blur border-b border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Title */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-600 to-blue-500 flex items-center justify-center shadow-lg shadow-cyan-500/20 text-white">
              <FileSpreadsheet className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-base tracking-tight text-white">国补数据处理系统</span>
                <span className="text-xs px-2 py-0.5 rounded-full bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 font-mono">
                  2026-V5
                </span>
              </div>
              <p className="text-xs text-slate-400">家电 / 数码国补 Excel 数据统一清洗与对账</p>
            </div>
          </div>

          {/* Quick Action Buttons */}
          <div className="flex items-center gap-2.5">
            <button
              id="upload-data-btn"
              onClick={onOpenUpload}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-300 bg-slate-800/80 hover:bg-slate-700 hover:text-white border border-slate-700 rounded-lg transition-colors"
            >
              <Upload className="w-3.5 h-3.5 text-slate-400" />
              <span>导入文件 (data/)</span>
            </button>

            <button
              id="config-manage-btn"
              onClick={() => onSelectMode('config')}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg border transition-colors ${
                activeMode === 'config'
                  ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40'
                  : 'bg-slate-800/80 text-slate-300 hover:bg-slate-700 border-slate-700'
              }`}
            >
              <Settings className="w-3.5 h-3.5" />
              <span>配置规则</span>
            </button>

            <button
              id="run-all-modes-btn"
              disabled={isRunning}
              onClick={onRunAll}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-white bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 disabled:opacity-50 rounded-lg shadow-md shadow-cyan-500/20 transition-all cursor-pointer"
            >
              {isRunning ? (
                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <Play className="w-3.5 h-3.5 fill-current" />
              )}
              <span>{isRunning ? '正在批量处理...' : '全量运行 (1–5)'}</span>
            </button>

            <button
              id="toggle-console-btn"
              onClick={onToggleConsole}
              className={`p-2 rounded-lg border transition-colors ${
                showConsole
                  ? 'bg-slate-700 text-cyan-400 border-slate-600'
                  : 'bg-slate-800 text-slate-400 hover:text-slate-200 border-slate-700'
              }`}
              title="切换运行控制台"
            >
              <Terminal className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Mode Navigation Tabs */}
        <div className="flex space-x-1 border-t border-slate-800/60 overflow-x-auto py-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeMode === item.id;
            return (
              <button
                key={item.id}
                id={`mode-tab-${item.id}`}
                onClick={() => onSelectMode(item.id)}
                className={`flex items-center gap-2 px-3.5 py-2 text-xs font-medium rounded-lg whitespace-nowrap transition-all ${
                  isActive
                    ? 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/30'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40 border border-transparent'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-cyan-400' : 'text-slate-500'}`} />
                <span>{item.label}</span>
              </button>
            );
          })}
        </div>
      </div>
    </header>
  );
};
