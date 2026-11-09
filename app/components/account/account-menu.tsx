"use client";

import { UserAvatar, UserButton, UserView } from "@better-auth-ui/heroui";
import { useSession } from "@better-auth-ui/react";
import { ArrowRightFromSquare, Gear } from "@gravity-ui/icons";
import { Dropdown, Label } from "@heroui/react";
import { useEffect, useRef, useState } from "react";
import { authClient } from "@/lib/auth/client";

export function AccountMenu() {
  const { data: session } = useSession(authClient);
  const [isOpen, setIsOpen] = useState(false);
  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  function cancelClose() {
    if (closeTimer.current !== null) clearTimeout(closeTimer.current);
    closeTimer.current = null;
  }

  function scheduleClose() {
    cancelClose();
    // Keep the menu open while crossing the gap to its portalled popover.
    closeTimer.current = setTimeout(() => setIsOpen(false), 200);
  }

  useEffect(() => () => {
    if (closeTimer.current !== null) clearTimeout(closeTimer.current);
  }, []);

  if (!session) return <UserButton size="icon" placement="bottom end" />;

  return (
    <Dropdown isOpen={isOpen} onOpenChange={setIsOpen}>
      <Dropdown.Trigger
        aria-label="账户菜单"
        className="rounded-full"
        onPointerEnter={(event) => {
          if (event.pointerType !== "mouse") return;
          cancelClose();
          setIsOpen(true);
        }}
        onPointerLeave={(event) => {
          if (event.pointerType === "mouse") scheduleClose();
        }}
      >
        <UserAvatar user={session.user} />
      </Dropdown.Trigger>
      <Dropdown.Popover
        // A modal underlay covers the hovered trigger and repeatedly fires
        // pointerleave / pointerenter as the menu closes and reopens.
        isNonModal
        className="min-w-56 max-w-[calc(100vw-2rem)]"
        placement="bottom end"
        onPointerEnter={cancelClose}
        onPointerLeave={(event) => {
          if (event.pointerType === "mouse") scheduleClose();
        }}
      >
        <div className="px-3 pt-3 pb-1"><UserView /></div>
        <Dropdown.Menu aria-label="账户操作">
          <Dropdown.Item href="/settings/account" textValue="Settings">
            <Gear className="text-muted" />
            <Label>Settings</Label>
          </Dropdown.Item>
          <Dropdown.Item href="/auth/sign-out" textValue="退出登录" variant="danger">
            <ArrowRightFromSquare className="text-danger" />
            <Label>退出登录</Label>
          </Dropdown.Item>
        </Dropdown.Menu>
      </Dropdown.Popover>
    </Dropdown>
  );
}
