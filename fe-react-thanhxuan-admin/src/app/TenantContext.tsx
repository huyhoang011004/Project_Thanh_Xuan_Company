import React, { createContext, useContext, useEffect, useState } from 'react';
import {
  TenantType,
  detectInitialTenant,
  getStoredTenant,
  setStoredTenant as saveTenantToStorage,
} from '@/lib/tenant-storage';

export interface TenantConfig {
  id: TenantType;
  brandName: string;
  shortName: string;
  portalTitle: string;
  subdomain: string;
  colorHex: string;
  bgLightClass: string;
  textClass: string;
}

export const TENANT_CONFIGS: Record<TenantType, TenantConfig> = {
  laundry: {
    id: 'laundry',
    brandName: 'Thanh Xuân Laundry',
    shortName: 'Giặt Là',
    portalTitle: 'Quản Trị Giặt Sấy Thanh Xuân',
    subdomain: 'quantri.thanhxuanlaundry.com',
    colorHex: '#0284c7',
    bgLightClass: 'bg-sky-50 dark:bg-sky-950/40 text-sky-700 dark:text-sky-300 border border-sky-200 dark:border-sky-800',
    textClass: 'text-sky-600 dark:text-sky-400',
  },
  moving: {
    id: 'moving',
    brandName: 'Chuyển Nhà Tiết Kiệm',
    shortName: 'Chuyển Nhà',
    portalTitle: 'Quản Trị Chuyển Nhà Tiết Kiệm',
    subdomain: 'quantri.chuyennhatietkiem.vn',
    colorHex: '#ea580c',
    bgLightClass: 'bg-orange-50 dark:bg-orange-950/40 text-orange-700 dark:text-orange-300 border border-orange-200 dark:border-orange-800',
    textClass: 'text-orange-600 dark:text-orange-400',
  },
};

interface TenantContextValue {
  tenant: TenantType;
  config: TenantConfig;
  switchTenant: (newTenant: TenantType) => void;
}

const TenantContext = createContext<TenantContextValue | undefined>(undefined);

export function TenantProvider({ children }: { children: React.ReactNode }) {
  const [tenant, setTenantState] = useState<TenantType>(() => {
    return getStoredTenant() || detectInitialTenant();
  });

  const switchTenant = (newTenant: TenantType) => {
    setTenantState(newTenant);
    saveTenantToStorage(newTenant);
  };

  useEffect(() => {
    saveTenantToStorage(tenant);
    const config = TENANT_CONFIGS[tenant];
    document.title = config.portalTitle;
  }, [tenant]);

  const value: TenantContextValue = {
    tenant,
    config: TENANT_CONFIGS[tenant],
    switchTenant,
  };

  return <TenantContext.Provider value={value}>{children}</TenantContext.Provider>;
}

export function useTenant(): TenantContextValue {
  const context = useContext(TenantContext);
  if (!context) {
    throw new Error('useTenant must be used within a TenantProvider');
  }
  return context;
}
