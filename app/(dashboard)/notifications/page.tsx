"use client";

import { useState } from "react";
import { PageHeader } from "@/components/layout/page-header";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Bell, 
  CheckCheck, 
  Trash2, 
  AlertCircle, 
  Info, 
  CheckCircle2, 
  Calendar,
  Users,
  DollarSign,
  FileText
} from "lucide-react";

type Notification = {
  id: string;
  type: "info" | "warning" | "success" | "error";
  title: string;
  description: string;
  time: string;
  read: boolean;
  icon: any;
};

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<Notification[]>([
    {
      id: "1",
      type: "info",
      title: "New project assigned",
      description: "You have been assigned to Project Alpha as a team member",
      time: "2 hours ago",
      read: false,
      icon: FileText,
    },
    {
      id: "2",
      type: "success",
      title: "Task completed",
      description: "Your task 'Update documentation' has been marked as complete",
      time: "5 hours ago",
      read: false,
      icon: CheckCircle2,
    },
    {
      id: "3",
      type: "warning",
      title: "Deadline approaching",
      description: "Project Beta deadline is in 3 days",
      time: "1 day ago",
      read: false,
      icon: Calendar,
    },
    {
      id: "4",
      type: "info",
      title: "New team member",
      description: "John Doe has joined your department",
      time: "2 days ago",
      read: true,
      icon: Users,
    },
    {
      id: "5",
      type: "success",
      title: "Invoice approved",
      description: "Invoice #1234 has been approved and processed",
      time: "3 days ago",
      read: true,
      icon: DollarSign,
    },
  ]);

  const unreadCount = notifications.filter(n => !n.read).length;

  const handleMarkAsRead = (id: string) => {
    setNotifications(notifications.map(n => 
      n.id === id ? { ...n, read: true } : n
    ));
  };

  const handleMarkAllAsRead = () => {
    setNotifications(notifications.map(n => ({ ...n, read: true })));
  };

  const handleDelete = (id: string) => {
    setNotifications(notifications.filter(n => n.id !== id));
  };

  const handleDeleteAll = () => {
    if (confirm("Are you sure you want to delete all notifications?")) {
      setNotifications([]);
    }
  };

  const getIconByType = (type: string) => {
    switch (type) {
      case "info":
        return Info;
      case "warning":
        return AlertCircle;
      case "success":
        return CheckCircle2;
      case "error":
        return AlertCircle;
      default:
        return Bell;
    }
  };

  const getColorByType = (type: string) => {
    switch (type) {
      case "info":
        return "text-blue-500 bg-blue-50 dark:bg-blue-950";
      case "warning":
        return "text-yellow-500 bg-yellow-50 dark:bg-yellow-950";
      case "success":
        return "text-green-500 bg-green-50 dark:bg-green-950";
      case "error":
        return "text-red-500 bg-red-50 dark:bg-red-950";
      default:
        return "text-gray-500 bg-gray-50 dark:bg-gray-950";
    }
  };

  const unreadNotifications = notifications.filter(n => !n.read);
  const readNotifications = notifications.filter(n => n.read);

  const NotificationList = ({ items }: { items: Notification[] }) => (
    <div className="space-y-3">
      {items.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Bell className="h-12 w-12 text-muted-foreground mb-4" />
            <p className="text-muted-foreground">No notifications</p>
          </CardContent>
        </Card>
      ) : (
        items.map((notification) => {
          const Icon = notification.icon || getIconByType(notification.type);
          return (
            <Card 
              key={notification.id} 
              className={`${!notification.read ? "border-l-4 border-l-primary" : ""}`}
            >
              <CardContent className="p-4">
                <div className="flex items-start gap-4">
                  <div className={`p-2 rounded-lg ${getColorByType(notification.type)}`}>
                    <Icon className="h-5 w-5" />
                  </div>
                  <div className="flex-1 space-y-1">
                    <div className="flex items-center justify-between">
                      <h4 className="font-medium">
                        {notification.title}
                        {!notification.read && (
                          <Badge variant="secondary" className="ml-2 text-xs">
                            New
                          </Badge>
                        )}
                      </h4>
                      <span className="text-xs text-muted-foreground">
                        {notification.time}
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {notification.description}
                    </p>
                    <div className="flex gap-2 pt-2">
                      {!notification.read && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleMarkAsRead(notification.id)}
                        >
                          <CheckCheck className="h-4 w-4 mr-1" />
                          Mark as read
                        </Button>
                      )}
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDelete(notification.id)}
                      >
                        <Trash2 className="h-4 w-4 mr-1" />
                        Delete
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })
      )}
    </div>
  );

  return (
    <div className="space-y-6">
      <PageHeader
        heading="Notifications"
        description="Stay updated with your latest activities and alerts"
      >
        <div className="flex gap-2">
          {unreadCount > 0 && (
            <Button variant="outline" onClick={handleMarkAllAsRead}>
              <CheckCheck className="h-4 w-4 mr-2" />
              Mark all as read
            </Button>
          )}
          {notifications.length > 0 && (
            <Button variant="outline" onClick={handleDeleteAll}>
              <Trash2 className="h-4 w-4 mr-2" />
              Delete all
            </Button>
          )}
        </div>
      </PageHeader>

      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Total</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{notifications.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Unread</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">{unreadCount}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Today</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">3</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">This Week</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">5</div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="all" className="space-y-4">
        <TabsList>
          <TabsTrigger value="all">
            All ({notifications.length})
          </TabsTrigger>
          <TabsTrigger value="unread">
            Unread ({unreadCount})
          </TabsTrigger>
          <TabsTrigger value="read">
            Read ({readNotifications.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="all">
          <NotificationList items={notifications} />
        </TabsContent>

        <TabsContent value="unread">
          <NotificationList items={unreadNotifications} />
        </TabsContent>

        <TabsContent value="read">
          <NotificationList items={readNotifications} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
