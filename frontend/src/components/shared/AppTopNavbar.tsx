import {
  useEffect,
  useMemo,
  useRef,
  useState,
  type KeyboardEvent,
} from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  ArrowRight,
  ChevronRight,
  FileSearch,
  Menu,
  Search,
  User,
} from "lucide-react";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "../ui/dialog";
import { DialogScrollArea } from "../ui/dialog-scroll-area";
import { AppShellNavbarSearch } from "./AppShellNavbarSearch";
import { NavbarAccountHoverMenu } from "./NavbarAccountHoverMenu";
import { Navigation, flattenNavItems } from "../../lib/navigation";
import { ROUTES } from "../../lib/routes";
import { cn } from "../../lib/utils";
import type { UserRole } from "../../lib/types/user";
import type { SidebarUser } from "./Sidebar";
import type { AppTopNavbarAuthProps } from "@/lib/layout/navbar-auth-view-model";
import {
  useNavbarSearch,
  type NavbarSearchItem,
} from "../../providers/navbar-search-provider";
import { SidebarTrigger } from "../ui/sidebar";
import {
  appShellBackLinkClassName,
  appShellBreadcrumbCurrentClassName,
  appShellBreadcrumbLinkClassName,
  appShellBreadcrumbMutedClassName,
  appShellNavTriggerClassName,
  appShellTopBarClassName,
} from "@/lib/design/app-shell-tokens";
import { buildDashboardBreadcrumbs } from "@/lib/layout/dashboard-breadcrumbs";
import { navigateBackOrDashboard } from "@/lib/layout/navbar-back";
type AppTopNavbarProps = {
  role: UserRole;
  user: SidebarUser;
  showSidebarTrigger?: boolean;
  navbarBack?: "dashboard" | "history";
  onSignOut: AppTopNavbarAuthProps["onSignOut"];
};

function matchesSearch(item: NavbarSearchItem, query: string) {
  const q = query.trim().toLowerCase();
  if (!q) return true;
  return [item.label, item.description, ...(item.keywords ?? [])]
    .filter(Boolean)
    .some((value) => value!.toLowerCase().includes(q));
}

