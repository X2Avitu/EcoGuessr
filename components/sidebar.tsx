"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { signOutAction } from "@/app/actions";
import { Sidebar, SidebarBody, SidebarLink } from "@/components/ui/sidebar";
import {
  IconArrowLeft,
  IconBrandTabler,
  IconChartPie,
  IconSettings,
  IconUserBolt,
} from "@tabler/icons-react";
import { motion } from "motion/react";
import { cn } from "@/lib/utils";

type Props = {
  userName: string;
  userEmail: string;
};

export default function AppSidebar({ userName, userEmail }: Props) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  const links = [
    {
      label: "Map",
      href: "/protected/map",
      icon: (
        <IconBrandTabler className="h-5 w-5 shrink-0 text-neutral-700 dark:text-neutral-200" />
      ),
      id: "map",
    },
    {
      label: "Squads",
      href: "/protected/squads",
      icon: (
        <IconChartPie className="h-5 w-5 shrink-0 text-neutral-700 dark:text-neutral-200" />
      ),
      id: "squads",
    },
    {
      label: "Profile",
      href: "/protected/profile",
      icon: (
        <IconUserBolt className="h-5 w-5 shrink-0 text-neutral-700 dark:text-neutral-200" />
      ),
      id: "profile",
    },
    {
      label: "Password",
      href: "/protected/reset-password",
      icon: (
        <IconSettings className="h-5 w-5 shrink-0 text-neutral-700 dark:text-neutral-200" />
      ),
      id: "settings",
    },
  ];

  return (
    <div
      className={cn(
        "flex h-full w-full max-w-[300px] shrink-0 flex-col overflow-hidden border-r border-neutral-700 bg-neutral-100 dark:bg-neutral-900 md:flex-row",
      )}
    >
      <Sidebar open={open} setOpen={setOpen}>
        <SidebarBody className="h-full justify-between gap-6 border-0 bg-neutral-100 dark:bg-neutral-900">
          <div className="flex flex-1 flex-col overflow-y-auto overflow-x-hidden">
            {open ? <Logo /> : <LogoIcon />}
            <div className="mt-8 flex flex-col gap-1">
              {links.map((link) => {
                const isActive =
                  pathname === link.href ||
                  (link.href !== "/protected/map" &&
                    pathname?.startsWith(link.href)) ||
                  (link.id === "map" &&
                    (pathname === "/protected" || pathname === "/protected/map"));
                return (
                  <SidebarLink
                    key={link.id}
                    link={{
                      label: link.label,
                      href: link.href,
                      icon: link.icon,
                    }}
                    className={
                      isActive
                        ? "rounded-md bg-neutral-200 dark:bg-neutral-800"
                        : undefined
                    }
                  />
                );
              })}
            </div>
          </div>

          <div className="mt-auto space-y-3 border-t border-neutral-700/50 pt-4">
            <form action={signOutAction}>
              <button
                type="submit"
                className="flex w-full items-center gap-2 rounded-md px-2 py-2 text-left text-sm font-medium text-neutral-800 hover:bg-neutral-200 dark:text-neutral-200 dark:hover:bg-neutral-800"
              >
                <IconArrowLeft className="h-5 w-5 shrink-0" />
                Log out
              </button>
            </form>
            <div className="flex items-center gap-3 rounded-md bg-neutral-200/80 px-2 py-3 dark:bg-neutral-800/80">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary/20 font-bebas text-lg text-primary">
                {userName.charAt(0).toUpperCase()}
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate font-dmsans text-sm font-bold text-neutral-900 dark:text-white">
                  {userName}
                </p>
                <p className="truncate font-dmsans text-xs text-neutral-500 dark:text-neutral-400">
                  {userEmail}
                </p>
              </div>
            </div>
          </div>
        </SidebarBody>
      </Sidebar>
    </div>
  );
}

export const Logo = () => (
  <Link
    href="/protected/map"
    className="relative z-20 flex items-center space-x-2 py-1 text-sm font-normal text-black dark:text-white"
  >
    <div className="h-5 w-6 shrink-0 rounded-tl-lg rounded-tr-sm rounded-br-lg rounded-bl-sm bg-black dark:bg-white" />
    <motion.span
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="font-bebas text-xl tracking-widest text-black dark:text-white"
    >
      PLATZ
    </motion.span>
  </Link>
);

export const LogoIcon = () => (
  <Link href="/protected/map" className="relative z-20 flex py-1">
    <div className="h-5 w-6 shrink-0 rounded-tl-lg rounded-tr-sm rounded-br-lg rounded-bl-sm bg-black dark:bg-white" />
  </Link>
);
