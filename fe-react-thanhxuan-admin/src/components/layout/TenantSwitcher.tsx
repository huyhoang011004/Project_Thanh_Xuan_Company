import { useTenant, TENANT_CONFIGS } from '@/app/TenantContext';
import { TenantType } from '@/lib/tenant-storage';

export function TenantSwitcher() {
  const { tenant, switchTenant } = useTenant();

  const handleSelect = (newTenant: TenantType) => {
    if (newTenant !== tenant) {
      switchTenant(newTenant);
    }
  };

  return (
    <div className="flex items-center gap-1 rounded-xl bg-slate-100 dark:bg-slate-800 p-1 border border-slate-200 dark:border-slate-700">
      {(['laundry', 'moving'] as TenantType[]).map((t) => {
        const cfg = TENANT_CONFIGS[t];
        const isActive = tenant === t;
        return (
          <button
            key={t}
            type="button"
            onClick={() => handleSelect(t)}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              isActive
                ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs'
                : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
            }`}
          >
            <span
              className="h-2 w-2 rounded-full"
              style={{ backgroundColor: cfg.colorHex }}
            />
            <span className="hidden sm:inline">{cfg.shortName}</span>
            <span className="sm:hidden">{t === 'laundry' ? 'Giặt' : 'Chuyển'}</span>
          </button>
        );
      })}
    </div>
  );
}
