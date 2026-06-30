// Re-export all Prisma types for easy importing across the application
export type {
  User,
  Account,
  Session,
  VerificationToken,
  Department,
  Employee,
  LeaveRequest,
  PayrollRecord,
  PerformanceReview,
  Customer,
  Contact,
  Deal,
  DealActivity,
  Communication,
  Supplier,
  ProductCategory,
  Product,
  StockMovement,
  PurchaseOrder,
  PurchaseOrderItem,
  Invoice,
  InvoiceItem,
  Expense,
  Sale,
  SaleItem,
  Project,
  Task,
  Comment,
  TimeLog,
  AuditLog,
  AIConversation,
  Notification,
  SystemSetting,
} from "@prisma/client";

export {
  UserRole,
  EmployeeStatus,
  LeaveType,
  LeaveStatus,
  DealStage,
  DealPriority,
  InvoiceStatus,
  ExpenseCategory,
  ExpenseStatus,
  TaskStatus,
  TaskPriority,
  ProjectStatus,
  PurchaseOrderStatus,
} from "@prisma/client";

// Type aliases for common patterns
import type { Prisma } from "@prisma/client";

// Employee with relations
export type EmployeeWithRelations = Prisma.EmployeeGetPayload<{
  include: {
    user: true;
    department: true;
    manager: true;
  };
}>;

// Product with relations
export type ProductWithRelations = Prisma.ProductGetPayload<{
  include: {
    category: true;
    supplier: true;
  };
}>;

// Deal with relations
export type DealWithRelations = Prisma.DealGetPayload<{
  include: {
    customer: true;
    contact: true;
    salesRep: true;
  };
}>;

// Invoice with relations
export type InvoiceWithRelations = Prisma.InvoiceGetPayload<{
  include: {
    customer: true;
    items: true;
  };
}>;

// Task with relations
export type TaskWithRelations = Prisma.TaskGetPayload<{
  include: {
    project: true;
    assignee: true;
    creator: true;
  };
}>;

// Project with relations
export type ProjectWithRelations = Prisma.ProjectGetPayload<{
  include: {
    department: true;
    tasks: true;
  };
}>;

// Expense with relations
export type ExpenseWithRelations = Prisma.ExpenseGetPayload<{
  include: {
    employee: true;
  };
}>;

// Sale with relations
export type SaleWithRelations = Prisma.SaleGetPayload<{
  include: {
    items: {
      include: {
        product: true;
      };
    };
  };
}>;
