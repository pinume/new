export type ModeType = 1 | 2 | 3 | 4 | 5 | 'all' | 'config';

export interface MerchantConfig {
  merchants: {
    家电: string;
    数码: string;
  };
}

export interface BrandMappingConfig {
  brand_mapping: Record<string, string>;
  report_brand_mapping: Record<string, string>;
}

export interface BrandKeywordRule {
  brand: string;
  keywords: string[];
}

export interface PaymentBrandsConfig {
  categories: {
    appliance: Record<string, string>;
    digital: Record<string, string>;
  };
  brand_keywords: {
    appliance: BrandKeywordRule[];
    digital: BrandKeywordRule[];
  };
  brand_normalization: {
    appliance: Record<string, string>;
    digital?: Record<string, string>;
  };
  midea_group: {
    categories: string[];
    brands: string[];
  };
  brand_model_aliases: {
    appliance: Record<string, string>;
    digital?: Record<string, string>;
  };
}

export interface AppConfig {
  merchants: MerchantConfig;
  brandMapping: BrandMappingConfig;
  paymentBrands: PaymentBrandsConfig;
}

// Mode 1: Uploaded Subsidy Row
export interface UploadedRow {
  id: string;
  txnNo: string; // 交易流水号
  orderNo: string; // 订单号
  type: '家电' | '数码'; // 补贴品类
  category: string; // 细分品类 A01-电视机, B01-手机
  brand: string; // 品牌
  productName: string; // 商品名称
  model?: string; // 型号
  salesAmount: number; // 销售金额 (元)
  paidAmount: number; // 实付金额 (元)
  subsidyAmount: number; // 补贴金额 (元)
  couponNo: string; // 券码
  txnTime: string; // 交易时间
  status: '有效核销' | '疑似退款' | '金额不符' | '重复流水';
  merchantCode: string; // 商户编号
  storeName: string; // 门店名称
  cashier?: string;
  issueReason?: string;
}

// Mode 2: Store Receipt Row
export interface ReceiptRow {
  id: string;
  receiptNo: string; // 收款单号
  salesOrderNo: string; // 销售单号
  payMethod: '国补专享' | '银联云闪付' | '微信支付' | '现金' | '银行卡' | '商场预存';
  amount: number; // 收款金额
  couponDiscount: number; // 优惠券抵扣
  paidAt: string; // 收款时间
  cashier: string; // 收银员
  store: string; // 门店
  settled: boolean;
}

// Mode 3: Payment / Remittance Row
export interface PaymentRow {
  id: string;
  payoutNo: string; // 银联结算流水
  merchantCode: string; // 商户编号
  subsidyType: '家电' | '数码';
  categoryCode: string; // A01-电视机
  financialCategory: string; // 电视
  originalBrand: string; // 原始/识别品牌
  normalizedBrand: string; // 归一化后品牌 (如 COLMO->美的)
  displayBrand: string; // 报表展示品牌 (如 美的系)
  productName: string; // 商品名称
  orderAmount: number;
  subsidyAmount: number; // 实际回款补贴 (元)
  settlementDate: string;
  status: '已回款' | '清算中' | '退款冲正' | '待对账';
}

// Mode 4: Coupon Sales Audit Row
export interface CouponAuditRow {
  id: string;
  couponCode: string; // 券码
  couponName: string; // 券活动名
  posOrderNo: string; // POS订单号
  platformTxnNo: string; // 平台流水号
  productType: '家电' | '数码';
  productName: string;
  orderAmount: number;
  couponDiscount: number;
  platformSubsidy: number;
  matchStatus: '完全匹配' | '金额不一致' | '平台有单门店未入账' | '门店有单平台未核销';
  verifiedAt: string;
  diffAmount: number;
  notes?: string;
}

// Mode 5: Store Report Summary Row
export interface StoreReportRow {
  category: string; // 财务大类 (空调, 冰箱, 洗衣机, 电视, 厨卫, 电脑, 手机, 平板, 智能穿戴)
  brand: string; // 品牌 (美的系, 格力, 海尔, 华为, 方太, etc.)
  uploadCount: number; // 上传笔数
  uploadSubsidyAmount: number; // 上传补贴额 (元)
  payoutCount: number; // 回款笔数
  payoutSubsidyAmount: number; // 回款补贴额 (元)
  diffAmount: number; // 差额 = 上传 - 回款
  payoutRate: number; // 回款率 = 回款 / 上传 * 100%
  rowClassification?: string;
}

// Execution and Log Types
export interface ProcessLog {
  id: string;
  timestamp: string;
  level: 'info' | 'warn' | 'error' | 'success' | 'metric';
  step?: string;
  message: string;
  detail?: string;
}

export interface ProcessingState {
  isRunning: boolean;
  activeMode: number | 'all' | null;
  progress: number;
  currentStep: string;
  totalSteps: number;
  completedSteps: number;
  logs: ProcessLog[];
  lastRunTime?: string;
}
