"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Bell, CheckCheck, Trash2, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { formatDistanceToNow } from "date-fns";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface Notification {
  id: string;
  type: string;
  title: string;
  message: string;
  link: string | null;
  isRead: boolean;
  createdAt: string;
}

export function NotificationDropdown() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const fetchNotifications = async () => {
    try {
      const response = await fetch("/api/notifications");
      if (response.ok) {
        const data = await response.json();
        setNotifications(data.notifications);
        setUnreadCount(data.unreadCount);
      }
    } catch (error) {
      console.error("Failed to fetch notifications:", error);
    }
  };

  useEffect(() => {
    fetchNotifications();
    // Poll for new notifications every 30 seconds
    const interval = setInterval(fetchNotifications, 30000);
    return () => clearInterval(interval);
  }, []);

  const markAsRead = async (id: string) => {
    try {
      const response = await fetch("/api/notifications", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, action: "mark-read" }),
      });
      
      if (response.ok) {
        setNotifications(notifications.map(n => 
          n.id === id ? { ...n, isRead: true } : n
        ));
        setUnreadCount(Math.max(0, unreadCount - 1));
      }
    } catch (error) {
      console.error("Failed to mark notification as read:", error);
    }
  };

  const markAllAsRead = async () => {
    setIsLoading(true);
    try {
      const response = await fetch("/api/notifications", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "mark-all-read" }),
      });
      
      if (response.ok) {
        setNotifications(notifications.map(n => ({ ...n, isRead: true })));
        setUnreadCount(0);
        toast.success("All notifications marked as read");
      }
    } catch (error) {
      toast.error("Failed to mark all as read");
    } finally {
      setIsLoading(false);
    }
  };

  const deleteNotification = async (id: string) => {
    try {
      const response = await fetch(`/api/notifications?id=${id}`, {
        method: "DELETE",
      });
      
      if (response.ok) {
        const notification = notifications.find(n => n.id === id);
        setNotifications(notifications.filter(n => n.id !== id));
        if (notification && !notification.isRead) {
          setUnreadCount(Math.max(0, unreadCount - 1));
        }
        toast.success("Notification deleted");
      }
    } catch (error) {
      toast.error("Failed to delete notification");
    }
  };

  const getNotificationIcon = (type: string) => {
    const iconMap: Record<string, string> = {
      info: "ℹ️",
      success: "✅",
      warning: "⚠️",
      error: "❌",
      project: "📁",
      task: "✓",
      order: "📦",
      payment: "💰",
      user: "👤",
    };
    return iconMap[type] || "🔔";
  };

  const handleNotificationClick = (notification: Notification) => {
    if (!notification.isRead) {
      markAsRead(notification.id);
    }
    if (notification.link) {
      setIsOpen(false);
    }
  };

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <Badge 
              variant="destructive" 
              className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs"
            >
              {unreadCount > 9 ? "9+" : unreadCount}
            </Badge>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-96 p-0" align="end">
        <div className="flex items-center justify-between border-b px-4 py-3">
          <h3 className="font-semibold text-lg">Notifications</h3>
          {unreadCount > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={markAllAsRead}
              disabled={isLoading}
              className="h-8 text-xs"
            >
              <CheckCheck className="h-4 w-4 mr-1" />
              Mark all read
            </Button>
          )}
        </div>
        
        <ScrollArea className="h-[400px]">
          {notifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <Bell className="h-12 w-12 text-muted-foreground mb-2 opacity-50" />
              <p className="text-muted-foreground">No notifications yet</p>
            </div>
          ) : (
            <div className="divide-y">
              {notifications.map((notification) => (
                <div
                  key={notification.id}
                  className={cn(
                    "p-4 hover:bg-muted/50 transition-colors relative group",
                    !notification.isRead && "bg-blue-50 dark:bg-blue-950/20"
                  )}
                >
                  {notification.link ? (
                    <Link
                      href={notification.link}
                      className="block"
                      onClick={() => handleNotificationClick(notification)}
                    >
                      <NotificationContent notification={notification} />
                    </Link>
                  ) : (
                    <div onClick={() => !notification.isRead && markAsRead(notification.id)}>
                      <NotificationContent notification={notification} />
                    </div>
                  )}
                  
                  <Button
                    variant="ghost"
                    size="icon"
                    className="absolute top-2 right-2 h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      deleteNotification(notification.id);
                    }}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                  
                  {!notification.isRead && (
                    <div className="absolute left-2 top-6 h-2 w-2 rounded-full bg-blue-500" />
                  )}
                </div>
              ))}
            </div>
          )}
        </ScrollArea>
      </PopoverContent>
    </Popover>
  );
}

function NotificationContent({ notification }: { notification: Notification }) {
  return (
    <div className="space-y-1">
      <div className="flex items-start gap-2">
        <span className="text-lg mt-0.5">
          {notification.type === "info" && "ℹ️"}
          {notification.type === "success" && "✅"}
          {notification.type === "warning" && "⚠️"}
          {notification.type === "error" && "❌"}
          {notification.type === "project" && "📁"}
          {notification.type === "task" && "✓"}
          {notification.type === "order" && "📦"}
          {notification.type === "payment" && "💰"}
          {notification.type === "user" && "👤"}
          {!["info", "success", "warning", "error", "project", "task", "order", "payment", "user"].includes(notification.type) && "🔔"}
        </span>
        <div className="flex-1 min-w-0">
          <p className="font-medium text-sm leading-tight">
            {notification.title}
          </p>
          <p className="text-xs text-muted-foreground line-clamp-2 mt-0.5">
            {notification.message}
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            {formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true })}
          </p>
        </div>
      </div>
    </div>
  );
}
