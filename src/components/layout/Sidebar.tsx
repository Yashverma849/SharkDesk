"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Activity,
  CheckSquare,
  ChevronLeft,
  ChevronRight,
  LayoutDashboard,
  LogIn,
  Settings,
  UserPlus,
  Users,
} from "lucide-react";
import { SHARKDESK_LOGO_URL } from "@/lib/branding";
import {
  Show,
  SignInButton,
  SignOutButton,
  SignUpButton,
  UserButton,
} from "@clerk/nextjs";
import { OrganizationSidebarSection } from "@/components/layout/OrganizationSidebarSection";
import {
  useSidebar,
  SIDEBAR_COLLAPSED_W,
  SIDEBAR_EXPANDED_W,
} from "@/components/layout/sidebar-context";
import { cn } from "@/lib/utils";
import { useEffect, useMemo, useRef, useState } from "react";

const NAV_ITEMS = [
  { name: "Projects", href: "/projects", icon: LayoutDashboard },
  { name: "My Work", href: "/my-work", icon: CheckSquare },
  { name: "Activity", href: "/activity", icon: Activity },
  { name: "Team", href: "/team", icon: Users },
];

export function Sidebar() {
  const pathname = usePathname();
  const { collapsed, toggle } = useSidebar();
  const [accountMenuOpen, setAccountMenuOpen] = useState(false);
  const accountMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handlePointerDown(e: PointerEvent) {
      if (
        accountMenuRef.current &&
        !accountMenuRef.current.contains(e.target as Node)
      ) {
        setAccountMenuOpen(false);
      }
    }
    if (accountMenuOpen) {
      document.addEventListener("pointerdown", handlePointerDown);
      return () =>
        document.removeEventListener("pointerdown", handlePointerDown);
    }
  }, [accountMenuOpen]);

  const userButtonAppearance = useMemo(
    () => ({
      variables: {
        colorText: "#E5E7EB",
      },
      elements: {
        avatarBox: cn(
          "ring-2 ring-[#1F2937] shadow-[0_0_12px_rgba(20,184,166,0.15)",
          collapsed ? "order-none w-9 h-9" : "order-1 w-8 h-8",
        ),
        userButtonPopoverCard:
          "bg-[#121826] border border-[#1F2937] shadow-xl rounded-xl",
        userButtonPopoverActionButton:
          "text-[#E5E7EB] hover:bg-[#1a2235] rounded-lg",
        userButtonPopoverFooter: "hidden",
        userPreviewMainIdentifier: "text-white font-medium text-sm",
        userPreviewSecondaryIdentifier: "text-[#9CA3AF] text-xs",
        userButtonTrigger: cn(
          "focus:shadow-none hover:bg-transparent",
          collapsed
            ? "!justify-center w-full"
            : "!justify-start w-full",
        ),
        userButtonBox: cn(
          "flex items-center gap-3",
          collapsed && "!justify-center gap-0",
        ),
        userButtonOuterIdentifier: cn(
          "font-medium text-sm truncate",
          collapsed ? "!hidden" : "!text-white order-2",
        ),
      },
    }),
    [collapsed],
  );

  const asideWidth = collapsed ? SIDEBAR_COLLAPSED_W : SIDEBAR_EXPANDED_W;

  return (
    <aside
      className="fixed left-0 top-0 z-50 flex h-screen min-h-0 flex-col overflow-visible border-r border-[#1F2937] bg-[#0B0F1A] transition-[width] duration-200 ease-out"
      style={{ width: asideWidth }}
    >
      <Link
        href="/projects"
        className={cn(
          "shrink-0 mb-4 hover:opacity-95 transition-opacity",
          collapsed
            ? "flex flex-col items-center gap-2 px-2 py-3"
            : "flex items-center gap-3 px-6 py-3",
        )}
      >
        <div
          className={cn(
            "relative shrink-0",
            collapsed ? "h-11 w-11" : "h-16 w-16",
          )}
        >
          <Image
            src={SHARKDESK_LOGO_URL}
            alt="SharkDesk"
            fill
            sizes={collapsed ? "44px" : "64px"}
            className="object-contain object-center"
            priority
          />
        </div>
        {!collapsed ? (
          <span className="font-semibold text-lg text-white tracking-tight">
            Shark<span className="text-[#9CA3AF]">Desk</span>
          </span>
        ) : null}
      </Link>

      <nav
        className={cn(
          "min-h-0 flex-1 space-y-1 overflow-y-auto overflow-x-hidden px-3 pb-2 custom-scrollbar",
          collapsed && "px-2",
        )}
      >
        {NAV_ITEMS.map((item) => {
          const isActive =
            item.href === "/projects"
              ? pathname === "/" ||
                pathname === "/projects" ||
                (pathname?.startsWith("/projects/") ?? false)
              : pathname === item.href ||
                (pathname?.startsWith(`${item.href}/`) ?? false);
          const Icon = item.icon;

          return (
            <Link
              key={item.name}
              href={item.href}
              title={item.name}
              className={cn(
                "flex items-center rounded-lg transition-fast relative group outline-none",
                collapsed ? "justify-center px-2 py-2.5" : "gap-3 px-3 py-2",
                isActive
                  ? "bg-[#121826] text-white"
                  : "text-[#9CA3AF] hover:text-[#E5E7EB] hover:bg-[#121826]/50",
              )}
            >
              {isActive ? (
                <div
                  className={cn(
                    "absolute left-0 top-1/2 h-5 -translate-y-1/2 rounded-r-md bg-[#14B8A6] shadow-[0_0_8px_rgba(20,184,166,0.5)]",
                    collapsed ? "w-0.5" : "w-1",
                  )}
                />
              ) : null}
              <Icon
                className={cn(
                  "h-5 w-5 shrink-0",
                  isActive ? "text-[#14B8A6]" : "group-hover:text-[#E5E7EB]",
                )}
              />
              {!collapsed ? (
                <span className="font-medium text-sm">{item.name}</span>
              ) : null}
            </Link>
          );
        })}
      </nav>

      <OrganizationSidebarSection />

      <footer
        className={cn(
          "mt-auto shrink-0",
          collapsed ? "space-y-2 p-2" : "space-y-2 p-4",
        )}
      >
        <Show when="signed-out">
          <div className={cn("flex flex-col gap-2", collapsed && "items-center")}>
            <SignInButton mode="modal">
              <button
                type="button"
                className={cn(
                  "rounded-lg bg-[#14B8A6] font-semibold text-sm text-[#0B0F1A] transition-colors shadow-[0_0_16px_rgba(20,184,166,0.2)] hover:bg-[#0D9488]",
                  collapsed
                    ? "flex h-10 w-10 items-center justify-center p-0"
                    : "w-full py-2.5 px-3",
                )}
                title="Sign in"
              >
                {collapsed ? (
                  <LogIn className="h-5 w-5" strokeWidth={2} />
                ) : (
                  "Sign in"
                )}
              </button>
            </SignInButton>
            <SignUpButton mode="modal">
              <button
                type="button"
                className={cn(
                  "rounded-lg border border-[#1F2937] bg-[#121826]/80 font-medium text-[#E5E7EB] transition-colors hover:bg-[#121826]",
                  collapsed
                    ? "flex h-10 w-10 items-center justify-center p-0"
                    : "w-full py-2.5 px-3 text-sm",
                )}
                title="Create account"
              >
                {collapsed ? (
                  <UserPlus className="h-5 w-5" strokeWidth={2} />
                ) : (
                  "Create account"
                )}
              </button>
            </SignUpButton>
          </div>
        </Show>
        <Show when="signed-in">
          <div
            ref={accountMenuRef}
            className={cn(
              "relative flex rounded-xl border border-transparent px-2 py-1.5 transition-colors hover:border-[#1F2937] hover:bg-[#121826]/40",
              collapsed
                ? "flex-col items-center gap-1"
                : "w-full items-center pr-10",
            )}
          >
            <UserButton
              showName={!collapsed}
              appearance={userButtonAppearance}
            />
            <button
              type="button"
              onClick={() => setAccountMenuOpen((v) => !v)}
              aria-expanded={accountMenuOpen}
              aria-haspopup="menu"
              aria-label="Account menu"
              className={cn(
                "rounded-lg p-1.5 text-[#6B7280] outline-none transition-colors hover:bg-[#1a2235] hover:text-[#E5E7EB] focus-visible:ring-2 focus-visible:ring-[#14B8A6]/40",
                collapsed ? "shrink-0" : "absolute right-2 top-1/2 -translate-y-1/2",
              )}
            >
              <Settings className="h-4 w-4" strokeWidth={2} />
            </button>
            {accountMenuOpen ? (
              <div
                role="menu"
                className={cn(
                  "absolute z-[70] min-w-[200px] overflow-hidden rounded-xl border border-[#1F2937] bg-[#121826] py-1 shadow-[0_16px_48px_rgba(0,0,0,0.45)] ring-1 ring-black/20",
                  collapsed
                    ? "bottom-full left-1/2 mb-2 -translate-x-1/2"
                    : "bottom-full right-0 mb-2",
                )}
              >
                <SignOutButton redirectUrl="/">
                  <button
                    type="button"
                    role="menuitem"
                    className="flex w-full px-4 py-2.5 text-left text-sm font-medium text-[#E5E7EB] transition-colors hover:bg-[#1a2235]"
                  >
                    Sign out
                  </button>
                </SignOutButton>
              </div>
            ) : null}
          </div>
        </Show>
        {collapsed ? (
          <p
            title="Powered by Finzarc with love"
            className="mt-3 select-none text-center text-[9px] leading-tight text-[#6B7280]"
          >
            Finzarc <span aria-hidden="true">❤️</span>
          </p>
        ) : (
          <p className="mt-3 text-center text-[11px] leading-snug text-[#6B7280]">
            Powered by Finzarc with{" "}
            <span aria-hidden="true">❤️</span>
          </p>
        )}
      </footer>

      <button
        type="button"
        onClick={toggle}
        className="absolute right-0 top-1/2 z-[60] flex h-8 w-8 -translate-y-1/2 translate-x-1/2 items-center justify-center rounded-full border border-[#1F2937] bg-[#0B0F1A] text-[#9CA3AF] shadow-[0_4px_14px_rgba(0,0,0,0.35)] transition-colors hover:border-[#374151] hover:bg-[#121826] hover:text-white"
        aria-expanded={!collapsed}
        aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
      >
        {collapsed ? (
          <ChevronRight className="h-4 w-4" strokeWidth={2} />
        ) : (
          <ChevronLeft className="h-4 w-4" strokeWidth={2} />
        )}
      </button>
    </aside>
  );
}
