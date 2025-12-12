"use client";

import { Menu, SquarePen } from "lucide-react";

interface NavbarProps {
  onMenuClick: () => void;
  onNewChat: () => void;
}

export function Navbar({ onMenuClick, onNewChat }: NavbarProps) {
  return (
    <header className="sticky top-0 z-30 w-full bg-background/80 backdrop-blur-md border-b border-black/5 dark:border-white/5 safe-area-top">
      <div className="max-w-4xl mx-auto px-4 h-14 flex items-center justify-between">
        <button
          onClick={onMenuClick}
          className="p-2 -ml-2 hover:bg-black/5 dark:hover:bg-white/10 rounded-lg transition-colors active:scale-95"
          aria-label="打开菜单"
        >
          <Menu size={20} className="text-foreground/80" />
        </button>

        <h1 className="font-medium text-base text-foreground/90">Inquire X</h1>

        <button
          onClick={onNewChat}
          className="p-2 -mr-2 hover:bg-black/5 dark:hover:bg-white/10 rounded-lg transition-colors active:scale-95"
          aria-label="新对话"
        >
          <SquarePen size={20} className="text-foreground/80" />
        </button>
      </div>
    </header>
  );
}
