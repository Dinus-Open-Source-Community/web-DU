import type { RoleChange } from "./types";

const RECENT_ROLE_CHANGES: RoleChange[] = [
  { name: "Sarah Johnson", newRole: "Mentor" },
  { name: "Budi Santoso", newRole: "Admin" },
  { name: "Rina Marlina", newRole: "Staff" },
];

export default function QuickInsight() {
  return (
    <div className="w-full lg:w-[260] shrink-0 rounded-xl border border-[#E5E7EB] bg-white shadow-xs p-5 flex flex-col gap-4 self-start">
      {/* Title */}
      <h3 className="text-base font-bold text-[#111827]">Quick Insight</h3>

      {/* New User This Week */}
      <div className="rounded-lg bg-[#EFF6FF] px-4 py-3 flex items-center justify-between">
        <span className="text-sm font-semibold text-[#1D4ED8]">
          New User This Week
        </span>
        <span className="text-sm font-bold text-[#2563EB]">+24</span>
      </div>

      {/* Active Member */}
      <div className="rounded-lg bg-[#F0FDF4] px-4 py-3 flex items-center justify-between">
        <span className="text-sm font-semibold text-[#15803D]">
          Active Member
        </span>
        <span className="text-sm font-bold text-[#16A34A]">18/20</span>
      </div>

      {/* Recent Role Change */}
      <div className="flex flex-col gap-2">
        <h4 className="text-sm font-bold text-[#111827]">Recent role change</h4>
        <ul className="flex flex-col gap-2">
          {RECENT_ROLE_CHANGES.map((item, idx) => (
            <li
              key={idx}
              className="flex items-center justify-between text-sm text-[#374151]"
            >
              <span className="font-medium">{item.name}</span>
              <span className="flex items-center gap-1 text-[#6B7280]">
                <span className="text-[#9CA3AF]">→</span>
                <span className="font-semibold text-[#374151]">
                  {item.newRole}
                </span>
              </span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
