"use server";

import { revalidatePath } from "next/cache";
import prisma from "@/lib/prisma";
import { PurchaseOrderStatus } from "@prisma/client";
import { notifyAdmins } from "@/lib/notifications";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/auth-options";

interface OrderItem {
  productId: string;
  quantity: number;
  unitPrice: number;
}

interface PurchaseOrderData {
  supplierId: string;
  expectedDate?: Date;
  notes?: string;
  items: OrderItem[];
}

export async function createPurchaseOrder(data: PurchaseOrderData) {
  try {
    const session = await getServerSession(authOptions);
    
    // Generate order number
    const count = await prisma.purchaseOrder.count();
    const poNumber = `PO-${String(count + 1).padStart(5, "0")}`;

    // Calculate totals
    const subtotal = data.items.reduce((sum, item) => sum + item.quantity * item.unitPrice, 0);
    const tax = subtotal * 0.1; // 10% tax
    const total = subtotal + tax;

    const order = await prisma.purchaseOrder.create({
      data: {
        poNumber,
        supplierId: data.supplierId,
        status: "DRAFT",
        subtotal,
        tax,
        total,
        expectedDate: data.expectedDate || null,
        notes: data.notes || null,
        items: {
          create: data.items.map((item) => ({
            productId: item.productId,
            quantity: item.quantity,
            unitPrice: item.unitPrice,
            total: item.quantity * item.unitPrice,
          })),
        },
      },
      include: {
        supplier: { select: { name: true } },
      },
    });

    // Notify admins about new purchase order
    await notifyAdmins({
      type: "order",
      title: "New Purchase Order Created",
      message: `${session?.user?.name || "A user"} created purchase order ${poNumber} for ${order.supplier.name} - Total: $${total.toFixed(2)}`,
      link: `/inventory/orders/${order.id}`,
    });

    revalidatePath("/inventory/orders");
    return { success: true, data: order };
  } catch (error) {
    console.error("Error creating purchase order:", error);
    return { success: false, error: "Failed to create purchase order" };
  }
}

export async function updatePurchaseOrderStatus(id: string, status: PurchaseOrderStatus) {
  try {
    const session = await getServerSession(authOptions);
    
    const order = await prisma.purchaseOrder.findUnique({
      where: { id },
      include: { items: true, supplier: { select: { name: true } } },
    });

    if (!order) {
      return { success: false, error: "Order not found" };
    }

    // If receiving order, update stock levels
    if (status === "RECEIVED" && order.status !== "RECEIVED") {
      await prisma.$transaction(async (tx) => {
        // Update order status
        await tx.purchaseOrder.update({
          where: { id },
          data: { 
            status, 
            receivedDate: new Date() 
          },
        });

        // Update stock for each item
        for (const item of order.items) {
          await tx.product.update({
            where: { id: item.productId },
            data: {
              stockLevel: { increment: item.quantity },
            },
          });

          // Create stock movement
          await tx.stockMovement.create({
            data: {
              productId: item.productId,
              type: "PURCHASE",
              quantity: item.quantity,
              notes: `Received from PO ${order.poNumber}`,
              reference: order.poNumber,
            },
          });
        }
      });

      // Notify admins about received order
      await notifyAdmins({
        type: "order",
        title: "Purchase Order Received",
        message: `Order ${order.poNumber} from ${order.supplier.name} has been received and stock updated`,
        link: `/inventory/orders/${id}`,
      });
    } else if (status === "ORDERED") {
      await prisma.purchaseOrder.update({
        where: { id },
        data: { status, orderDate: new Date() },
      });

      // Notify admins that order was placed
      await notifyAdmins({
        type: "order",
        title: "Purchase Order Sent",
        message: `Order ${order.poNumber} has been sent to ${order.supplier.name}`,
        link: `/inventory/orders/${id}`,
      });
    } else {
      await prisma.purchaseOrder.update({
        where: { id },
        data: { status },
      });
    }

    revalidatePath("/inventory/orders");
    revalidatePath(`/inventory/orders/${id}`);
    return { success: true };
  } catch (error) {
    console.error("Error updating purchase order:", error);
    return { success: false, error: "Failed to update purchase order" };
  }
}

export async function deletePurchaseOrder(id: string) {
  try {
    const order = await prisma.purchaseOrder.findUnique({
      where: { id },
      select: { status: true },
    });

    if (!order) {
      return { success: false, error: "Order not found" };
    }

    if (order.status === "RECEIVED") {
      return { success: false, error: "Cannot delete received orders" };
    }

    // Delete items first, then order
    await prisma.$transaction([
      prisma.purchaseOrderItem.deleteMany({ where: { purchaseOrderId: id } }),
      prisma.purchaseOrder.delete({ where: { id } }),
    ]);

    revalidatePath("/inventory/orders");
    return { success: true };
  } catch (error) {
    console.error("Error deleting purchase order:", error);
    return { success: false, error: "Failed to delete purchase order" };
  }
}