export function AppTopNavbar({
  role,
  user,
  showSidebarTrigger = true,
  navbarBack,
  onSignOut,
}: AppTopNavbarProps) {
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const { localSearch, courseBreadcrumb } = useNavbarSearch();
  const [query, setQuery] = useState("");
  const [isCommandOpen, setIsCommandOpen] = useState(false);
  const searchInputRef = useRef<HTMLInputElement>(null);

  const navigationItems = useMemo<NavbarSearchItem[]>(() => {
    const key =
      role === "admin"
        ? "Admin"
        : role === "super_admin"
          ? "SuperAdmin"
          : role === "mentor"
            ? "Mentor"
            : "Student";
    return [
      {
        id: "settings",
        label: "Pengaturan",
        description: "Buka pengaturan akun",
        path: ROUTES.profile,
        icon: User,
        keywords: ["account", "akun", "settings", "pengaturan", "profile"],
      },
      ...flattenNavItems(Navigation[key]).map((item) => ({
        id: item.path,
        label: item.name,
        description: "Navigasi",
        path: item.path,
        icon: item.icon,
      })),
    ];
  }, [role]);

  const localItems = useMemo(
    () => localSearch?.items ?? [],
    [localSearch?.items],
  );
  const filteredNavigation = useMemo(
    () =>
      navigationItems.filter((item) => matchesSearch(item, query)).slice(0, 8),
    [navigationItems, query],
  );
  const filteredLocal = useMemo(
    () => localItems.filter((item) => matchesSearch(item, query)).slice(0, 8),
    [localItems, query],
  );
  const placeholder =
    localSearch?.placeholder ?? "Cari halaman atau data...";
  const profileImageReference = user.avatar_url ?? user.avatar;

  const navKey =
    role === "admin"
      ? "Admin"
      : role === "super_admin"
        ? "SuperAdmin"
        : role === "mentor"
          ? "Mentor"
          : "Student";
  const navItems = Navigation[navKey];

  const breadcrumbContext = useMemo(
    () =>
      courseBreadcrumb
        ? { courseDetailLabel: courseBreadcrumb.label }
        : undefined,
    [courseBreadcrumb],
  );

  const breadcrumbs = useMemo(
    () => buildDashboardBreadcrumbs(pathname, navItems, breadcrumbContext),
    [pathname, navItems, breadcrumbContext],
  );

  const visibleBreadcrumbs =
    breadcrumbs.length > 3 ? breadcrumbs.slice(-3) : breadcrumbs;
  const hasHiddenBreadcrumbs = breadcrumbs.length > visibleBreadcrumbs.length;

  const runLocalSearch = (nextQuery = query) => {
    if (!localSearch?.onSearch) return false;
    localSearch.onSearch(nextQuery);
    return true;
  };

  const selectItem = (item: NavbarSearchItem) => {
    item.onSelect?.();
    if (item.path) navigate(item.path);
    setIsCommandOpen(false);
    setQuery("");
  };

  const handleSubmitSearch = () => {
    const q = query.trim();
    if (runLocalSearch(q)) {
      setIsCommandOpen(false);
      return;
    }

    const firstItem = [...filteredLocal, ...filteredNavigation][0];
    if (firstItem) selectItem(firstItem);
  };

  const handleInlineKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Enter") {
      event.preventDefault();
      handleSubmitSearch();
    }
  };

  const handleCommandKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Enter") {
      event.preventDefault();
      handleSubmitSearch();
    }
  };

  const handleLogout = () => {
    onSignOut();
    navigate(ROUTES.login);
  };

  useEffect(() => {
    const handleShortcut = (event: globalThis.KeyboardEvent) => {
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        setIsCommandOpen(true);
      }
    };

    window.addEventListener("keydown", handleShortcut);
    return () => window.removeEventListener("keydown", handleShortcut);
  }, []);

  useEffect(() => {
    if (!isCommandOpen) return;
    window.setTimeout(() => searchInputRef.current?.focus(), 0);
  }, [isCommandOpen]);

  return (
    <>
      <header
        className={cn(
          "sticky top-0 z-30 flex h-16 min-w-0 shrink-0 items-center gap-2 px-4 sm:gap-3 sm:px-5 md:px-6 lg:gap-4 lg:px-8",
          appShellTopBarClassName,
        )}
      >
        <div className="flex min-w-0 items-center gap-2 md:gap-3">
          {showSidebarTrigger ? (
            <SidebarTrigger
              className={cn(appShellNavTriggerClassName, "lg:hidden")}
            >
              <Menu className="size-5" />
            </SidebarTrigger>
          ) : null}

          {navbarBack === "dashboard" ? (
            <Link to={ROUTES.dashboard} className={appShellBackLinkClassName}>
              <ArrowLeft className="size-4 shrink-0" aria-hidden />
              Dasbor
            </Link>
          ) : null}
          {navbarBack === "history" ? (
            <button
              type="button"
              onClick={() => navigateBackOrDashboard(navigate)}
              className={appShellBackLinkClassName}
            >
              <ArrowLeft className="size-4 shrink-0" aria-hidden />
              Kembali
            </button>
          ) : null}

          {!navbarBack ? (
          <nav
            aria-label="Breadcrumb"
            className="hidden min-w-0 items-center gap-1 overflow-hidden text-sm md:flex md:max-w-[14rem] lg:max-w-[22rem]"
          >
            {hasHiddenBreadcrumbs ? (
              <>
                <span className="rounded-md px-1.5 py-1 text-muted-foreground">
                  ...
                </span>
                <ChevronRight className="size-3.5 shrink-0 text-muted-foreground/50" />
              </>
            ) : null}
            {visibleBreadcrumbs.map((crumb, index) => {
              const isLast = index === visibleBreadcrumbs.length - 1;
              const crumbHref = 'path' in crumb ? crumb.path : undefined;
              return (
                <span
                  key={`${crumb.label}-${index}`}
                  className="flex min-w-0 items-center gap-1"
                >
                  {crumbHref && !isLast ? (
                    <Link
                      to={crumbHref}
                      className={appShellBreadcrumbLinkClassName}
                    >
                      {crumb.label}
                    </Link>
                  ) : (
                    <span
                      className={cn(
                        "truncate rounded-md px-1.5 py-1",
                        isLast
                          ? appShellBreadcrumbCurrentClassName
                          : appShellBreadcrumbMutedClassName,
                      )}
                    >
                      {crumb.label}
                    </span>
                  )}
                  {!isLast ? (
                    <ChevronRight className="size-3.5 shrink-0 text-muted-foreground/50" />
                  ) : null}
                </span>
              );
            })}
          </nav>
          ) : null}
        </div>

        <AppShellNavbarSearch
          placeholder={placeholder}
          value={query}
          onValueChange={setQuery}
          onKeyDown={handleInlineKeyDown}
          onActivate={() => setIsCommandOpen(true)}
        />

        <div className="flex shrink-0 items-center justify-end pl-1 sm:pl-2">
          <NavbarAccountHoverMenu
            userName={user.name}
            userRole={role}
            userAvatar={profileImageReference}
            dashboardHref={ROUTES.dashboard}
            onLogout={handleLogout}
            variant="shell"
          />
        </div>
      </header>

      <Dialog open={isCommandOpen} onOpenChange={setIsCommandOpen}>
        <DialogContent
          className="top-[18vh] flex max-h-[min(80dvh,28rem)] max-w-2xl translate-y-0 flex-col gap-0 overflow-hidden rounded-2xl border border-input bg-card p-0 shadow-2xl"
          showCloseButton={false}
        >
          <DialogHeader className="sr-only">
            <DialogTitle>Pencarian cepat</DialogTitle>
            <DialogDescription>
              Cari navigasi dan data pada halaman aktif.
            </DialogDescription>
          </DialogHeader>

          <div className="flex shrink-0 items-center gap-3 border-b border-input px-4 py-3">
            <Search className="size-5 text-muted-foreground" aria-hidden />
            <input
              ref={searchInputRef}
              type="search"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              onKeyDown={handleCommandKeyDown}
              placeholder={placeholder}
              className="h-10 flex-1 bg-transparent text-sm text-foreground outline-none placeholder:text-muted-foreground"
            />
            <kbd className="hidden rounded-md border border-input bg-muted px-2 py-1 text-[11px] font-medium text-muted-foreground sm:inline">
              Enter
            </kbd>
          </div>

          <DialogScrollArea className="min-h-0 flex-1 p-2">
            {localSearch?.onSearch && (
              <button
                type="button"
                onClick={() => handleSubmitSearch()}
                className="mb-2 flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left transition outline-none hover:bg-muted focus-visible:bg-muted"
              >
                <span className="text-primary flex size-9 items-center justify-center rounded-lg bg-accent/60">
                  <FileSearch className="size-4" />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block text-sm font-semibold text-foreground">
                    Cari di halaman ini
                  </span>
                  <span className="block truncate text-xs text-muted-foreground">
                    {query.trim()
                      ? `"${query.trim()}"`
                      : "Gunakan data dan filter pada halaman aktif"}
                  </span>
                </span>
                <ArrowRight className="size-4 text-muted-foreground" />
              </button>
            )}

            {filteredLocal.length > 0 && (
              <div className="mb-2">
                <p className="px-3 pb-1 text-[11px] font-semibold tracking-wider text-muted-foreground uppercase">
                  Data halaman
                </p>
                {filteredLocal.map((item) => (
                  <SearchResultRow
                    key={item.id}
                    item={item}
                    onSelect={() => selectItem(item)}
                  />
                ))}
              </div>
            )}

            <div>
              <p className="px-3 pb-1 text-[11px] font-semibold tracking-wider text-muted-foreground uppercase">
                Navigasi
              </p>
              {filteredNavigation.length > 0 ? (
                filteredNavigation.map((item) => (
                  <SearchResultRow
                    key={item.id}
                    item={item}
                    onSelect={() => selectItem(item)}
                  />
                ))
              ) : (
                <div className="px-3 py-8 text-center text-sm text-muted-foreground">
                  Tidak ada hasil navigasi.
                </div>
              )}
            </div>
          </DialogScrollArea>
        </DialogContent>
      </Dialog>
    </>
  );
}

function SearchResultRow({
  item,
  onSelect,
}: {
  item: NavbarSearchItem;
  onSelect: () => void;
}) {
  const Icon = item.icon ?? ArrowRight;

  return (
    <button
      type="button"
      onClick={onSelect}
      className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left transition outline-none hover:bg-muted focus:bg-muted focus-visible:ring-3 focus-visible:ring-ring/30"
    >
      <span
        className={cn(
          "flex size-9 shrink-0 items-center justify-center rounded-lg bg-muted text-muted-foreground",
          item.path && "text-primary bg-accent/60",
        )}
      >
        <Icon className="size-4" />
      </span>
      <span className="min-w-0 flex-1">
        <span className="block truncate text-sm font-semibold text-foreground">
          {item.label}
        </span>
        {item.description ? (
          <span className="block truncate text-xs text-muted-foreground">
            {item.description}
          </span>
        ) : null}
      </span>
      <ArrowRight className="size-4 text-muted-foreground/50" />
    </button>
  );
}
