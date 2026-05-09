import { fetchWithAuth } from "@/app/_lib/fetch_client";
import { useEffect, useState } from "react"
import SummaryCard from "../_components/SummaryCard";

const AdminDashboard = () => {

  const [stats, setStats] = useState({
    failedLogins: 0,
    activeStaff: 0,
    pendingBills: 0,
  });

  useEffect(() => {
    async function fetchOverview() {
      const res = await fetchWithAuth(`${process.env.NEXT_PUBLIC_API_GATEWAY}/dashboard/summary`);
      if (res.ok) {
        const data = await res.json();
        setStats(data);
      }
    }
    fetchOverview()
  }, []);

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      <SummaryCard
        title="Security Alerts"
        value={stats.failedLogins}
        icon="ShieldAlert"
        href="/dashboard/security"
      />

      <SummaryCard
        title="Staff Members"
        value={stats.activeStaff}
        icon="Users"
        href="/dashboard/staff"
      />

      <SummaryCard
        title="Pending Invoices"
        value={stats.pendingBills}
        icon="CreditCard"
        href="/dashboard/finance"
      />
    </div>
  )
}

export default AdminDashboard