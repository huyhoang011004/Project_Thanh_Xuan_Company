import { useTenant, TENANT_CONFIGS } from '@/app/TenantContext';
import { TenantType } from '@/lib/tenant-storage';

export function TenantSwitcher() {
  const { tenant, switchTenant } = useTenant();

  const handleToggle = () => {
    switchTenant(tenant === 'laundry' ? 'moving' : 'laundry');
  };

  const handleSelect = (newTenant: TenantType) => {
    if (newTenant !== tenant) {
      switchTenant(newTenant);
    }
  };

  const currentCfg = TENANT_CONFIGS[tenant];

  return (
    <>
      {/* Mobile view (< sm): One-touch compact pill */}
      <button
        type="button"
        onClick={handleToggle}
        className="sm:hidden flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-800 dark:text-slate-200 cursor-pointer shadow-xs shrink-0"
        title="Bấm để chuyển phân hệ"
      >
        <span
          className="h-2 w-2 rounded-full shrink-0"
          style={{ backgroundColor: currentCfg.colorHex }}
        />
        <span className="whitespace-nowrap">{tenant === 'laundry' ? 'Giặt Là' : 'Chuyển Nhà'}</span>
      </button>

      {/* Desktop view (>= sm): Two tabs side by side */}
      <div className="hidden sm:flex items-center gap-1 rounded-xl bg-slate-100 dark:bg-slate-800 p-1 border border-slate-200 dark:border-slate-700 shrink-0">
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
              <span>{cfg.shortName}</span>
            </button>
          );
        })}
      </div>
    </>
  );
}
