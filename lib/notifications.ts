import prisma from "@/lib/prisma";

export type NotificationType = 
  | "info" 
  | "success" 
  | "warning" 
  | "error" 
  | "project" 
  | "task" 
  | "order" 
  | "payment" 
  | "user";

interface CreateNotificationParams {
  userId: string;
  type: NotificationType;
  title: string;
  message: string;
  link?: string;
}

/**
 * Create a notification for a user
 */
export async function createNotification({
  userId,
  type,
  title,
  message,
  link,
}: CreateNotificationParams) {
  try {
    await prisma.notification.create({
      data: {
        userId,
        type,
        title,
        message,
        link: link || null,
        isRead: false,
      },
    });
  } catch (error) {
    console.error("Failed to create notification:", error);
  }
}

/**
 * Create notifications for all admins
 */
export async function notifyAdmins({
  type,
  title,
  message,
  link,
}: Omit<CreateNotificationParams, "userId">) {
  try {
    const admins = await prisma.user.findMany({
      where: { role: "ADMIN" },
      select: { id: true },
    });

    await prisma.notification.createMany({
      data: admins.map(admin => ({
        userId: admin.id,
        type,
        title,
        message,
        link: link || null,
        isRead: false,
      })),
    });
  } catch (error) {
    console.error("Failed to notify admins:", error);
  }
}

/**
 * Create notifications for specific users
 */
export async function notifyUsers({
  userIds,
  type,
  title,
  message,
  link,
}: {
  userIds: string[];
  type: NotificationType;
  title: string;
  message: string;
  link?: string;
}) {
  try {
    await prisma.notification.createMany({
      data: userIds.map(userId => ({
        userId,
        type,
        title,
        message,
        link: link || null,
        isRead: false,
      })),
    });
  } catch (error) {
    console.error("Failed to notify users:", error);
  }
}
