import { toast } from "sonner";
import type { IContactItem } from "../types/admin-contacts.types";

interface ExportExcelOptions {
  filteredContacts: IContactItem[];
  statusFilter: string;
  startDate: string;
  endDate: string;
  getCategoryName: (slug: string) => string;
}

export async function exportContactsToExcel({
  filteredContacts,
  getCategoryName,
}: ExportExcelOptions): Promise<void> {
  try {
    const headers = ['STT', 'Họ tên', 'Điện thoại', 'Email', 'Chuyên mục', 'Ghi chú / Yêu cầu', 'Trạng thái', 'Ngày tiếp nhận'];
    const rows = filteredContacts.map((c, i) => [
      i + 1,
      `"${(c.fullName || '').replace(/"/g, '""')}"`,
      `"${c.phoneNumber || c.phone || ''}"`,
      `"${c.email || ''}"`,
      `"${(getCategoryName(c.serviceCategory || c.categorySlug || '') || '').replace(/"/g, '""')}"`,
      `"${(c.notes || c.message || '').replace(/"/g, '""')}"`,
      `"${c.status || ''}"`,
      `"${new Date(c.createdAt).toLocaleString('vi-VN')}"`,
    ]);

    const csvContent = '\uFEFF' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `DanhSachLienHe_${Date.now()}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success('Đã xuất danh sách liên hệ ra file Excel (CSV) thành công!');
  } catch {
    toast.error('Có lỗi xảy ra khi xuất file danh sách liên hệ');
  }
}
