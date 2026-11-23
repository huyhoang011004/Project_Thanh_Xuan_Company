import { toast } from 'sonner';

export const confirmAlert = async ({
  title,
  text,
  confirmButtonText = 'Đồng ý',
  cancelButtonText = 'Hủy',
  icon = 'warning',
}: {
  title: string;
  text?: string;
  confirmButtonText?: string;
  cancelButtonText?: string;
  icon?: 'warning' | 'error' | 'success' | 'info' | 'question';
}): Promise<boolean> => {
  return new Promise((resolve) => {
    toast.custom((t) => (
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 rounded-2xl shadow-2xl max-w-sm w-full mx-auto space-y-3">
        <div className="flex items-center gap-2">
          {icon === 'warning' && <span className="text-amber-500 font-bold">⚠️</span>}
          {icon === 'error' && <span className="text-rose-500 font-bold">❌</span>}
          {icon === 'success' && <span className="text-emerald-500 font-bold">✅</span>}
          <h4 className="font-bold text-slate-900 dark:text-white text-base">{title}</h4>
        </div>
        {text && <p className="text-xs text-slate-500 dark:text-slate-400">{text}</p>}
        <div className="flex items-center justify-end gap-2 pt-2">
          <button
            type="button"
            onClick={() => {
              toast.dismiss(t);
              resolve(false);
            }}
            className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 cursor-pointer"
          >
            {cancelButtonText}
          </button>
          <button
            type="button"
            onClick={() => {
              toast.dismiss(t);
              resolve(true);
            }}
            className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-blue-600 hover:bg-blue-700 text-white cursor-pointer shadow-sm"
          >
            {confirmButtonText}
          </button>
        </div>
      </div>
    ), { duration: 15000 });
  });
};
