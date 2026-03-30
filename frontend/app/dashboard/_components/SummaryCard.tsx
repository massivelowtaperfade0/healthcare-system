"use client";
import React from "react";
import Link from "next/link";
import * as Icons from "lucide-react";

interface SummaryCardProps {
  title: string;
  value: string | number;
  icon: keyof typeof Icons;
  href: string;
  color?: "blue" | "red" | "green" | "amber";
}

const SummaryCard: React.FC<SummaryCardProps> = ({ 
  title, 
  value, 
  icon, 
  href, 
  color = "blue" 
}) => {
  const Icon = Icons[icon] as React.ElementType;

  // Dynamic color mapping for a medical UI feel
  const colorClasses = {
    blue: "text-blue-600 bg-blue-50 border-blue-100 hover:bg-blue-100",
    red: "text-red-600 bg-red-50 border-red-100 hover:bg-red-100",
    green: "text-green-600 bg-green-50 border-green-100 hover:bg-green-100",
    amber: "text-amber-600 bg-amber-50 border-amber-100 hover:bg-amber-100",
  };

  return (
    <Link href={href} className="block group">
      <div className={`p-6 rounded-2xl border-2 transition-all duration-300 transform group-hover:-translate-y-1 group-hover:shadow-lg ${colorClasses[color]}`}>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium opacity-80 uppercase tracking-wider">
              {title}
            </p>
            <h3 className="text-3xl font-bold mt-1 tracking-tight">
              {value !== undefined && value !== null ? value.toLocaleString() : "---"}
            </h3>
          </div>
          <div className="p-3 rounded-xl bg-white/50 shadow-sm">
            <Icon size={28} strokeWidth={2.5} />
          </div>
        </div>
        
        <div className="mt-4 flex items-center text-xs font-semibold opacity-70 group-hover:opacity-100 transition-opacity">
          <span>View Detailed Reports</span>
          <Icons.ChevronRight size={14} className="ml-1" />
        </div>
      </div>
    </Link>
  );
};

export default SummaryCard;