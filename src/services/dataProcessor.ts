import {
  AppConfig,
  UploadedRow,
  ReceiptRow,
  PaymentRow,
  CouponAuditRow,
  StoreReportRow,
} from '../types';

/**
 * Identify brand from product name and model based on keywords and model aliases
 */
export function identifyBrand(
  productName: string,
  model: string | undefined,
  type: 'appliance' | 'digital',
  config: AppConfig
): string {
  const pName = (productName || '').toUpperCase();
  const pModel = (model || '').trim();

  // 1. Check model aliases first (only for appliance)
  if (type === 'appliance' && config.paymentBrands.brand_model_aliases?.appliance) {
    if (pModel && config.paymentBrands.brand_model_aliases.appliance[pModel]) {
      return config.paymentBrands.brand_model_aliases.appliance[pModel];
    }
    // Also check if any model alias is in the product name
    for (const [aliasModel, brandName] of Object.entries(config.paymentBrands.brand_model_aliases.appliance)) {
      if (pName.includes(aliasModel.toUpperCase())) {
        return brandName;
      }
    }
  }

  // 2. Check brand keywords in priority order
  const keywordRules = config.paymentBrands.brand_keywords[type] || [];
  for (const rule of keywordRules) {
    for (const kw of rule.keywords) {
      if (pName.includes(kw.toUpperCase())) {
        return rule.brand;
      }
    }
  }

  return '其他';
}

/**
 * Normalize brand (e.g. COLMO -> 美的, 卡萨帝 -> 海尔, 统帅 -> 海尔, etc.)
 */
export function normalizeBrand(
  rawBrand: string,
  type: 'appliance' | 'digital',
  config: AppConfig
): string {
  // Check direct brand mapping
  if (config.brandMapping.brand_mapping[rawBrand]) {
    return config.brandMapping.brand_mapping[rawBrand];
  }

  // Check payment brands normalization
  const normMap = config.paymentBrands.brand_normalization?.[type];
  if (normMap && normMap[rawBrand]) {
    return normMap[rawBrand];
  }

  return rawBrand;
}

/**
 * Check and apply Midea Group display grouping (美的, 小天鹅, 东芝 in 洗衣机/冰箱 -> 美的系)
 */
export function getDisplayBrand(
  normalizedBrand: string,
  financialCategory: string,
  config: AppConfig
): string {
  const mideaRule = config.paymentBrands.midea_group;
  if (mideaRule && mideaRule.categories.includes(financialCategory)) {
    if (mideaRule.brands.includes(normalizedBrand) || normalizedBrand === '美的' || normalizedBrand === '小天鹅' || normalizedBrand === '东芝') {
      return '美的系';
    }
  }

  // Check report brand mapping
  if (config.brandMapping.report_brand_mapping[normalizedBrand]) {
    return config.brandMapping.report_brand_mapping[normalizedBrand];
  }

  return normalizedBrand;
}

/**
 * Generate Store Master Report (Mode 5) matching Table 1 layout
 */
