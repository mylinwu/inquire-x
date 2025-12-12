"use client";

import { X, Settings, Trash2, MessageSquare, History } from "lucide-react";
import { useAppStore } from "@/store";
import { formatDistanceToNow } from "@/lib/utils";

interface MenuPanelProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenSettings: () => void;
}

export function MenuPanel({ isOpen, onClose, onOpenSettings }: MenuPanelProps) {
  const {
    conversations,
    currentConversationId,
    setCurrentConversation,
    deleteConversation,
  } = useAppStore();

  const handleSelectConversation = (id: string) => {
    setCurrentConversation(id);
    onClose();
  };

  const handleDelete = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    if (confirm("确定删除这个对话吗？")) {
      deleteConversation(id);
    }
  };

  return (
    <>
      {/* 遮罩层 */}
      <div
        className={`fixed inset-0 bg-black/20 dark:bg-black/40 backdrop-blur-sm z-40 transition-opacity duration-300 ${
          isOpen ? "opacity-100" : "opacity-0 pointer-events-none"
        }`}
        onClick={onClose}
      />

      {/* 侧边面板 */}
      <div
        className={`fixed left-0 top-0 bottom-0 w-80 bg-background/95 backdrop-blur-xl border-r border-black/5 dark:border-white/5 z-50 transform transition-transform duration-300 cubic-bezier(0.32, 0.72, 0, 1) ${
          isOpen ? "translate-x-0 shadow-2xl" : "-translate-x-full shadow-none"
        }`}
      >
        {/* 头部 */}
        <div className="flex items-center justify-between p-4 pt- safe-area-top border-b border-black/5 dark:border-white/5">
          <div className="flex items-center gap-2 text-foreground/80">
            <History size={18} />
            <h2 className="font-medium text-sm">历史记录</h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 hover:bg-black/5 dark:hover:bg-white/10 rounded-full transition-colors text-muted-foreground"
          >
            <X size={18} />
          </button>
        </div>

        {/* 会话列表 */}
        <div className="flex-1 overflow-y-auto p-3 space-y-1" style={{ height: "calc(100vh - 120px)" }}>
          {conversations.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-48 text-muted-foreground/40">
              <MessageSquare size={32} className="mb-3 opacity-20" />
              <p className="text-sm">暂无对话</p>
            </div>
          ) : (
            conversations.map((conv) => (
              <div
                key={conv.id}
                onClick={() => handleSelectConversation(conv.id)}
                className={`group relative p-3 rounded-xl cursor-pointer transition-all duration-200 border border-transparent ${
                  currentConversationId === conv.id
                    ? "bg-primary/10 text-primary border-primary/10"
                    : "hover:bg-black/5 dark:hover:bg-white/5 text-foreground/80 hover:text-foreground"
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <p className={`text-sm font-medium truncate leading-tight ${currentConversationId === conv.id ? "text-primary-700 dark:text-primary-400" : ""}`}>
                      {conv.title}
                    </p>
                    <p className="text-[11px] text-muted-foreground/60 mt-1.5 font-normal">
                      {formatDistanceToNow(conv.updatedAt)}
                    </p>
                  </div>
                  <button
                    onClick={(e) => handleDelete(e, conv.id)}
                    className="p-1.5 opacity-0 group-hover:opacity-100 hover:bg-red-50 hover:text-red-500 rounded-lg transition-all absolute right-2 top-2"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        {/* 底部设置按钮 */}
        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-black/5 dark:border-white/5 bg-background/50 backdrop-blur-md">
          <button
            onClick={onOpenSettings}
            className="w-full flex items-center justify-center gap-2 py-2.5 px-4 bg-black/5 dark:bg-white/5 hover:bg-black/10 dark:hover:bg-white/10 text-foreground/80 rounded-xl transition-colors text-sm font-medium"
          >
            <Settings size={16} />
            <span>设置</span>
          </button>
        </div>
      </div>
    </>
  );
}
