import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Bell, Mail, CheckCircle2 } from 'lucide-react';
import { apiClient } from '@/lib/api-client';

interface INotifArticle {
  _id: string;
  title: string;
  createdAt: string;
}

interface INotifContact {
  _id: string;
  fullName: string;
  email?: string;
  phone?: string;
  createdAt: string;
}

export interface IUserProfile {
  _id?: string;
  id?: string;
  fullName?: string;
  name?: string;
  email?: string;
  lastReadArticleAt?: string;
  lastReadContactAt?: string;
}

interface Props {
  user?: IUserProfile | null;
  onUserUpdate?: (updatedUser: IUserProfile) => void;
}

export function AdminNotificationDropdownComponent({ user, onUserUpdate }: Props) {
  const navigate = useNavigate();
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const [notifTab, setNotifTab] = useState<'articles' | 'contacts'>('articles');
  const [recentArticles, setRecentArticles] = useState<INotifArticle[]>([]);
  const [recentContacts, setRecentContacts] = useState<INotifContact[]>([]);
  const [hasUnread, setHasUnread] = useState(false);

  const notifRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (notifRef.current && !notifRef.current.contains(event.target as Node)) {
        setIsNotifOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [resArticles, resContacts] = await Promise.allSettled([
          apiClient.get<unknown>('/articles'),
          apiClient.get<unknown>('/contacts'),
        ]);

        let foundUnread = false;

        if (resArticles.status === 'fulfilled') {
          const raw = resArticles.value.data;
          const list = Array.isArray(raw)
            ? raw
            : (raw as { articles?: unknown[]; data?: unknown[] })?.articles ||
              (raw as { data?: unknown[] })?.data ||
              [];
          const articlesList = (list as INotifArticle[]).sort(
            (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
          );
          const top5 = articlesList.slice(0, 5);
          setRecentArticles(top5);

          if (top5.length > 0) {
            const latestArticleTime = new Date(top5[0].createdAt).getTime();
            const userReadTime = user?.lastReadArticleAt
              ? new Date(user.lastReadArticleAt).getTime()
              : 0;
            if (latestArticleTime > userReadTime) {
              foundUnread = true;
            }
          }
        }

        if (resContacts.status === 'fulfilled') {
          const raw = resContacts.value.data;
          const contactsArray = Array.isArray(raw)
            ? raw
            : (raw as { contacts?: unknown[]; data?: unknown[] })?.contacts ||
              (raw as { data?: unknown[] })?.data ||
              [];
          const contactsList = (contactsArray as INotifContact[]).sort(
            (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
          );
          const top5 = contactsList.slice(0, 5);
          setRecentContacts(top5);

          if (top5.length > 0) {
            const latestContactTime = new Date(top5[0].createdAt).getTime();
            const userReadTime = user?.lastReadContactAt
              ? new Date(user.lastReadContactAt).getTime()
              : 0;
            if (latestContactTime > userReadTime) {
              foundUnread = true;
            }
          }
        }

        setHasUnread(foundUnread);
      } catch (err) {
        console.error('Lỗi lấy thông báo', err);
      }
    };

    fetchData();
  }, [user?.lastReadArticleAt, user?.lastReadContactAt]);

  const handleOpenNotif = async () => {
    const opening = !isNotifOpen;
    setIsNotifOpen(opening);
    if (opening && user && hasUnread) {
      setHasUnread(false);
      try {
        const userId = user._id || user.id;
        if (userId) {
          const now = new Date().toISOString();
          const res = await apiClient.put<IUserProfile>(`/users/${userId}/profile`, {
            lastReadArticleAt: now,
            lastReadContactAt: now,
          });
          if (onUserUpdate && res.data) {
            onUserUpdate(res.data);
          }
        }
      } catch (e) {
        console.error(e);
      }
    }
  };

  return (
    <div className="relative" ref={notifRef}>
      <button
        type="button"
        onClick={handleOpenNotif}
        className={`relative p-2 md:p-2.5 transition-colors rounded-xl cursor-pointer ${
          isNotifOpen
            ? 'bg-blue-50 dark:bg-slate-800 text-blue-600 dark:text-blue-400'
            : 'text-gray-400 hover:text-gray-600 dark:text-gray-300 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-slate-800'
        }`}
        aria-label="Thông báo hệ thống"
        title="Thông báo"
      >
        <Bell className="w-5 h-5" />
        {hasUnread && (
          <span className="absolute top-1.5 right-1.5 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white dark:border-slate-900 animate-pulse" />
        )}
      </button>

      {isNotifOpen && (
        <>
          {/* Mobile backdrop to easily dismiss */}
          <div
            className="fixed inset-0 z-40 bg-black/20 sm:hidden"
            onClick={() => setIsNotifOpen(false)}
          />

          <div className="fixed top-18 left-3 right-3 sm:absolute sm:top-full sm:left-auto sm:right-0 sm:mt-3 sm:w-80 bg-white dark:bg-slate-800 border border-gray-100 dark:border-slate-700 shadow-2xl rounded-2xl overflow-hidden z-50 animate-in fade-in slide-in-from-top-2">
            <div className="flex border-b border-gray-100 dark:border-slate-700">
            <button
              type="button"
              onClick={() => setNotifTab('articles')}
              className={`flex-1 py-3 text-xs md:text-sm font-semibold transition-colors cursor-pointer ${
                notifTab === 'articles'
                  ? 'text-blue-600 dark:text-blue-400 border-b-2 border-blue-600 dark:border-blue-400'
                  : 'text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-slate-700/50'
              }`}
            >
              Bài viết ({recentArticles.length})
            </button>
            <button
              type="button"
              onClick={() => setNotifTab('contacts')}
              className={`flex-1 py-3 text-xs md:text-sm font-semibold transition-colors cursor-pointer ${
                notifTab === 'contacts'
                  ? 'text-blue-600 dark:text-blue-400 border-b-2 border-blue-600 dark:border-blue-400'
                  : 'text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-slate-700/50'
              }`}
            >
              Liên hệ ({recentContacts.length})
            </button>
          </div>

          <div className="max-h-80 overflow-y-auto p-2">
            {notifTab === 'articles' && (
              <div className="space-y-1">
                {recentArticles.length === 0 ? (
                  <p className="text-sm text-gray-500 dark:text-gray-400 text-center py-6">
                    Không có bài viết mới
                  </p>
                ) : (
                  recentArticles.map((article) => (
                    <div
                      key={article._id}
                      onClick={() => {
                        setIsNotifOpen(false);
                        navigate('/articles');
                      }}
                      className="p-3 hover:bg-gray-50 dark:hover:bg-slate-700/50 rounded-xl cursor-pointer transition-colors"
                    >
                      <div className="flex items-start gap-3">
                        <div className="bg-green-100 dark:bg-green-900/30 p-2 rounded-lg text-green-600 dark:text-green-400 shrink-0">
                          <CheckCircle2 className="w-4 h-4" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-medium text-gray-800 dark:text-gray-200 truncate">
                            {article.title}
                          </p>
                          <p className="text-xs text-gray-400 mt-1">
                            {new Date(article.createdAt).toLocaleString('vi-VN')}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}

            {notifTab === 'contacts' && (
              <div className="space-y-1">
                {recentContacts.length === 0 ? (
                  <p className="text-sm text-gray-500 dark:text-gray-400 text-center py-6">
                    Không có liên hệ mới
                  </p>
                ) : (
                  recentContacts.map((contact) => (
                    <div
                      key={contact._id}
                      onClick={() => {
                        setIsNotifOpen(false);
                        navigate('/contacts');
                      }}
                      className="p-3 hover:bg-gray-50 dark:hover:bg-slate-700/50 rounded-xl cursor-pointer transition-colors"
                    >
                      <div className="flex items-start gap-3">
                        <div className="bg-blue-100 dark:bg-blue-900/30 p-2 rounded-lg text-blue-600 dark:text-blue-400 shrink-0">
                          <Mail className="w-4 h-4" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-medium text-gray-800 dark:text-gray-200 truncate">
                            {contact.fullName}
                          </p>
                          <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                            {contact.phone || contact.email || 'Yêu cầu tư vấn mới'}
                          </p>
                          <p className="text-xs text-gray-400 mt-1">
                            {new Date(contact.createdAt).toLocaleString('vi-VN')}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}
          </div>
        </div>
      </>
    )}
  </div>
);
}
