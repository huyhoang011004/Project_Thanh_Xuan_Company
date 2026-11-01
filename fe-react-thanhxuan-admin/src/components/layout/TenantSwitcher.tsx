import { useTenant, TENANT_CONFIGS } from '@/app/TenantContext';
import { ArrowRightLeft } from 'lucide-react';
import { TenantType } from '@/lib/tenant-storage';

export function TenantSwitcher() {
  const { tenant, switchTenant } = useTenant();

  const handleSelect = (newTenant: TenantType) => {
    if (newTenant !== tenant) {
      switchTenant(newTenant);
    }
  };

  return (
    <div className="flex items-center gap-1 rounded-xl bg-slate-100 p-1 border border-slate-200">
      {(['laundry', 'moving'] as TenantType[]).map((t) => {
        const cfg = TENANT_CONFIGS[t];
        const isActive = tenant === t;
        return (
          <button
            key={t}
            type="button"
            onClick={() => handleSelect(t)}
            className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              isActive
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            <span
              className="h-2 w-2 rounded-full"
              style={{ backgroundColor: cfg.colorHex }}
            />
            {cfg.shortName}
          </button>
        );
      })}
      <div className="px-1 text-slate-300">
        <ArrowRightLeft className="h-3 w-3" />
      </div>
    </div>
  );
}
