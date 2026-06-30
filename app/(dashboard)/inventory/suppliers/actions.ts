"use server";

import { revalidatePath } from "next/cache";
import prisma from "@/lib/prisma";

interface SupplierData {
  name: string;
  code: string;
  email?: string;
  phone?: string;
  address?: string;
  city?: string;
  state?: string;
  postalCode?: string;
  country?: string;
  contactPerson?: string;
  website?: string;
  notes?: string;
  paymentTerms?: string;
  isActive?: boolean;
}

export async function createSupplier(data: SupplierData) {
  try {
    // Check if code is unique
    const existing = await prisma.supplier.findFirst({
      where: { code: data.code },
    });

    if (existing) {
      return { success: false, error: "Supplier code already exists" };
    }

    const supplier = await prisma.supplier.create({
      data: {
        name: data.name,
        code: data.code,
        email: data.email || null,
        phone: data.phone || null,
        address: data.address || null,
        city: data.city || null,
        state: data.state || null,
        postalCode: data.postalCode || null,
        country: data.country || "USA",
        contactPerson: data.contactPerson || null,
        website: data.website || null,
        notes: data.notes || null,
        paymentTerms: data.paymentTerms || "Net 30",
        isActive: data.isActive ?? true,
      },
    });

    revalidatePath("/inventory/suppliers");
    return { success: true, data: supplier };
  } catch (error) {
    console.error("Error creating supplier:", error);
    return { success: false, error: "Failed to create supplier" };
  }
}

export async function updateSupplier(id: string, data: SupplierData) {
  try {
    // Check if code is unique (excluding current supplier)
    const existing = await prisma.supplier.findFirst({
      where: {
        code: data.code,
        NOT: { id },
      },
    });

    if (existing) {
      return { success: false, error: "Supplier code already exists" };
    }

    const supplier = await prisma.supplier.update({
      where: { id },
      data: {
        name: data.name,
        code: data.code,
        email: data.email || null,
        phone: data.phone || null,
        address: data.address || null,
        city: data.city || null,
        state: data.state || null,
        postalCode: data.postalCode || null,
        country: data.country || "USA",
        contactPerson: data.contactPerson || null,
        website: data.website || null,
        notes: data.notes || null,
        paymentTerms: data.paymentTerms || "Net 30",
        isActive: data.isActive ?? true,
      },
    });

    revalidatePath("/inventory/suppliers");
    revalidatePath(`/inventory/suppliers/${id}`);
    return { success: true, data: supplier };
  } catch (error) {
    console.error("Error updating supplier:", error);
    return { success: false, error: "Failed to update supplier" };
  }
}

export async function deleteSupplier(id: string) {
  try {
    // Check if supplier has products
    const productCount = await prisma.product.count({
      where: { supplierId: id },
    });

    if (productCount > 0) {
      return {
        success: false,
        error: `Cannot delete supplier with ${productCount} product(s). Reassign products first.`,
      };
    }

    // Check if supplier has purchase orders
    const orderCount = await prisma.purchaseOrder.count({
      where: { supplierId: id },
    });

    if (orderCount > 0) {
      return {
        success: false,
        error: `Cannot delete supplier with ${orderCount} purchase order(s).`,
      };
    }

    await prisma.supplier.delete({
      where: { id },
    });

    revalidatePath("/inventory/suppliers");
    return { success: true };
  } catch (error) {
    console.error("Error deleting supplier:", error);
    return { success: false, error: "Failed to delete supplier" };
  }
}

export async function toggleSupplierStatus(id: string) {
  try {
    const supplier = await prisma.supplier.findUnique({
      where: { id },
      select: { isActive: true },
    });

    if (!supplier) {
      return { success: false, error: "Supplier not found" };
    }

    await prisma.supplier.update({
      where: { id },
      data: { isActive: !supplier.isActive },
    });

    revalidatePath("/inventory/suppliers");
    return { success: true };
  } catch (error) {
    console.error("Error toggling supplier status:", error);
    return { success: false, error: "Failed to update supplier status" };
  }
}
