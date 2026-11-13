"use client";

import { toast } from "@heroui/react";
import { usePathname } from "next/navigation";
import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from "react";

type Notification = { pathname: string; message: string };
const NavigationToastContext = createContext<((notification: Notification) => void) | null>(null);

export function NavigationToastProvider({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const [notification, setNotification] = useState<Notification | null>(null);
  const notify = useCallback((next: Notification) => setNotification(next), []);

  useEffect(() => {
    if (!notification || pathname !== notification.pathname) return;
    toast.success(notification.message, { timeout: 4000 });
    setNotification(null);
  }, [pathname, notification]);

  return <NavigationToastContext.Provider value={notify}>{children}</NavigationToastContext.Provider>;
}

export function useNavigationToast() {
  const notify = useContext(NavigationToastContext);
  if (!notify) throw new Error("useNavigationToast requires NavigationToastProvider");
  return notify;
}
