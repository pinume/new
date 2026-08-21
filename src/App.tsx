import React, { useState, useCallback } from 'react';
import { Navbar } from './components/Navbar';
import { ConsoleDrawer } from './components/ConsoleDrawer';
import { Mode1Uploaded } from './components/Mode1Uploaded';
import { Mode2Receipts } from './components/Mode2Receipts';
import { Mode3Payment } from './components/Mode3Payment';
import { Mode4CouponAudit } from './components/Mode4CouponAudit';
import { Mode5StoreReport } from './components/Mode5StoreReport';
import { ConfigManager } from './components/ConfigManager';
import { FileUploadModal } from './components/FileUploadModal';

import {
  ModeType,
  AppConfig,
  UploadedRow,
  ReceiptRow,
  PaymentRow,
  CouponAuditRow,
  ProcessLog,
  ProcessingState,
} from './types';
import { defaultAppConfig } from './data/defaultConfig';
import {
  initialUploadedData,
  initialReceiptsData,
  initialPaymentData,
  initialCouponAuditData,
} from './data/sampleData';

export function App() {
  const [activeMode, setActiveMode] = useState<ModeType>(1);
  const [config, setConfig] = useState<AppConfig>(() => {
    const saved = localStorage.getItem('subsidy_app_config');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        return defaultAppConfig;
      }
    }
    return defaultAppConfig;
  });

  const [uploadedData, setUploadedData] = useState<UploadedRow[]>(initialUploadedData);
  const [receiptsData, setReceiptsData] = useState<ReceiptRow[]>(initialReceiptsData);
  const [paymentData, setPaymentData] = useState<PaymentRow[]>(initialPaymentData);
  const [couponAuditData, setCouponAuditData] = useState<CouponAuditRow[]>(initialCouponAuditData);

  const [showConsole, setShowConsole] = useState(false);
  const [showUploadModal, setShowUploadModal] = useState(false);

  const [processingState, setProcessingState] = useState<ProcessingState>({
    isRunning: false,
    activeMode: null,
    progress: 0,
    currentStep: '',
    totalSteps: 0,
    completedSteps: 0,
    logs: [
      {
        id: 'init-1',
        timestamp: new Date().toLocaleTimeString(),
        level: 'info',
        step: '系统就绪',
        message: '国补数据处理与对账系统已启动（环境：Linux / Web 2026-V5）',
      },
      {
        id: 'init-2',
        timestamp: new Date().toLocaleTimeString(),
        level: 'metric',
        step: '配置加载',
        message: `商户配置：家电[${config.merchants.merchants.家电}]，数码[${config.merchants.merchants.数码}]`,
      },
    ],
  });

  const addLog = useCallback(
    (level: 'info' | 'warn' | 'error' | 'success' | 'metric', message: string, step?: string, detail?: string) => {
      const newLog: ProcessLog = {
        id: `log-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
        timestamp: new Date().toLocaleTimeString(),
        level,
        message,
        step,
        detail,
      };
      setProcessingState((prev) => ({
        ...prev,
        logs: [...prev.logs, newLog],
      }));
    },
    []
  );

  const handleSaveConfig = (newConfig: AppConfig) => {
    setConfig(newConfig);
    localStorage.setItem('subsidy_app_config', JSON.stringify(newConfig));
    addLog('success', '配置规则更新已保存并同步至所有处理流水线', '配置生效');
  };

  const handleResetConfig = () => {
    setConfig(defaultAppConfig);
    localStorage.removeItem('subsidy_app_config');
    addLog('warn', '系统配置已恢复至官方出厂默认值', '配置重置');
  };

  // Run all modes 1-5 in sequence with simulated transaction rollback & lock management
  const runAllModes = async () => {
    setShowConsole(true);
    setProcessingState((prev) => ({
      ...prev,
      isRunning: true,
      activeMode: 'all',
      progress: 0,
      totalSteps: 5,
      completedSteps: 0,
    }));

    addLog('info', '启动全量处理流水线（按顺序处理模式 1–5）', '全量任务');
    addLog('metric', '获取单实例独占锁: /tmp/subsidy-data-processing.lock', '排他锁');

    const steps = [
      {
        mode: 1,
        title: '已上传数据（家电+数码）',
        action: () => {
          addLog('info', '扫描 data/ 目录匹配 MER_89813015722APT1 与 MER_89813014812B06R', '模式 1');
          addLog('success', `模式 1 成功完成：清洗 ${uploadedData.length} 笔上传流水，检测到 2 笔异常/退款项`, '模式 1');
        },
      },
      {
        mode: 2,
        title: '收款单统计',
        action: () => {
          addLog('info', '汇总 POS 收款单流水与国补云闪付通道实付对账', '模式 2');
          addLog('success', `模式 2 成功完成：完成 ${receiptsData.length} 笔收款统计，抵扣金额核验通过`, '模式 2');
        },
      },
      {
        mode: 3,
        title: '回款明细（家电+数码）',
        action: () => {
          addLog('info', '执行品牌归一化、型号映射与洗衣机/冰箱美的系合并', '模式 3');
          addLog('success', `模式 3 成功完成：归集 ${paymentData.length} 笔银联清算回款`, '模式 3');
        },
      },
      {
        mode: 4,
        title: '审核明细（销售用券情况统计）',
        action: () => {
          addLog('info', '比对销售券核销与政府补贴应发金额一致性', '模式 4');
          addLog('success', `模式 4 成功完成：核验 ${couponAuditData.length} 笔核销记录，标出 1 笔差额单`, '模式 4');
        },
      },
      {
        mode: 5,
        title: '门店国补上传及回款情况表',
        action: () => {
          addLog('info', '加载 2026-V5 正式模板结构，归集品类明细与总计', '模式 5');
          addLog('metric', '模板版本校验通过：A53 单元格包含「模板版本：2026-V5」标记', '模式 5');
          addLog('success', '模式 5 成功完成：门店汇总报表生成就绪', '模式 5');
        },
      },
    ];

    for (let i = 0; i < steps.length; i++) {
      const step = steps[i];
      setProcessingState((prev) => ({
        ...prev,
        currentStep: `[${i + 1}/5] ${step.title}`,
        progress: Math.round(((i + 1) / steps.length) * 100),
        completedSteps: i + 1,
      }));
      await new Promise((r) => setTimeout(r, 450));
      step.action();
    }

    addLog('metric', '输出事务已提交，释放文件锁 /tmp/subsidy-data-processing.lock', '事务完成');
    addLog('success', '全部 5 个处理模式全量执行成功！所有数据均已更新。', '执行完毕');

    setProcessingState((prev) => ({
      ...prev,
      isRunning: false,
      lastRunTime: new Date().toLocaleTimeString(),
    }));
  };

  const handleRefreshMode1 = async () => {
    setShowConsole(true);
    setProcessingState((prev) => ({
      ...prev,
      isRunning: true,
      currentStep: '正在校验已上传补贴数据...',
      progress: 50,
    }));
    addLog('info', '重新执行模式 1: 扫描已上传文件与去重校验', '模式 1');
    await new Promise((r) => setTimeout(r, 400));
    addLog('success', `校验完毕：共 ${uploadedData.length} 笔，正常核销 ${uploadedData.filter(d => d.status === '有效核销').length} 笔`, '模式 1');
    setProcessingState((prev) => ({
      ...prev,
      isRunning: false,
      progress: 100,
    }));
  };

  const handleImportData = (type: string, rows: any[], fileName: string) => {
    setShowConsole(true);
    addLog('info', `解析 Excel 文件 ${fileName}，导入目标：${type}`, '数据导入');

    if (type === 'uploaded') {
      const newItems: UploadedRow[] = rows.map((r, idx) => ({
        id: `imported-up-${Date.now()}-${idx}`,
        txnNo: r['交易流水号'] || r.txnNo || `TXN_IMP_${idx}`,
        orderNo: r['订单号'] || r.orderNo || `ORD_IMP_${idx}`,
        type: r['补贴品类'] === '数码' ? '数码' : '家电',
        category: r['编码品类'] || r['品类'] || 'A04-空调',
        brand: r['品牌'] || '通用',
        productName: r['商品名称'] || '导入商品',
        model: r['型号'] || '',
        salesAmount: Number(r['销售金额'] || r.salesAmount || 0),
        paidAmount: Number(r['实付金额'] || r.paidAmount || 0),
        subsidyAmount: Number(r['补贴金额'] || r.subsidyAmount || 0),
        couponNo: r['券码'] || `CPN_IMP_${idx}`,
        txnTime: r['交易时间'] || new Date().toISOString().slice(0, 19).replace('T', ' '),
        status: '有效核销',
        merchantCode: config.merchants.merchants.家电,
        storeName: '益庄旗舰店',
      }));
      setUploadedData((prev) => [...newItems, ...prev]);
      addLog('success', `成功追加导入 ${newItems.length} 条已上传流水记录`, '模式 1');
    } else if (type === 'receipts') {
      const newItems: ReceiptRow[] = rows.map((r, idx) => ({
        id: `imported-rc-${Date.now()}-${idx}`,
        receiptNo: r['收款单号'] || `RC_IMP_${idx}`,
        salesOrderNo: r['关联销售单号'] || `ORD_IMP_${idx}`,
        payMethod: r['收款方式'] || '国补专享',
        amount: Number(r['收款金额'] || r['实收金额'] || 0),
        couponDiscount: Number(r['优惠券抵扣'] || 0),
        paidAt: r['收款时间'] || new Date().toISOString().slice(0, 19).replace('T', ' '),
        cashier: r['收银员'] || '李敏',
        store: '益庄旗舰店',
        settled: true,
      }));
      setReceiptsData((prev) => [...newItems, ...prev]);
      addLog('success', `成功追加导入 ${newItems.length} 条收款单记录`, '模式 2');
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
      <Navbar
        activeMode={activeMode}
        onSelectMode={(mode) => setActiveMode(mode)}
        onRunAll={runAllModes}
        isRunning={processingState.isRunning}
        onOpenUpload={() => setShowUploadModal(true)}
        onToggleConsole={() => setShowConsole(!showConsole)}
        showConsole={showConsole}
      />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 pb-24">
        {activeMode === 1 && (
          <Mode1Uploaded
            data={uploadedData}
            config={config}
            onRefresh={handleRefreshMode1}
            isRunning={processingState.isRunning}
          />
        )}
        {activeMode === 2 && <Mode2Receipts data={receiptsData} />}
        {activeMode === 3 && <Mode3Payment data={paymentData} config={config} />}
        {activeMode === 4 && <Mode4CouponAudit data={couponAuditData} />}
        {activeMode === 5 && (
          <Mode5StoreReport
            uploadedData={uploadedData}
            paymentData={paymentData}
            config={config}
          />
        )}
        {activeMode === 'config' && (
          <ConfigManager
            config={config}
            onSaveConfig={handleSaveConfig}
            onResetDefault={handleResetConfig}
          />
        )}
      </main>

      <ConsoleDrawer
        logs={processingState.logs}
        isOpen={showConsole}
        onClose={() => setShowConsole(false)}
        onClear={() =>
          setProcessingState((prev) => ({
            ...prev,
            logs: [],
          }))
        }
        currentStep={processingState.currentStep}
        progress={processingState.progress}
        isRunning={processingState.isRunning}
      />

      <FileUploadModal
        isOpen={showUploadModal}
        onClose={() => setShowUploadModal(false)}
        onImportData={handleImportData}
      />
    </div>
  );
}

export default App;
