"use client";
// Adhering to SOLID & Design Patterns
import { useState, useEffect, useCallback } from "react";
import { CrmCustomer } from "./admin-crm.types";
import { AdminCrmService } from "./admin-crm.service";

export function useAdminCrm() {
  const [customers, setCustomers] = useState<CrmCustomer[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [tagFilter, setTagFilter] = useState("");
  const [zaloFilter, setZaloFilter] = useState("");
  const [emailFilter, setEmailFilter] = useState("");

  const fetchCustomers = useCallback(async () => {
    setLoading(true);
    try {
      const data = await AdminCrmService.getCustomers(search, tagFilter, zaloFilter, emailFilter);
      setCustomers(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [search, tagFilter, zaloFilter, emailFilter]);

  useEffect(() => {
    fetchCustomers();
  }, [fetchCustomers]);

  return {
    customers,
    loading,
    search,
    setSearch,
    tagFilter,
    setTagFilter,
    zaloFilter,
    setZaloFilter,
    emailFilter,
    setEmailFilter,
    fetchCustomers,
  };
}
