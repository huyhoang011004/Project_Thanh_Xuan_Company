import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  Settings,
  LayoutTemplate,
  Sliders,
  Sparkles,
  Info,
  Wrench,
  PhoneCall,
  MessageSquare,
} from 'lucide-react';
import {
  SettingEditorHeaderComponent,
  SettingEditorFooterComponent,
  SettingEditorHomeComponent,
  SettingEditorVesinhComponent,
  SettingEditorAboutComponent,
  SettingEditorServiceComponent,
  SettingEditorContactComponent,
  SettingEditorZaloComponent,
} from './components';

const TABS = [
  { id: 'header', label: 'Header & Logo', icon: LayoutTemplate },
  { id: 'footer', label: 'Chân Trang', icon: LayoutTemplate },
  { id: 'home', label: 'Trang Chủ', icon: Sliders },
  { id: 'vesinh', label: 'Trang Vệ Sinh', icon: Sparkles },
  { id: 'about', label: 'Giới Thiệu', icon: Info },
  { id: 'service', label: 'Dịch Vụ B2B', icon: Wrench },
  { id: 'contact', label: 'Thông Tin Liên Hệ', icon: PhoneCall },
  { id: 'zalo', label: 'Tích Hợp Zalo OA', icon: MessageSquare },
];

export function SettingsPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const currentTab = searchParams.get('tab') || 'header';
  const [activeTab, setActiveTab] = useState(currentTab);

  useEffect(() => {
    const tab = searchParams.get('tab');
    if (tab) {
      setActiveTab(tab);
    }
  }, [searchParams]);

  const handleSelectTab = (tabId: string) => {
    setActiveTab(tabId);
    setSearchParams({ tab: tabId });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="p-2.5 rounded-xl bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400">
          <Settings className="w-6 h-6" />
        </div>
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">
            Cài Đặt Hệ Thống & Giao Diện
          </h1>
          <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">
            Quản lý chi tiết nội dung website, hotline, thương hiệu và cấu hình tích hợp
          </p>
        </div>
      </div>

      {/* Tabs navigation */}
      <div className="overflow-x-auto pb-2 scrollbar-none">
        <div className="inline-flex gap-1.5 p-1.5 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border border-gray-100 dark:border-slate-800 rounded-2xl shadow-xs">
          {TABS.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => handleSelectTab(tab.id)}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all cursor-pointer whitespace-nowrap ${
                  isActive
                    ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20'
                    : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100/70 dark:hover:bg-slate-800/60'
                }`}
              >
                <Icon className="w-4 h-4 shrink-0" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Tab content view */}
      <div className="transition-all duration-300">
        {activeTab === 'header' && <SettingEditorHeaderComponent />}
        {activeTab === 'footer' && <SettingEditorFooterComponent />}
        {activeTab === 'home' && <SettingEditorHomeComponent />}
        {activeTab === 'vesinh' && <SettingEditorVesinhComponent />}
        {activeTab === 'about' && <SettingEditorAboutComponent />}
        {activeTab === 'service' && <SettingEditorServiceComponent />}
        {activeTab === 'contact' && <SettingEditorContactComponent />}
        {activeTab === 'zalo' && <SettingEditorZaloComponent />}
      </div>
    </div>
  );
}
export default SettingsPage;
