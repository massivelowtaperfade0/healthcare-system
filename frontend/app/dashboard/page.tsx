"use client";
import { useAuth } from "../_context/AuthContext";
import Sidebar from "./_components/Sidebar";
import AdminDashboard from "./_roles/AdminDashboard";
// import DoctorDashboard from "./_roles/DoctorDashboard";
// import NurseDashboard from "@/app/dashboard/_roles/NurseDashboard";
import UserDashboard from "./_roles/UserDashboard"

export default function DashboardPage() {
  const { user, loading } = useAuth();
  console.log("Auth Status: ", {user, loading});

  if (loading) {
    console.log("Stuck in loading...")
    return <p>Loading...</p>;
  }
  if (!user) {
    console.log("No user found, showing login message");
    return <p>Please login first</p>;
  }
  console.log("User role: ", user?.activeOrg?.role);
  const currentUser = user?.activeOrg?.role?.toLowerCase();

  let DashboardComponent;
  switch (currentUser) {
    case "admin":
      DashboardComponent = AdminDashboard;
      break;
    // case "doctor":
    //   DashboardComponent = DoctorDashboard;
    //   break;
    // case "nurse":
    //   DashboardComponent = NurseDashboard;
    //   break;
    default:
      DashboardComponent = UserDashboard;
      
  }


  return (
    <div className="flex">
      <Sidebar user={user} />
      <div className="p-10 flex-1">
        <h1 className="text-4xl mb-5">Dashboard</h1>
        <DashboardComponent />
      </div>
    </div>
  );
}