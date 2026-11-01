export type TenantType = 'laundry' | 'moving';

const TENANT_STORAGE_KEY = 'tx_admin_tenant';

export function detectInitialTenant(): TenantType {
  if (typeof window === 'undefined') return 'laundry';

  const hostname = window.location.hostname.toLowerCase();
  if (hostname.includes('chuyennhatietkiem')) {
    return 'moving';
  }
  if (hostname.includes('thanhxuanlaundry')) {
    return 'laundry';
  }

  // Fallback to saved preference in localStorage or default 'laundry'
  const saved = localStorage.getItem(TENANT_STORAGE_KEY) as TenantType | null;
  if (saved === 'laundry' || saved === 'moving') {
    return saved;
  }
  return 'laundry';
}

export function getStoredTenant(): TenantType {
  if (typeof window === 'undefined') return 'laundry';
  return (localStorage.getItem(TENANT_STORAGE_KEY) as TenantType) || detectInitialTenant();
}

export function setStoredTenant(tenant: TenantType): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(TENANT_STORAGE_KEY, tenant);
  document.documentElement.setAttribute('data-tenant', tenant);
}
