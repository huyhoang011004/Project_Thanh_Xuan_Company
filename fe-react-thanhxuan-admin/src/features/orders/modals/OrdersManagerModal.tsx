"use client";
// Adhering to SOLID & Design Patterns
import React, { useState, useEffect } from "react";
import { X } from "lucide-react";
import { OrderFormData, CategoryNode } from "../admin-orders.types";
import { AdminOrdersService } from "../admin-orders.service";

interface OrdersManagerModalProps {
  isOpen: boolean;
  onClose: () => void;
  serviceCategories: CategoryNode[];
  onSuccess: () => void;
}

export function OrdersManagerModal({
  isOpen,
  onClose,
  serviceCategories,
  onSuccess,
}: OrdersManagerModalProps) {
  const [formData, setFormData] = useState<OrderFormData>({
    customerName: "",
    phoneNumber: "",
    address: "",
    serviceCategory: "",
    totalAmount: 0,
    notes: "",
  });

  useEffect(() => {
    if (isOpen && serviceCategories.length > 0 && !formData.serviceCategory) {
      const firstCat = serviceCategories[0];
      setFormData((prev) => ({ ...prev, serviceCategory: firstCat.name || firstCat.slug || "" }));
    }
  }, [isOpen, serviceCategories]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await AdminOrdersService.createOrder(formData);
      const defaultCat = serviceCategories[0]?.name || serviceCategories[0]?.slug || "giat-say";
      setFormData({
        customerName: "",
        phoneNumber: "",
        address: "",
        serviceCategory: defaultCat,
        totalAmount: 0,
        notes: "",
      });
      onSuccess();
      onClose();
    } catch (err) {
      console.error(err);
    }
  };

  // Hàm đệ quy render danh mục
  const renderCategoryOptions = (nodes: CategoryNode[], level = 0) => {
    return nodes.map((node) => {
      const indent = "— ".repeat(level);
      const val = node.name || node.slug;
      return (
        <React.Fragment key={node._id}>
          <option value={val}>
            {indent} {node.name}
          </option>
          {node.children &&
            node.children.length > 0 &&
            renderCategoryOptions(node.children, level + 1)}
        </React.Fragment>
      );
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-4">
        <div className="flex items-center justify-between border-b border-gray-100 dark:border-slate-800 pb-3">
          <h3 className="text-lg font-bold text-gray-900 dark:text-white">
            Tạo Đơn Hàng Giặt Sấy Mới
          </h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X className="w-5 h-5" />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
              Tên Khách hàng
            </label>
            <input
              type="text"
              required
              value={formData.customerName}
              onChange={(e) => setFormData({ ...formData, customerName: e.target.value })}
              className="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-slate-700 dark:bg-slate-800 dark:text-white text-sm"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
              Số điện thoại Zalo
            </label>
            <input
              type="text"
              required
              value={formData.phoneNumber}
              onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
              className="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-slate-700 dark:bg-slate-800 dark:text-white text-sm"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
              Địa chỉ giao nhận
            </label>
            <input
              type="text"
              value={formData.address}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              className="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-slate-700 dark:bg-slate-800 dark:text-white text-sm"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                Loại dịch vụ (Danh mục SERVICE)
              </label>
              <select
                value={formData.serviceCategory}
                onChange={(e) =>
                  setFormData({ ...formData, serviceCategory: e.target.value })
                }
                className="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-slate-700 dark:bg-slate-800 dark:text-white text-sm"
              >
                {serviceCategories.length === 0 ? (
                  <option value="giat-say">Giặt sấy lấy ngay</option>
                ) : (
                  renderCategoryOptions(serviceCategories)
                )}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                Tổng tiền (VNĐ)
              </label>
              <input
                type="number"
                value={formData.totalAmount}
                onChange={(e) =>
                  setFormData({ ...formData, totalAmount: Number(e.target.value) })
                }
                className="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-slate-700 dark:bg-slate-800 dark:text-white text-sm"
              />
            </div>
          </div>
          <div className="flex justify-end gap-3 pt-3 border-t border-gray-100 dark:border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-lg"
            >
              Hủy
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-sm bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700"
            >
              Lưu & Tự động gửi ZNS
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
