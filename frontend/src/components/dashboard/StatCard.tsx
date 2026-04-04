import { ReactNode } from "react";

interface StatCardProps {
  title: string;
  value: string | number;
  icon?: ReactNode;
  themeIcon?: string;
}

export default function StatCard({
  title,
  value,
  icon,
  themeIcon,
}: StatCardProps) {
  return (
    <div className="rounded-sm border border-gray-400 bg-white w-72 h-32 p-6 mt-5">
      <div className="flex items-center justify-between h-full">
        <div className="flex flex-col">
          <span className="text-lg text-gray-500">{title}</span>
          <span className="text-xl font-bold text-gray-800">{value}</span>
        </div>
        {icon && (
          <div className={`p-2 rounded bg-blue-100 ${themeIcon} `}>{icon}</div>
        )}
      </div>
    </div>
  );
}
