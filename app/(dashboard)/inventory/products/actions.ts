"use server";

import { revalidatePath } from "next/cache";
import prisma from "@/lib/prisma";
import { requireRole } from "@/lib/auth/session";
import { z } from "zod";

// ==========================================
// SCHEMAS
// ==========================================

const productSchema = z.object({
  sku: z.string().min(1, "SKU is required"),
  name: z.string().min(1, "Name is required"),
  description: z.string().optional(),
  categoryId: z.string().optional(),
  supplierId: z.string().optional(),
  costPrice: z.number().min(0, "Cost price must be positive"),
  sellingPrice: z.number().min(0, "Selling price must be positive"),
  stockLevel: z.number().int().min(0, "Stock level must be non-negative"),
  reorderPoint: z.number().int().min(0, "Reorder point must be non-negative"),
  reorderQty: z.number().int().min(1, "Reorder quantity must be at least 1"),
  unit: z.string().default("pcs"),
  isActive: z.boolean().default(true),
});

export type ProductFormData = z.infer<typeof productSchema>;

// ==========================================
// CREATE PRODUCT
// ==========================================

export async function createProduct(data: ProductFormData) {
  try {
    await requireRole(["ADMIN", "INVENTORY"]);

    const validated = productSchema.parse(data);

    // Check if SKU already exists
    const existing = await prisma.product.findUnique({
      where: { sku: validated.sku },
    });

    if (existing) {
      return { success: false, error: "A product with this SKU already exists" };
    }

    const product = await prisma.product.create({
      data: {
        ...validated,
        categoryId: validated.categoryId || null,
        supplierId: validated.supplierId || null,
      },
    });

    // Log stock movement for initial stock
    if (validated.stockLevel > 0) {
      await prisma.stockMovement.create({
        data: {
          productId: product.id,
          quantity: validated.stockLevel,
          type: "ADJUSTMENT",
          reference: "Initial Stock",
          notes: "Initial stock level when product was created",
        },
      });
    }

    revalidatePath("/inventory");
    revalidatePath("/inventory/products");

    return { success: true, productId: product.id };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { success: false, error: error.issues[0].message };
    }
    console.error("Create product error:", error);
    return { success: false, error: "Failed to create product" };
  }
}

// ==========================================
// UPDATE PRODUCT
// ==========================================

export async function updateProduct(id: string, data: Partial<ProductFormData>) {
  try {
    await requireRole(["ADMIN", "INVENTORY"]);

    // Get current product for stock comparison
    const currentProduct = await prisma.product.findUnique({
      where: { id },
      select: { stockLevel: true, sku: true },
    });

    if (!currentProduct) {
      return { success: false, error: "Product not found" };
    }

    // Check if new SKU conflicts
    if (data.sku && data.sku !== currentProduct.sku) {
      const existing = await prisma.product.findUnique({
        where: { sku: data.sku },
      });
      if (existing) {
        return { success: false, error: "A product with this SKU already exists" };
      }
    }

    // Update product
    await prisma.product.update({
      where: { id },
      data: {
        ...data,
        categoryId: data.categoryId || null,
        supplierId: data.supplierId || null,
      },
    });

    // Log stock adjustment if stock level changed
    if (data.stockLevel !== undefined && data.stockLevel !== currentProduct.stockLevel) {
      const difference = data.stockLevel - currentProduct.stockLevel;
      await prisma.stockMovement.create({
        data: {
          productId: id,
          quantity: difference,
          type: "ADJUSTMENT",
          reference: "Manual Adjustment",
          notes: `Stock level adjusted from ${currentProduct.stockLevel} to ${data.stockLevel}`,
        },
      });
    }

    revalidatePath("/inventory");
    revalidatePath("/inventory/products");
    revalidatePath(`/inventory/products/${id}`);

    return { success: true };
  } catch (error) {
    console.error("Update product error:", error);
    return { success: false, error: "Failed to update product" };
  }
}

// ==========================================
// DELETE PRODUCT
// ==========================================

export async function deleteProduct(id: string) {
  try {
    await requireRole(["ADMIN", "INVENTORY"]);

    // Soft delete by setting isActive to false
    await prisma.product.update({
      where: { id },
      data: { isActive: false },
    });

    revalidatePath("/inventory");
    revalidatePath("/inventory/products");

    return { success: true };
  } catch (error) {
    console.error("Delete product error:", error);
    return { success: false, error: "Failed to delete product" };
  }
}

// ==========================================
// ADJUST STOCK
// ==========================================

export async function adjustStock(
  productId: string,
  quantity: number,
  type: "PURCHASE" | "SALE" | "ADJUSTMENT" | "RETURN",
  reference?: string,
  notes?: string
) {
  try {
    await requireRole(["ADMIN", "INVENTORY"]);

    // Get current stock level
    const product = await prisma.product.findUnique({
      where: { id: productId },
      select: { stockLevel: true, name: true },
    });

    if (!product) {
      return { success: false, error: "Product not found" };
    }

    const newStockLevel = product.stockLevel + quantity;

    if (newStockLevel < 0) {
      return { success: false, error: "Insufficient stock" };
    }

    // Update stock and create movement record
    await prisma.$transaction([
      prisma.product.update({
        where: { id: productId },
        data: { stockLevel: newStockLevel },
      }),
      prisma.stockMovement.create({
        data: {
          productId,
          quantity,
          type,
          reference,
          notes,
        },
      }),
    ]);

    revalidatePath("/inventory");
    revalidatePath("/inventory/products");
    revalidatePath(`/inventory/products/${productId}`);

    return { success: true, newStockLevel };
  } catch (error) {
    console.error("Adjust stock error:", error);
    return { success: false, error: "Failed to adjust stock" };
  }
}
