"use client";
// Adhering to SOLID & Design Patterns
import { useState, useEffect, useCallback } from "react";
import { Order, CategoryNode } from "./admin-orders.types";
import { AdminOrdersService } from "./admin-orders.service";

export function useAdminOrders() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [serviceCategories, setServiceCategories] = useState<CategoryNode[]>([]);

  useEffect(() => {
    AdminOrdersService.getServiceCategories()
      .then(setServiceCategories)
      .catch(console.error);
  }, []);

  const fetchOrders = useCallback(async () => {
    setLoading(true);
    try {
      const data = await AdminOrdersService.getOrders(search, statusFilter);
      setOrders(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [search, statusFilter]);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  const handleUpdateStatus = async (id: string, newStatus: string) => {
    try {
      await AdminOrdersService.updateOrderStatus(id, newStatus);
      fetchOrders();
    } catch (err) {
      console.error(err);
    }
  };

  const handleSendZns = async (order: Order) => {
    try {
      await AdminOrdersService.sendZns(order);
      alert(`Đã gửi ZNS thành công tới SĐT ${order.phoneNumber}`);
      fetchOrders();
    } catch (err) {
      console.error(err);
    }
  };

  return {
    orders,
    loading,
    search,
    setSearch,
    statusFilter,
    setStatusFilter,
    isModalOpen,
    setIsModalOpen,
    serviceCategories,
    fetchOrders,
    handleUpdateStatus,
    handleSendZns,
  };
}
