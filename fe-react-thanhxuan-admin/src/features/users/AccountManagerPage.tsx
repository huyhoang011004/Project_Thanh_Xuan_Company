import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Trash2, UserPlus, Loader2, Edit, MailCheck, MailX, RefreshCw } from "lucide-react";
import { toast } from "sonner";
import { confirmAlert } from "@/components/common";
import { apiClient } from "@/lib/api-client";
import { AccountEditorModal, UserFormData } from "./modals/AccountEditorModal";

export interface AdminUserItem {
  _id: string;
  id?: string;
  username: string;
  email: string;
  fullName?: string;
  role: string;
  receiveEmailNotifications?: boolean;
  createdAt: string;
  [key: string]: unknown;
}

export function AccountManagerPage() {
  const queryClient = useQueryClient();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [editingUser, setEditingUser] = useState<AdminUserItem | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  const { data: users = [], isLoading, refetch } = useQuery<AdminUserItem[]>({
    queryKey: ["admin_users"],
    queryFn: async () => {
      const res = await apiClient.get<unknown>("/users");
      const raw = res.data;
      if (Array.isArray(raw)) return raw as AdminUserItem[];
      const maybeList = (raw as { data?: AdminUserItem[]; users?: AdminUserItem[] });
      return maybeList?.users || maybeList?.data || [];
    },
  });

  const saveMutation = useMutation({
    mutationFn: async ({ id, data }: { id?: string; data: UserFormData }) => {
      if (id) {
        return await apiClient.put(`/users/${id}`, data);
      }
      return await apiClient.post("/users", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin_users"] });
      setIsModalOpen(false);
      setEditingUser(null);
      toast.success(editingUser ? "Cập nhật tài khoản thành công!" : "Tạo tài khoản thành công!");
    },
    onError: (err: unknown) => {
      const msg = err instanceof Error ? err.message : "Thao tác thất bại";
      setError(msg);
      toast.error(msg);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      return await apiClient.delete(`/users/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin_users"] });
      toast.success("Đã xóa tài khoản thành công!");
    },
    onError: (err: unknown) => {
      const msg = err instanceof Error ? err.message : "Không thể xóa tài khoản";
      toast.error(msg);
    },
  });

  const toggleEmailMutation = useMutation({
    mutationFn: async (user: AdminUserItem) => {
      const nextState = user.receiveEmailNotifications === false;
      return await apiClient.put(`/users/${user._id}`, {
        receiveEmailNotifications: nextState,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin_users"] });
      toast.success("Đã cập nhật trạng thái nhận mail thông báo!");
    },
    onError: () => {
      toast.error("Không thể đổi trạng thái nhận email");
    },
  });

  const filteredUsers = users.filter((u) => {
    if (!searchQuery.trim()) return true;
    const lowerQ = searchQuery.toLowerCase();
    return (
      u.username?.toLowerCase().includes(lowerQ) ||
      u.email?.toLowerCase().includes(lowerQ) ||
      u.fullName?.toLowerCase().includes(lowerQ)
    );
  });

  const handleOpenAdd = () => {
    setEditingUser(null);
    setError(null);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (user: AdminUserItem) => {
    setEditingUser(user);
    setError(null);
    setIsModalOpen(true);
  };

  const handleSubmit = (data: UserFormData, reset: () => void) => {
    setError(null);
    saveMutation.mutate(
      { id: editingUser?._id, data },
      {
        onSuccess: () => reset(),
      }
    );
  };

  const handleDelete = async (id: string) => {
    const isConfirmed = await confirmAlert({
      title: "Xóa tài khoản",
      text: "Bạn có chắc muốn xóa tài khoản này khỏi hệ thống?",
      icon: "warning",
    });

    if (isConfirmed) {
      deleteMutation.mutate(id);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header / Toolbar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 bg-white dark:bg-slate-900/80 backdrop-blur-md p-4 sm:p-6 rounded-2xl shadow-xs border border-gray-100 dark:border-slate-800">
        <div className="relative flex-1 max-w-md">
          <svg
            className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4"
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <circle cx="11" cy="11" r="8" />
            <path d="m21 21-4.3-4.3" />
          </svg>
          <input
            type="text"
            placeholder="Tìm theo Username hoặc Email..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 pr-4 py-2.5 border border-gray-200 dark:border-slate-700 rounded-xl text-sm font-medium text-gray-700 dark:text-gray-200 bg-gray-50 dark:bg-slate-800/60 outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 w-full transition-all"
          />
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => refetch()}
            className="p-2.5 rounded-xl border border-gray-200 dark:border-slate-700 text-gray-500 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-slate-800 transition cursor-pointer"
            title="Làm mới dữ liệu"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={handleOpenAdd}
            className="flex-1 sm:flex-initial justify-center bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold py-2.5 px-5 rounded-xl flex items-center space-x-2 transition-colors shadow-sm cursor-pointer"
          >
            <UserPlus size={16} />
            <span>Thêm Tài Khoản</span>
          </button>
        </div>
      </div>

      {/* Table Area */}
      <div className="bg-white dark:bg-slate-900/80 backdrop-blur-md rounded-2xl shadow-xs border border-gray-100 dark:border-slate-800 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[640px]">
            <thead>
              <tr className="bg-gray-50/80 dark:bg-slate-800/60 text-slate-600 dark:text-slate-300 text-xs sm:text-sm uppercase tracking-wider">
                <th className="p-4 font-semibold">Tên đăng nhập</th>
                <th className="p-4 font-semibold">Email nhận thông báo</th>
                <th className="p-4 font-semibold text-center">Nhận Mail</th>
                <th className="p-4 font-semibold text-center">Phân quyền</th>
                <th className="p-4 font-semibold text-center">Ngày tạo</th>
                <th className="p-4 font-semibold text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-sm">
              {isLoading ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-slate-400">
                    <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2 text-blue-500" />
                    Đang tải danh sách tài khoản...
                  </td>
                </tr>
              ) : filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-slate-500 dark:text-slate-400">
                    Chưa có dữ liệu tài khoản
                  </td>
                </tr>
              ) : (
                filteredUsers.map((user) => (
                  <tr
                    key={user._id}
                    className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors"
                  >
                    <td className="p-4 font-semibold text-slate-800 dark:text-slate-100">
                      <div>{user.fullName || user.username}</div>
                      <div className="text-xs text-slate-400 font-mono font-normal">@{user.username}</div>
                    </td>
                    <td className="p-4 text-slate-600 dark:text-slate-300 font-mono text-xs">
                      {user.email || <span className="text-red-400 italic">Chưa có</span>}
                    </td>
                    <td className="p-4 text-center">
                      <button
                        type="button"
                        onClick={() => toggleEmailMutation.mutate(user)}
                        disabled={toggleEmailMutation.isPending}
                        className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold transition cursor-pointer ${
                          user.receiveEmailNotifications !== false
                            ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300 hover:bg-emerald-100 dark:hover:bg-emerald-900/50"
                            : "bg-gray-100 text-gray-500 dark:bg-slate-800 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-slate-700"
                        }`}
                        title="Bấm để bật/tắt nhận email thông báo đơn hàng/liên hệ"
                      >
                        {user.receiveEmailNotifications !== false ? (
                          <>
                            <MailCheck size={14} className="text-emerald-600 dark:text-emerald-400" /> Bật nhận Mail
                          </>
                        ) : (
                          <>
                            <MailX size={14} /> Tắt
                          </>
                        )}
                      </button>
                    </td>
                    <td className="p-4 text-center">
                      <span
                        className={`px-2.5 py-1 rounded-full text-xs font-semibold ${
                          user.role?.toUpperCase() === "ADMIN"
                            ? "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300"
                            : "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300"
                        }`}
                      >
                        {user.role}
                      </span>
                    </td>
                    <td className="p-4 text-center text-slate-500 dark:text-slate-400 text-xs font-mono">
                      {user.createdAt ? new Date(user.createdAt).toLocaleDateString("vi-VN") : "—"}
                    </td>
                    <td className="p-4 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          type="button"
                          onClick={() => handleOpenEdit(user)}
                          className="text-blue-500 hover:text-blue-700 p-1.5 rounded-lg hover:bg-blue-50 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                          title="Sửa thông tin"
                        >
                          <Edit size={17} />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDelete(user._id)}
                          disabled={user.username === "admin"}
                          className="text-rose-500 hover:text-rose-700 disabled:opacity-30 p-1.5 rounded-lg hover:bg-rose-50 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                          title={user.username === "admin" ? "Không thể xóa tài khoản admin gốc" : "Xóa"}
                        >
                          <Trash2 size={17} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <AccountEditorModal
        isModalOpen={isModalOpen}
        setIsModalOpen={setIsModalOpen}
        onSubmit={handleSubmit}
        error={error}
        isPending={saveMutation.isPending}
        editingUser={editingUser}
      />
    </div>
  );
}

export { AccountManagerPage as UsersListPage };
