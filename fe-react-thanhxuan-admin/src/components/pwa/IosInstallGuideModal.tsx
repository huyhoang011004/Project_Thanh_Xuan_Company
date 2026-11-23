import React, { useEffect } from 'react';
import { Share2, PlusSquare } from 'lucide-react';

interface IosInstallGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
  appName?: string;
  appIcon?: string;
}

export function IosInstallGuideModal({
  isOpen,
  onClose,
  appName = 'Quản Trị Thanh Xuân',
  appIcon = '/pwa-192x192.png',
}: IosInstallGuideModalProps): React.ReactElement | null {
  useEffect(() => {
    if (!isOpen) return;

    const modalId = `admin_ios_install_${Date.now()}`;
    window.history.pushState({ modalOpen: true, modalId }, '');

    let isDismissedByPopstate = false;

    const handlePopState = () => {
      isDismissedByPopstate = true;
      onClose();
    };

    window.addEventListener('popstate', handlePopState);

    return () => {
      window.removeEventListener('popstate', handlePopState);
      if (!isDismissedByPopstate && window.history.state?.modalId === modalId) {
        window.history.back();
      }
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in"
      onClick={onClose}
    >
      <div
        className="bg-white dark:bg-slate-900 rounded-3xl max-w-sm w-full p-6 shadow-2xl border border-slate-100 dark:border-slate-800 text-center animate-in zoom-in-95"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="w-14 h-14 mx-auto mb-4 rounded-2xl overflow-hidden shadow-md border border-slate-100 dark:border-slate-800 bg-white p-1">
          <img
            src={appIcon}
            alt={appName}
            className="w-full h-full object-cover rounded-xl"
          />
        </div>

        <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">
          Cài Đặt Lên Màn Hình Chính
        </h3>

        <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed mb-6">
          Để cài đặt ứng dụng <strong>{appName}</strong> trên iPhone hoặc iPad, vui lòng thao tác 2 bước:
        </p>

        <div className="space-y-3 text-left text-xs bg-slate-50 dark:bg-slate-800/60 p-4 rounded-2xl border border-slate-100 dark:border-slate-700/60 mb-6">
          <div className="flex items-center gap-3">
            <span className="w-6 h-6 rounded-full bg-sky-100 dark:bg-sky-900/60 text-sky-600 dark:text-sky-400 font-bold flex items-center justify-center shrink-0">
              1
            </span>
            <span className="flex-1 text-slate-700 dark:text-slate-300">
              Nhấn nút <strong>Chia sẻ (Share)</strong>{' '}
              <Share2 className="inline w-3.5 h-3.5 text-sky-500 mx-1" /> ở thanh điều hướng Safari.
            </span>
          </div>

          <div className="flex items-center gap-3">
            <span className="w-6 h-6 rounded-full bg-sky-100 dark:bg-sky-900/60 text-sky-600 dark:text-sky-400 font-bold flex items-center justify-center shrink-0">
              2
            </span>
            <span className="flex-1 text-slate-700 dark:text-slate-300">
              Cuộn xuống chọn <strong>Thêm vào Màn hình chính</strong>{' '}
              <PlusSquare className="inline w-3.5 h-3.5 text-slate-700 dark:text-slate-200 mx-1" />.
            </span>
          </div>
        </div>

        <button
          onClick={onClose}
          className="w-full py-3 bg-sky-600 hover:bg-sky-700 text-white rounded-xl text-xs font-semibold shadow-md active:scale-95 transition-all"
        >
          Đã hiểu
        </button>
      </div>
    </div>
  );
}
