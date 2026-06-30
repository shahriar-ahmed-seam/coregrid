"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { MoreHorizontal, Send, PackageCheck, XCircle, Trash2, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { updatePurchaseOrderStatus, deletePurchaseOrder } from "../actions";
import { DeleteDialog, ConfirmDialog } from "@/components/ui/form-dialog";

interface OrderActionsProps {
  order: {
    id: string;
    poNumber: string;
    status: string;
  };
}

export function OrderActions({ order }: OrderActionsProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [showDelete, setShowDelete] = useState(false);
  const [showReceive, setShowReceive] = useState(false);

  const handleStatusUpdate = async (status: "ORDERED" | "RECEIVED" | "CANCELLED") => {
    setIsLoading(true);
    try {
      const result = await updatePurchaseOrderStatus(order.id, status);
      if (result.success) {
        const messages: Record<string, string> = {
          ORDERED: "Order has been sent to supplier",
          RECEIVED: "Order received and stock updated",
          CANCELLED: "Order has been cancelled",
        };
        toast.success(messages[status]);
        router.refresh();
      } else {
        toast.error(result.error || "Failed to update order");
      }
    } catch {
      toast.error("An error occurred");
    } finally {
      setIsLoading(false);
      setShowReceive(false);
    }
  };

  const handleDelete = async () => {
    setIsLoading(true);
    try {
      const result = await deletePurchaseOrder(order.id);
      if (result.success) {
        toast.success("Order deleted successfully");
        router.push("/inventory/orders");
      } else {
        toast.error(result.error || "Failed to delete order");
      }
    } catch {
      toast.error("An error occurred");
    } finally {
      setIsLoading(false);
      setShowDelete(false);
    }
  };

  const isDraft = order.status === "DRAFT";
  const isOrdered = order.status === "ORDERED";
  const isReceived = order.status === "RECEIVED";
  const isCancelled = order.status === "CANCELLED";

  return (
    <>
      <div className="flex items-center gap-2">
        {isDraft && (
          <Button onClick={() => handleStatusUpdate("ORDERED")} disabled={isLoading}>
            {isLoading ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <Send className="h-4 w-4 mr-2" />
            )}
            Send to Supplier
          </Button>
        )}

        {isOrdered && (
          <Button onClick={() => setShowReceive(true)} disabled={isLoading}>
            {isLoading ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <PackageCheck className="h-4 w-4 mr-2" />
            )}
            Mark as Received
          </Button>
        )}

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="icon">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            {!isReceived && !isCancelled && (
              <DropdownMenuItem
                onClick={() => handleStatusUpdate("CANCELLED")}
                className="text-destructive"
              >
                <XCircle className="h-4 w-4 mr-2" />
                Cancel Order
              </DropdownMenuItem>
            )}
            {!isReceived && (
              <DropdownMenuItem
                onClick={() => setShowDelete(true)}
                className="text-destructive"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Delete Order
              </DropdownMenuItem>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <ConfirmDialog
        open={showReceive}
        onOpenChange={setShowReceive}
        onConfirm={() => handleStatusUpdate("RECEIVED")}
        title="Receive Order"
        description={`Mark order ${order.poNumber} as received? This will update the stock levels for all items in this order.`}
        confirmLabel="Receive Order"
      />

      <DeleteDialog
        open={showDelete}
        onOpenChange={setShowDelete}
        onConfirm={handleDelete}
        title="Delete Order"
        description={`Are you sure you want to delete order ${order.poNumber}? This action cannot be undone.`}
      />
    </>
  );
}
