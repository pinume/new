import React, { useState } from 'react';
import {
  Settings,
  Save,
  RotateCcw,
  Plus,
  Trash2,
  Tv,
  Cpu,
  Check,
  FileCode2
} from 'lucide-react';
import * as yaml from 'js-yaml';
import { AppConfig } from '../types';

interface ConfigManagerProps {
  config: AppConfig;
  onSaveConfig: (newConfig: AppConfig) => void;
  onResetDefault: () => void;
}

export const ConfigManager: React.FC<ConfigManagerProps> = ({
  config,
  onSaveConfig,
  onResetDefault,
}) => {
  const [activeTab, setActiveTab] = useState<'merchants' | 'brands' | 'yaml'>('merchants');
  const [tempConfig, setTempConfig] = useState<AppConfig>(config);
  const [savedNotice, setSavedNotice] = useState(false);

  // New item inputs
  const [newModel, setNewModel] = useState('');
  const [newModelBrand, setNewModelBrand] = useState('');

  // YAML editor state
  const [yamlText, setYamlText] = useState(() => yaml.dump(config));

  const handleSave = () => {
    onSaveConfig(tempConfig);
    setYamlText(yaml.dump(tempConfig));
    setSavedNotice(true);
    setTimeout(() => setSavedNotice(false), 2500);
  };

  const handleSaveYaml = () => {
    try {
      const parsed = yaml.load(yamlText) as AppConfig;
      setTempConfig(parsed);
      onSaveConfig(parsed);
      setSavedNotice(true);
      setTimeout(() => setSavedNotice(false), 2500);
    } catch (err: any) {
      alert(`YAML 解析失败: ${err.message}`);
    }
  };

  const handleAddModelAlias = () => {
    if (!newModel.trim() || !newModelBrand.trim()) return;
    setTempConfig((prev) => ({
      ...prev,
      paymentBrands: {
        ...prev.paymentBrands,
        brand_model_aliases: {
          ...prev.paymentBrands.brand_model_aliases,
          appliance: {
            ...prev.paymentBrands.brand_model_aliases.appliance,
            [newModel.trim()]: newModelBrand.trim(),
          },
        },
      },
    }));
    setNewModel('');
    setNewModelBrand('');
  };

  const handleRemoveModelAlias = (modelKey: string) => {
    setTempConfig((prev) => {
      const nextAliases = { ...prev.paymentBrands.brand_model_aliases.appliance };
      delete nextAliases[modelKey];
      return {
        ...prev,
        paymentBrands: {
          ...prev.paymentBrands,
          brand_model_aliases: {
            ...prev.paymentBrands.brand_model_aliases,
            appliance: nextAliases,
          },
        },
      };
    });
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-cyan-500/10 text-cyan-400 rounded-xl border border-cyan-500/20">
            <Settings className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-bold text-white">系统配置管理 (config/)</h2>
              {savedNotice && (
                <span className="px-2 py-0.5 text-xs bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 rounded-md flex items-center gap-1">
                  <Check className="w-3.5 h-3.5" />
                  已保存并生效
                </span>
              )}
            </div>
            <p className="text-xs text-slate-400 mt-1">
              管理家电/数码商户编号、品牌归一化、美的系归并与型号关键词匹配规则
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          <button
            onClick={onResetDefault}
            className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-medium rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>重置为默认</span>
          </button>
          <button
            onClick={activeTab === 'yaml' ? handleSaveYaml : handleSave}
            className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white shadow-md shadow-cyan-600/20 transition-all"
          >
            <Save className="w-3.5 h-3.5" />
            <span>保存配置</span>
          </button>
        </div>
      </div>

      {/* Sub Tabs */}
      <div className="flex gap-2 border-b border-slate-800 pb-2">
        <button
          onClick={() => setActiveTab('merchants')}
          className={`px-3.5 py-1.5 rounded-lg text-xs font-medium transition-colors ${
            activeTab === 'merchants'
              ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
          }`}
        >
          1. 商户编号 (merchants.yaml)
        </button>
        <button
          onClick={() => setActiveTab('brands')}
          className={`px-3.5 py-1.5 rounded-lg text-xs font-medium transition-colors ${
            activeTab === 'brands'
              ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
          }`}
        >
          2. 品牌与型号规则 (payment_brands.yaml)
        </button>
        <button
          onClick={() => {
            setYamlText(yaml.dump(tempConfig));
            setActiveTab('yaml');
          }}
          className={`px-3.5 py-1.5 rounded-lg text-xs font-medium transition-colors flex items-center gap-1.5 ${
            activeTab === 'yaml'
              ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
          }`}
        >
          <FileCode2 className="w-3.5 h-3.5" />
          <span>YAML 源码模式</span>
        </button>
      </div>

      {/* Tab 1: Merchants Config */}
      {activeTab === 'merchants' && (
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4">
          <div className="text-xs text-slate-400">
            每类补贴的商户编号，用于回款明细筛选与已上传文件（<code className="text-cyan-300">MER_&lt;商户编号&gt;_yjhx.xlsx</code>）定位：
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="p-4 bg-slate-950 rounded-xl border border-slate-800 space-y-2">
              <div className="flex items-center gap-2 text-cyan-400 text-xs font-semibold">
                <Tv className="w-4 h-4" />
                <span>家电商户编号 (merchants.家电)</span>
              </div>
              <input
                type="text"
                value={tempConfig.merchants.merchants.家电}
                onChange={(e) =>
                  setTempConfig({
                    ...tempConfig,
                    merchants: {
                      merchants: {
                        ...tempConfig.merchants.merchants,
                        家电: e.target.value.trim(),
                      },
                    },
                  })
                }
                className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-xs font-mono text-cyan-300 focus:outline-none focus:border-cyan-500"
              />
              <p className="text-[11px] text-slate-500">示例: 89813015722APT1</p>
            </div>

            <div className="p-4 bg-slate-950 rounded-xl border border-slate-800 space-y-2">
              <div className="flex items-center gap-2 text-purple-400 text-xs font-semibold">
                <Cpu className="w-4 h-4" />
                <span>数码商户编号 (merchants.数码)</span>
              </div>
              <input
                type="text"
                value={tempConfig.merchants.merchants.数码}
                onChange={(e) =>
                  setTempConfig({
                    ...tempConfig,
                    merchants: {
                      merchants: {
                        ...tempConfig.merchants.merchants,
                        数码: e.target.value.trim(),
                      },
                    },
                  })
                }
                className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-xs font-mono text-purple-300 focus:outline-none focus:border-purple-500"
              />
              <p className="text-[11px] text-slate-500">示例: 89813014812B06R</p>
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Brand & Model Aliases */}
      {activeTab === 'brands' && (
        <div className="space-y-4">
          {/* Add Model Alias */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4">
            <h3 className="text-xs font-bold text-white flex items-center gap-2">
              <span>新增型号归并别名 (brand_model_aliases)</span>
            </h3>
            <div className="flex flex-col sm:flex-row gap-3 items-center">
              <input
                type="text"
                placeholder="输入型号关键词 (例如: KFR-50GW/CX2S, 65A6Q)"
                value={newModel}
                onChange={(e) => setNewModel(e.target.value)}
                className="w-full sm:w-1/2 px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-xs text-slate-200 focus:outline-none focus:border-cyan-500"
              />
              <input
                type="text"
                placeholder="对应品牌 (例如: 海信, 美的, 松下)"
                value={newModelBrand}
                onChange={(e) => setNewModelBrand(e.target.value)}
                className="w-full sm:w-1/3 px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-xs text-slate-200 focus:outline-none focus:border-cyan-500"
              />
              <button
                onClick={handleAddModelAlias}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 px-4 py-2 bg-cyan-600 hover:bg-cyan-500 text-white rounded-lg text-xs font-semibold transition-colors"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>添加规则</span>
              </button>
            </div>
          </div>

          {/* Model Aliases List */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold text-white">已配置的型号别名列表</h3>
              <span className="text-xs text-slate-500 font-mono">
                共 {Object.keys(tempConfig.paymentBrands.brand_model_aliases?.appliance || {}).length} 条
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5 max-h-96 overflow-y-auto pr-1">
              {Object.entries(tempConfig.paymentBrands.brand_model_aliases?.appliance || {}).map(
                ([model, bName]) => (
                  <div
                    key={model}
                    className="flex items-center justify-between p-2.5 bg-slate-950 border border-slate-800 rounded-lg text-xs"
                  >
                    <div className="truncate mr-2 font-mono">
                      <span className="text-slate-300 font-medium">{model}</span>
                      <span className="text-slate-500 mx-1.5">→</span>
                      <span className="text-cyan-400 font-semibold">{bName}</span>
                    </div>
                    <button
                      onClick={() => handleRemoveModelAlias(model)}
                      className="text-slate-500 hover:text-rose-400 p-1 rounded hover:bg-slate-900 shrink-0"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                )
              )}
            </div>
          </div>
        </div>
      )}

      {/* Tab 3: YAML Raw Editor */}
      {activeTab === 'yaml' && (
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-3">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>支持直接编辑完整 YAML 格式配置：</span>
          </div>
          <textarea
            value={yamlText}
            onChange={(e) => setYamlText(e.target.value)}
            rows={18}
            className="w-full p-3.5 bg-slate-950 border border-slate-800 rounded-xl font-mono text-xs text-cyan-300 focus:outline-none focus:border-cyan-500 leading-relaxed"
          />
        </div>
      )}
    </div>
  );
};
