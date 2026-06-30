"use server";

import { revalidatePath } from "next/cache";
import prisma from "@/lib/prisma";

export async function createCategory(data: {
  name: string;
  description?: string;
  parentId?: string;
}) {
  try {
    const category = await prisma.productCategory.create({
      data: {
        name: data.name,
        description: data.description,
        parentId: data.parentId || null,
      },
    });

    revalidatePath("/inventory/categories");
    return { success: true, data: category };
  } catch (error) {
    console.error("Error creating category:", error);
    return { success: false, error: "Failed to create category" };
  }
}

export async function updateCategory(
  id: string,
  data: {
    name: string;
    description?: string;
    parentId?: string;
  }
) {
  try {
    // Prevent setting itself as parent
    if (data.parentId === id) {
      return { success: false, error: "Category cannot be its own parent" };
    }

    const category = await prisma.productCategory.update({
      where: { id },
      data: {
        name: data.name,
        description: data.description,
        parentId: data.parentId || null,
      },
    });

    revalidatePath("/inventory/categories");
    return { success: true, data: category };
  } catch (error) {
    console.error("Error updating category:", error);
    return { success: false, error: "Failed to update category" };
  }
}

export async function deleteCategory(id: string) {
  try {
    // Check if category has products
    const productCount = await prisma.product.count({
      where: { categoryId: id },
    });

    if (productCount > 0) {
      return {
        success: false,
        error: `Cannot delete category with ${productCount} product(s). Move or delete products first.`,
      };
    }

    // Check if category has subcategories
    const subCategoryCount = await prisma.productCategory.count({
      where: { parentId: id },
    });

    if (subCategoryCount > 0) {
      return {
        success: false,
        error: `Cannot delete category with ${subCategoryCount} subcategory(ies). Delete subcategories first.`,
      };
    }

    await prisma.productCategory.delete({
      where: { id },
    });

    revalidatePath("/inventory/categories");
    return { success: true };
  } catch (error) {
    console.error("Error deleting category:", error);
    return { success: false, error: "Failed to delete category" };
  }
}
