"use client";

import { useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Plus,
  Search,
  Pencil,
  ArrowLeftRight,
  Trash2,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import QuickInsight from "./QuickInsight";
import { Badge } from "@/components/ui/badge";
import type { User, Status } from "./types";

function statusVariant(
  status: Status,
): "userActive" | "userInactive" | "userPending" {
  switch (status) {
    case "Active":
      return "userActive";
    case "Inactive":
      return "userInactive";
    case "Pending":
      return "userPending";
  }
}

const USERS: User[] = []

function UserAvatarCell({ user }: { user: User }) {
  const initials = user.name
    .split(" ")
    .map((n) => n[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  return (
    <div className="flex items-center gap-3">
      <Avatar size="default">
        {user.avatar ? <AvatarImage src={user.avatar} alt={user.name} /> : null}
        <AvatarFallback className="bg-[#E2E8F0] text-[#475569] text-xs font-semibold">
          {initials}
        </AvatarFallback>
      </Avatar>
      <div className="flex flex-col">
        <span className="text-sm font-semibold text-[#111827]">
          {user.name}
        </span>
        <span className="text-xs text-[#9CA3AF]">{user.email}</span>
      </div>
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

const ROWS_PER_PAGE = 5;

export default function UserDataTable() {
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [currentPage, setCurrentPage] = useState(1);

  const filtered = USERS.filter((user) => {
    const matchSearch =
      user.name.toLowerCase().includes(search.toLowerCase()) ||
      user.email.toLowerCase().includes(search.toLowerCase());
    const matchRole = roleFilter === "all" || user.role === roleFilter;
    const matchStatus = statusFilter === "all" || user.status === statusFilter;
    return matchSearch && matchRole && matchStatus;
  });

  const totalPages = Math.max(1, Math.ceil(filtered.length / ROWS_PER_PAGE));
  const safePage = Math.min(currentPage, totalPages);
  const paginated = filtered.slice(
    (safePage - 1) * ROWS_PER_PAGE,
    safePage * ROWS_PER_PAGE,
  );

  const handleSearch = (val: string) => {
    setSearch(val);
    setCurrentPage(1);
  };
  const handleRoleFilter = (val: string) => {
    setRoleFilter(val);
    setCurrentPage(1);
  };
  const handleStatusFilter = (val: string) => {
    setStatusFilter(val);
    setCurrentPage(1);
  };

  const handleEdit = (id: number) => console.log("Edit user", id);
  const handleChange = (id: number) => console.log("Change role for user", id);
  const handleDelete = (id: number) => console.log("Delete user", id);

  return (
    <div className="flex flex-col lg:flex-row gap-4 w-full items-start">
      {/* ── Table Panel ─────────────────────────────────────────────────────── */}
      <div className="flex-1 min-w-0 rounded-xl border border-[#E5E7EB] bg-white shadow-xs overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-[#F3F4F6]">
          <h2 className="text-lg font-bold text-[#111827]">
            User &amp; Mentor Management
          </h2>
          <Button className="bg-[#2563EB] hover:bg-[#1D4ED8] text-white text-sm font-semibold gap-1.5 rounded-lg px-4 h-9">
            <Plus className="size-4" />
            Add New User
          </Button>
        </div>

        {/* Search + Filters toolbar */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 px-5 py-3 border-b border-[#F3F4F6]">
          <div className="relative flex-1 max-w-xs w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-[#9CA3AF] pointer-events-none" />
            <Input
              placeholder="search user by user or email..."
              value={search}
              onChange={(e) => handleSearch(e.target.value)}
              className="pl-9 h-9 text-sm rounded-lg border-[#E5E7EB] placeholder:text-[#9CA3AF]"
            />
          </div>

          <div className="flex items-center gap-2 ml-auto">
            <Select value={statusFilter} onValueChange={handleStatusFilter}>
              <SelectTrigger className="h-9 min-w-[120] rounded-lg border-[#E5E7EB] text-sm text-[#374151]">
                <SelectValue placeholder="All status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All status</SelectItem>
                <SelectItem value="Active">Active</SelectItem>
                <SelectItem value="Inactive">Inactive</SelectItem>
                <SelectItem value="Pending">Pending</SelectItem>
              </SelectContent>
            </Select>

            <Select value={roleFilter} onValueChange={handleRoleFilter}>
              <SelectTrigger className="h-9 min-w-[120] rounded-lg border-[#E5E7EB] text-sm text-[#374151]">
                <SelectValue placeholder="All roles" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All roles</SelectItem>
                <SelectItem value="Admin">Admin</SelectItem>
                <SelectItem value="Mentor">Mentor</SelectItem>
                <SelectItem value="Student">Student</SelectItem>
                <SelectItem value="Staff">Staff</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Table */}
        <Table>
          <TableHeader>
            <TableRow className="bg-[#F9FAFB] hover:bg-[#F9FAFB]">
              <TableHead className="text-xs font-semibold text-[#6B7280] uppercase tracking-wide px-5 py-3 w-[40%]">
                User
              </TableHead>
              <TableHead className="text-xs font-semibold text-[#6B7280] uppercase tracking-wide px-4 py-3">
                Role
              </TableHead>
              <TableHead className="text-xs font-semibold text-[#6B7280] uppercase tracking-wide px-4 py-3">
                Status
              </TableHead>
              <TableHead className="text-xs font-semibold text-[#6B7280] uppercase tracking-wide px-4 py-3">
                Action
              </TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            {paginated.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={4}
                  className="text-center py-10 text-sm text-[#9CA3AF]"
                >
                  No users found.
                </TableCell>
              </TableRow>
            ) : (
              paginated.map((user) => (
                <TableRow
                  key={user.id}
                  className="border-b border-[#F3F4F6] hover:bg-[#F9FAFB] transition-colors"
                >
                  <TableCell className="px-5 py-3">
                    <UserAvatarCell user={user} />
                  </TableCell>
                  <TableCell className="px-4 py-3">
                    <Badge variant="userRole">{user.role}</Badge>
                  </TableCell>
                  <TableCell className="px-4 py-3">
                    <Badge variant={statusVariant(user.status)}>{user.status}</Badge>
                  </TableCell>
                  <TableCell className="px-4 py-3">
                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => handleEdit(user.id)}
                        title="Edit"
                        className="p-1.5 rounded-md text-[#2563EB] hover:bg-[#EFF6FF] transition-colors"
                      >
                        <Pencil className="size-4" />
                      </button>
                      <button
                        onClick={() => handleChange(user.id)}
                        title="Change role"
                        className="p-1.5 rounded-md text-[#22C55E] hover:bg-[#F0FDF4] transition-colors"
                      >
                        <ArrowLeftRight className="size-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(user.id)}
                        title="Delete"
                        className="p-1.5 rounded-md text-[#EF4444] hover:bg-[#FEF2F2] transition-colors"
                      >
                        <Trash2 className="size-4" />
                      </button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>

        {/* Pagination */}
        <div className="flex items-center justify-between px-5 py-3 border-t border-[#F3F4F6]">
          <span className="text-xs text-[#9CA3AF]">
            Row per page: {ROWS_PER_PAGE}
          </span>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={safePage === 1}
              className="flex items-center gap-1 text-xs text-[#374151] hover:text-[#2563EB] disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronLeft className="size-3.5" /> Prev
            </button>
            <span className="text-xs text-[#6B7280] tabular-nums">
              {safePage} / {totalPages}
            </span>
            <button
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={safePage === totalPages}
              className="flex items-center gap-1 text-xs text-[#374151] hover:text-[#2563EB] disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              Next <ChevronRight className="size-3.5" />
            </button>
          </div>
        </div>
      </div>

      <QuickInsight />
    </div>
  );
}