export function generateStoreReport(
  uploadedData: UploadedRow[],
  paymentData: PaymentRow[],
  config: AppConfig
): StoreReportRow[] {
  // Map standard rows
  // Categories in order: 空调, 冰箱, 洗衣机, 电视, 厨卫, 电脑, 手机, 平板, 智能穿戴
  const standardBrandMatrix: Record<string, string[]> = {
    '空调': ['美的', '格力', '海尔', '奥克斯', '华凌', '小米', '海信', 'TCL', '其他'],
    '冰箱': ['美的系', '海尔', '容声', '西门子', '松下', '美菱', '其他'],
    '洗衣机': ['美的系', '海尔', '西门子', '松下', '小鸭', '其他'],
    '电视': ['海信', 'TCL', '创维', '小米', '华为', '索尼', '康佳', '三星', '长虹', '其他'],
    '厨卫': ['方太', '老板', 'A.O.史密斯', '美的', '万家乐', '万和', '帅康', '林内', '其他'],
    '电脑': ['联想', '华为', '苹果', '华硕', '惠普', '戴尔', '小米', '荣耀', '其他'],
    '手机': ['华为', '苹果', '小米', 'vivo', 'OPPO', '荣耀', '一加', '三星', '其他'],
    '平板': ['苹果', '华为', '小米', '荣耀', 'vivo', 'OPPO', '小天才', '其他'],
    '智能穿戴': ['华为', '苹果', '小米', '小天才', '荣耀', 'vivo', 'OPPO', '其他'],
  };

  // Group uploads
  const uploadMap = new Map<string, { count: number; subsidy: number }>();
  for (const row of uploadedData) {
    if (row.status === '重复流水' || row.status === '疑似退款') continue;

    const catKey = row.category.split('-')[1] || row.category;
    let finCat = '其他';
    if (row.type === '家电') {
      finCat = config.paymentBrands.categories.appliance[row.category] || catKey;
    } else {
      finCat = config.paymentBrands.categories.digital[row.category] || catKey;
    }

    const normB = normalizeBrand(row.brand, row.type === '家电' ? 'appliance' : 'digital', config);
    let dispB = getDisplayBrand(normB, finCat, config);

    // Special rule from repo: 方太冰箱与方太厨卫统一汇总至厨卫/方太
    if (normB === '方太' && finCat === '冰箱') {
      finCat = '厨卫';
      dispB = '方太';
    }

    const key = `${finCat}___${dispB}`;
    const curr = uploadMap.get(key) || { count: 0, subsidy: 0 };
    curr.count += 1;
    curr.subsidy += row.subsidyAmount;
    uploadMap.set(key, curr);
  }

  // Group payments
  const paymentMap = new Map<string, { count: number; subsidy: number }>();
  for (const row of paymentData) {
    let finCat = row.financialCategory;
    let dispB = row.displayBrand;

    // Special rule: 方太冰箱 -> 厨卫/方太
    if (row.normalizedBrand === '方太' && finCat === '冰箱') {
      finCat = '厨卫';
      dispB = '方太';
    }

    const key = `${finCat}___${dispB}`;
    const curr = paymentMap.get(key) || { count: 0, subsidy: 0 };
    curr.count += 1;
    curr.subsidy += row.subsidyAmount;
    paymentMap.set(key, curr);
  }

  // Build combined rows
  const result: StoreReportRow[] = [];
  const processedKeys = new Set<string>();

  for (const [category, brands] of Object.entries(standardBrandMatrix)) {
    for (const brand of brands) {
      const key = `${category}___${brand}`;
      processedKeys.add(key);
      const up = uploadMap.get(key) || { count: 0, subsidy: 0 };
      const pm = paymentMap.get(key) || { count: 0, subsidy: 0 };

      // Only include rows if there's either upload or payout data, or if it's a key brand
      if (up.count > 0 || pm.count > 0) {
        const diff = Number((up.subsidy - pm.subsidy).toFixed(2));
        const rate = up.subsidy > 0 ? Number(((pm.subsidy / up.subsidy) * 100).toFixed(1)) : (pm.subsidy > 0 ? 100 : 0);

        result.push({
          category,
          brand,
          uploadCount: up.count,
          uploadSubsidyAmount: Number(up.subsidy.toFixed(2)),
          payoutCount: pm.count,
          payoutSubsidyAmount: Number(pm.subsidy.toFixed(2)),
          diffAmount: diff,
          payoutRate: Math.min(100, Math.max(0, rate)),
        });
      }
    }
  }

  // Check any leftovers not in standard matrix
  for (const [key, up] of uploadMap.entries()) {
    if (!processedKeys.has(key)) {
      const [category, brand] = key.split('___');
      const pm = paymentMap.get(key) || { count: 0, subsidy: 0 };
      const diff = Number((up.subsidy - pm.subsidy).toFixed(2));
      const rate = up.subsidy > 0 ? Number(((pm.subsidy / up.subsidy) * 100).toFixed(1)) : 0;
      result.push({
        category,
        brand,
        uploadCount: up.count,
        uploadSubsidyAmount: Number(up.subsidy.toFixed(2)),
        payoutCount: pm.count,
        payoutSubsidyAmount: Number(pm.subsidy.toFixed(2)),
        diffAmount: diff,
        payoutRate: rate,
      });
    }
  }

  return result;
}
