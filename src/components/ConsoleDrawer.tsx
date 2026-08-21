import React, { useRef, useEffect } from 'react';
import { Terminal, X, CheckCircle2, AlertCircle, AlertTriangle, Info, Trash2 } from 'lucide-react';
import { ProcessLog } from '../types';

interface ConsoleDrawerProps {
  logs: ProcessLog[];
  isOpen: boolean;
  onClose: () => void;
  onClear: () => void;
  currentStep?: string;
  progress: number;
  isRunning: boolean;
}

export const ConsoleDrawer: React.FC<ConsoleDrawerProps> = ({
  logs,
  isOpen,
  onClose,
  onClear,
  currentStep,
  progress,
  isRunning,
}) => {
  const logEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen) {
      logEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [logs, isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 bg-slate-900/98 border-t border-slate-700 shadow-2xl transition-all duration-300">
      <div className="max-w-7xl mx-auto px-4 py-2.5 flex items-center justify-between border-b border-slate-800 bg-slate-950/60">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <Terminal className="w-4 h-4 text-cyan-400" />
            <span className="text-xs font-semibold text-slate-200">执行控制台 (Console Output)</span>
          </div>

          {isRunning && (
            <div className="flex items-center gap-2">
              <span className="inline-block w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
              <span className="text-xs text-cyan-300 font-mono">
                {currentStep || '正在处理...'} ({progress}%)
              </span>
            </div>
          )}
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={onClear}
            className="p-1 text-slate-400 hover:text-slate-200 rounded hover:bg-slate-800 text-xs flex items-center gap-1"
            title="清空日志"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>清空</span>
          </button>
          <button
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-slate-200 rounded hover:bg-slate-800"
            title="关闭"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {isRunning && (
        <div className="w-full bg-slate-800 h-1">
          <div
            className="bg-cyan-500 h-1 transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>
      )}

      <div className="max-w-7xl mx-auto p-4 max-h-64 overflow-y-auto font-mono text-xs text-slate-300 space-y-1.5 selection:bg-cyan-500/30">
        {logs.length === 0 ? (
          <div className="text-slate-500 py-6 text-center italic">
            暂无执行日志。点击上方「全量运行」或各模式下的「执行计算」按钮查看详细处理流程与回滚保障。
          </div>
        ) : (
          logs.map((log) => {
            let Icon = Info;
            let color = 'text-slate-400';
            if (log.level === 'success') {
              Icon = CheckCircle2;
              color = 'text-emerald-400';
            } else if (log.level === 'warn') {
              Icon = AlertTriangle;
              color = 'text-amber-400';
            } else if (log.level === 'error') {
              Icon = AlertCircle;
              color = 'text-rose-400 font-bold';
            } else if (log.level === 'metric') {
              Icon = CheckCircle2;
              color = 'text-cyan-300';
            }

            return (
              <div key={log.id} className="flex items-start gap-2.5 leading-relaxed">
                <span className="text-slate-600 text-[11px] shrink-0">{log.timestamp}</span>
                {log.step && (
                  <span className="px-1.5 py-0.2 bg-slate-800 text-cyan-400 rounded text-[11px] shrink-0 border border-slate-700">
                    {log.step}
                  </span>
                )}
                <Icon className={`w-3.5 h-3.5 shrink-0 mt-0.5 ${color}`} />
                <div className="flex-1 break-all">
                  <span className={color}>{log.message}</span>
                  {log.detail && <span className="ml-2 text-slate-400">({log.detail})</span>}
                </div>
              </div>
            );
          })
        )}
        <div ref={logEndRef} />
      </div>
    </div>
  );
};
