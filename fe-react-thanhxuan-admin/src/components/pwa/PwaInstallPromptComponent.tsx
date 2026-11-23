// Adhering to SOLID & Design Patterns
import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { IosInstallGuideModal } from './IosInstallGuideModal';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed'; platform: string }>;
}

const INSTALLED_KEY = 'thanhxuan_admin_pwa_installed';
const DISMISSED_KEY = 'thanhxuan_admin_pwa_dismissed';
const DISMISS_DAYS = 7;

export function PwaInstallPromptComponent(): React.ReactElement | null {
  const [deferredPrompt, setDeferredPrompt] =
    useState<BeforeInstallPromptEvent | null>(null);
  const [showPrompt, setShowPrompt] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [showIOSModal, setShowIOSModal] = useState(false);

  useEffect(() => {
    let isCancelled = false;

    const checkInstallState = async () => {
      // 1. Nếu người dùng đã cài đặt app từ trước -> Không hiển thị
      if (localStorage.getItem(INSTALLED_KEY) === 'true') {
        return;
      }

      // 2. Kiểm tra chế độ standalone / fullscreen / PWA đã khởi chạy
      const isStandalone =
        window.matchMedia('(display-mode: standalone)').matches ||
        window.matchMedia('(display-mode: fullscreen)').matches ||
        window.matchMedia('(display-mode: minimal-ui)').matches ||
        (window.navigator as unknown as { standalone?: boolean }).standalone ===
          true ||
        document.referrer.startsWith('android-app://');

      if (isStandalone) {
        localStorage.setItem(INSTALLED_KEY, 'true');
        return;
      }

      // 3. Kiểm tra API getInstalledRelatedApps trên Chrome/Android/Desktop
      if ('getInstalledRelatedApps' in window.navigator) {
        try {
          const relatedApps = await (
            window.navigator as unknown as {
              getInstalledRelatedApps: () => Promise<unknown[]>;
            }
          ).getInstalledRelatedApps();
          if (Array.isArray(relatedApps) && relatedApps.length > 0) {
            localStorage.setItem(INSTALLED_KEY, 'true');
            return;
          }
        } catch {
          // Bỏ qua lỗi nếu trình duyệt không hỗ trợ đầy đủ
        }
      }

      if (isCancelled) return;

      // 4. Kiểm tra xem người dùng có vừa từ chối gần đây không (7 ngày)
      const dismissedUntil = localStorage.getItem(DISMISSED_KEY);
      if (dismissedUntil && Date.now() < parseInt(dismissedUntil, 10)) {
        return;
      }

      // 5. Nhận diện thiết bị di động
      const userAgent = window.navigator.userAgent.toLowerCase();
      const isIosDevice =
        /iphone|ipad|ipod/.test(userAgent) &&
        !(window as unknown as { MSStream?: boolean }).MSStream;
      const isMobileDevice =
        isIosDevice ||
        /android|webos|blackberry|iemobile|opera mini/i.test(userAgent) ||
        window.innerWidth < 1024;

      setIsIOS(isIosDevice);

      // 6. Xử lý hiển thị thông báo
      if (isMobileDevice) {
        if (isIosDevice) {
          // Trên iOS Safari: Không có beforeinstallprompt, chủ động hiện sau 2.5s
          const timer = setTimeout(() => {
            if (!isCancelled) {
              setShowPrompt(true);
            }
          }, 2500);

          return () => clearTimeout(timer);
        } else {
          // Trên Android/Chromium: CHỈ hiển thị khi sự kiện beforeinstallprompt phát ra
          // (Trình duyệt sẽ tự động KHÔNG phát sự kiện này nếu app đã cài trên máy)
          const handleBeforeInstallPrompt = (e: Event) => {
            e.preventDefault();
            if (!isCancelled) {
              setDeferredPrompt(e as BeforeInstallPromptEvent);
              setShowPrompt(true);
            }
          };

          window.addEventListener(
            'beforeinstallprompt',
            handleBeforeInstallPrompt
          );

          return () => {
            window.removeEventListener(
              'beforeinstallprompt',
              handleBeforeInstallPrompt
            );
          };
        }
      }
    };

    // Lắng nghe sự kiện trình duyệt cài đặt app thành công
    const handleAppInstalled = () => {
      localStorage.setItem(INSTALLED_KEY, 'true');
      setShowPrompt(false);
      setDeferredPrompt(null);
    };

    window.addEventListener('appinstalled', handleAppInstalled);

    let cleanupPromise: (() => void) | undefined;
    checkInstallState().then((cleanup) => {
      if (typeof cleanup === 'function') {
        cleanupPromise = cleanup;
      }
    });

    return () => {
      isCancelled = true;
      window.removeEventListener('appinstalled', handleAppInstalled);
      if (cleanupPromise) {
        cleanupPromise();
      }
    };
  }, []);

  const handleDismiss = () => {
    setShowPrompt(false);
    setShowIOSModal(false);
    const expiryTime = Date.now() + DISMISS_DAYS * 24 * 60 * 60 * 1000;
    localStorage.setItem(DISMISSED_KEY, expiryTime.toString());
  };

  const handleInstallClick = async () => {
    if (isIOS) {
      setShowIOSModal(true);
      return;
    }

    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === 'accepted') {
        localStorage.setItem(INSTALLED_KEY, 'true');
        setShowPrompt(false);
        setDeferredPrompt(null);
      } else {
        handleDismiss();
      }
    } else {
      setShowIOSModal(true);
    }
  };

  const domainName =
    typeof window !== 'undefined'
      ? window.location.hostname
      : 'quantri.thanhxuanlaundry.com';

  return (
    <>
      {showPrompt && (
        <aside
          role="region"
          aria-label="Thông báo cài đặt ứng dụng"
          className="fixed top-3 left-3 right-3 sm:left-auto sm:right-4 sm:w-96 z-50 animate-in fade-in slide-in-from-top-4 duration-300"
        >
          <div className="flex items-center gap-2.5 px-3 py-2.5 bg-slate-900/95 text-white backdrop-blur-md rounded-2xl shadow-2xl border border-slate-800">
            <button
              onClick={handleDismiss}
              aria-label="Đóng thông báo"
              className="text-slate-400 hover:text-white p-1 rounded-full transition-colors shrink-0"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="w-10 h-10 rounded-xl overflow-hidden shrink-0 border border-slate-700 bg-white p-0.5 shadow-sm">
              <img
                src="/pwa-192x192.png"
                alt="Quản Trị Thanh Xuân"
                className="w-full h-full object-cover rounded-lg"
              />
            </div>

            <div className="flex-1 min-w-0 pr-1">
              <h4 className="text-xs font-semibold text-slate-100 truncate">
                Cài đặt Quản Trị
              </h4>
              <p className="text-[11px] text-slate-400 truncate">
                {domainName}
              </p>
            </div>

            <button
              onClick={handleInstallClick}
              className="shrink-0 px-3.5 py-1.5 bg-sky-500 hover:bg-sky-400 active:scale-95 text-white text-xs font-semibold rounded-full shadow-sm transition-all"
            >
              {isIOS ? 'Hướng dẫn' : 'Cài đặt'}
            </button>
          </div>
        </aside>
      )}

      {/* iOS & Fallback Install Guide Modal */}
      <IosInstallGuideModal
        isOpen={showIOSModal}
        onClose={() => {
          setShowIOSModal(false);
          handleDismiss();
        }}
        appName="Quản Trị Thanh Xuân"
        appIcon="/pwa-192x192.png"
      />
    </>
  );
}
