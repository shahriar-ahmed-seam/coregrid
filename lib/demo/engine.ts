/**
 * A small Prisma-compatible query engine over the in-memory demo dataset.
 *
 * It supports the subset of Prisma Client features CoreGrid actually uses:
 *   findMany / findUnique / findFirst / count / aggregate / groupBy
 *   create / update / delete / *Many  (best-effort, mutates memory)
 *   where (equality, in/notIn, gt/gte/lt/lte, contains/startsWith, not, AND/OR)
 *   include / select (nested), orderBy, take, skip, distinct, _count
 *
 * Decimal columns are wrapped in decimal.js Decimal on read so the existing
 * `.toNumber()` calls keep working. Anything it cannot interpret degrades
 * gracefully (empty array / null / 0) instead of throwing — a broken demo page
 * is worse than an empty one.
 */
import { Decimal } from "decimal.js";
import { getDemoData, type DemoData } from "./dataset";

type Row = Record<string, any>;
type Rel = { model: string; list: boolean; localKey: string; foreignKey: string };

const DECIMAL_FIELDS: Record<string, string[]> = {
  department: ["budget"],
  employee: ["salary"],
  payrollRecord: ["baseSalary", "bonus", "deductions", "taxWithheld", "netPay"],
  deal: ["value"],
  product: ["costPrice", "sellingPrice"],
  purchaseOrder: ["subtotal", "tax", "total"],
  purchaseOrderItem: ["unitPrice", "total"],
  invoice: ["subtotal", "taxRate", "taxAmount", "discount", "total"],
  invoiceItem: ["unitPrice", "total"],
  expense: ["amount"],
  sale: ["subtotal", "taxAmount", "discount", "total"],
  saleItem: ["unitPrice", "total"],
  project: ["budget"],
  task: ["estimatedHours", "actualHours"],
  timeLog: ["hours"],
};

const RELATIONS: Record<string, Record<string, Rel>> = {
  user: {
    employee: { model: "employee", list: false, localKey: "id", foreignKey: "userId" },
    accounts: { model: "account", list: true, localKey: "id", foreignKey: "userId" },
    sessions: { model: "session", list: true, localKey: "id", foreignKey: "userId" },
    auditLogs: { model: "auditLog", list: true, localKey: "id", foreignKey: "userId" },
    assignedTasks: { model: "task", list: true, localKey: "id", foreignKey: "assigneeId" },
    createdTasks: { model: "task", list: true, localKey: "id", foreignKey: "creatorId" },
    comments: { model: "comment", list: true, localKey: "id", foreignKey: "userId" },
    notifications: { model: "notification", list: true, localKey: "id", foreignKey: "userId" },
  },
  department: {
    manager: { model: "employee", list: false, localKey: "managerId", foreignKey: "id" },
    employees: { model: "employee", list: true, localKey: "id", foreignKey: "departmentId" },
    projects: { model: "project", list: true, localKey: "id", foreignKey: "departmentId" },
  },
  employee: {
    user: { model: "user", list: false, localKey: "userId", foreignKey: "id" },
    department: { model: "department", list: false, localKey: "departmentId", foreignKey: "id" },
    manager: { model: "employee", list: false, localKey: "managerId", foreignKey: "id" },
    subordinates: { model: "employee", list: true, localKey: "id", foreignKey: "managerId" },
    managedDepartments: { model: "department", list: true, localKey: "id", foreignKey: "managerId" },
    leaveRequests: { model: "leaveRequest", list: true, localKey: "id", foreignKey: "employeeId" },
    attendance: { model: "attendance", list: true, localKey: "id", foreignKey: "employeeId" },
    leaveRequestsApproved: { model: "leaveRequest", list: true, localKey: "id", foreignKey: "approverId" },
    payrollRecords: { model: "payrollRecord", list: true, localKey: "id", foreignKey: "employeeId" },
    performanceReviews: { model: "performanceReview", list: true, localKey: "id", foreignKey: "employeeId" },
    expenses: { model: "expense", list: true, localKey: "id", foreignKey: "employeeId" },
    timeLogs: { model: "timeLog", list: true, localKey: "id", foreignKey: "employeeId" },
    salesDeals: { model: "deal", list: true, localKey: "id", foreignKey: "salesRepId" },
  },
  leaveRequest: {
    employee: { model: "employee", list: false, localKey: "employeeId", foreignKey: "id" },
    approver: { model: "employee", list: false, localKey: "approverId", foreignKey: "id" },
  },
  attendance: {
    employee: { model: "employee", list: false, localKey: "employeeId", foreignKey: "id" },
  },
  payrollRecord: {
    employee: { model: "employee", list: false, localKey: "employeeId", foreignKey: "id" },
  },
  performanceReview: {
    employee: { model: "employee", list: false, localKey: "employeeId", foreignKey: "id" },
  },
  customer: {
    contacts: { model: "contact", list: true, localKey: "id", foreignKey: "customerId" },
    deals: { model: "deal", list: true, localKey: "id", foreignKey: "customerId" },
    invoices: { model: "invoice", list: true, localKey: "id", foreignKey: "customerId" },
    communications: { model: "communication", list: true, localKey: "id", foreignKey: "customerId" },
  },
  contact: {
    customer: { model: "customer", list: false, localKey: "customerId", foreignKey: "id" },
    deals: { model: "deal", list: true, localKey: "id", foreignKey: "contactId" },
  },
  deal: {
    customer: { model: "customer", list: false, localKey: "customerId", foreignKey: "id" },
    contact: { model: "contact", list: false, localKey: "contactId", foreignKey: "id" },
    salesRep: { model: "employee", list: false, localKey: "salesRepId", foreignKey: "id" },
    activities: { model: "dealActivity", list: true, localKey: "id", foreignKey: "dealId" },
  },
  dealActivity: {
    deal: { model: "deal", list: false, localKey: "dealId", foreignKey: "id" },
  },
  communication: {
    customer: { model: "customer", list: false, localKey: "customerId", foreignKey: "id" },
  },
  supplier: {
    products: { model: "product", list: true, localKey: "id", foreignKey: "supplierId" },
    purchaseOrders: { model: "purchaseOrder", list: true, localKey: "id", foreignKey: "supplierId" },
  },
  productCategory: {
    parent: { model: "productCategory", list: false, localKey: "parentId", foreignKey: "id" },
    children: { model: "productCategory", list: true, localKey: "id", foreignKey: "parentId" },
    products: { model: "product", list: true, localKey: "id", foreignKey: "categoryId" },
  },
  product: {
    category: { model: "productCategory", list: false, localKey: "categoryId", foreignKey: "id" },
    supplier: { model: "supplier", list: false, localKey: "supplierId", foreignKey: "id" },
    saleItems: { model: "saleItem", list: true, localKey: "id", foreignKey: "productId" },
    purchaseOrderItems: { model: "purchaseOrderItem", list: true, localKey: "id", foreignKey: "productId" },
    stockMovements: { model: "stockMovement", list: true, localKey: "id", foreignKey: "productId" },
  },
  stockMovement: {
    product: { model: "product", list: false, localKey: "productId", foreignKey: "id" },
  },
  purchaseOrder: {
    supplier: { model: "supplier", list: false, localKey: "supplierId", foreignKey: "id" },
    items: { model: "purchaseOrderItem", list: true, localKey: "id", foreignKey: "purchaseOrderId" },
  },
  purchaseOrderItem: {
    purchaseOrder: { model: "purchaseOrder", list: false, localKey: "purchaseOrderId", foreignKey: "id" },
    product: { model: "product", list: false, localKey: "productId", foreignKey: "id" },
  },
  invoice: {
    customer: { model: "customer", list: false, localKey: "customerId", foreignKey: "id" },
    items: { model: "invoiceItem", list: true, localKey: "id", foreignKey: "invoiceId" },
  },
  invoiceItem: {
    invoice: { model: "invoice", list: false, localKey: "invoiceId", foreignKey: "id" },
  },
  expense: {
    employee: { model: "employee", list: false, localKey: "employeeId", foreignKey: "id" },
  },
  sale: {
    items: { model: "saleItem", list: true, localKey: "id", foreignKey: "saleId" },
  },
  saleItem: {
    sale: { model: "sale", list: false, localKey: "saleId", foreignKey: "id" },
    product: { model: "product", list: false, localKey: "productId", foreignKey: "id" },
  },
  project: {
    department: { model: "department", list: false, localKey: "departmentId", foreignKey: "id" },
    tasks: { model: "task", list: true, localKey: "id", foreignKey: "projectId" },
    timeLogs: { model: "timeLog", list: true, localKey: "id", foreignKey: "projectId" },
  },
  task: {
    project: { model: "project", list: false, localKey: "projectId", foreignKey: "id" },
    assignee: { model: "user", list: false, localKey: "assigneeId", foreignKey: "id" },
    creator: { model: "user", list: false, localKey: "creatorId", foreignKey: "id" },
    parent: { model: "task", list: false, localKey: "parentId", foreignKey: "id" },
    subtasks: { model: "task", list: true, localKey: "id", foreignKey: "parentId" },
    comments: { model: "comment", list: true, localKey: "id", foreignKey: "taskId" },
    timeLogs: { model: "timeLog", list: true, localKey: "id", foreignKey: "taskId" },
  },
  comment: {
    task: { model: "task", list: false, localKey: "taskId", foreignKey: "id" },
    user: { model: "user", list: false, localKey: "userId", foreignKey: "id" },
  },
  timeLog: {
    employee: { model: "employee", list: false, localKey: "employeeId", foreignKey: "id" },
    project: { model: "project", list: false, localKey: "projectId", foreignKey: "id" },
    task: { model: "task", list: false, localKey: "taskId", foreignKey: "id" },
  },
  notification: {
    user: { model: "user", list: false, localKey: "userId", foreignKey: "id" },
  },
  auditLog: {
    user: { model: "user", list: false, localKey: "userId", foreignKey: "id" },
  },
};

// ---------------------------------------------------------------------------
// where matching
// ---------------------------------------------------------------------------
function toComparable(v: any): any {
  if (v instanceof Date) return v.getTime();
  if (v instanceof Decimal) return v.toNumber();
  return v;
}

function matchCondition(value: any, cond: any): boolean {
  if (cond === null) return value === null || value === undefined;
  if (cond instanceof Date) return toComparable(value) === cond.getTime();
  if (typeof cond !== "object") return toComparable(value) === toComparable(cond);

  // operator object
  const v = toComparable(value);
  for (const [op, operand] of Object.entries(cond)) {
    switch (op) {
      case "equals":
        if (toComparable(operand) !== v) return false;
        break;
      case "not":
        if (typeof operand === "object" && operand !== null && !(operand instanceof Date)) {
          if (matchCondition(value, operand)) return false;
        } else if (toComparable(operand) === v) return false;
        break;
      case "in":
        if (!Array.isArray(operand) || !operand.map(toComparable).includes(v)) return false;
        break;
      case "notIn":
        if (Array.isArray(operand) && operand.map(toComparable).includes(v)) return false;
        break;
      case "lt":
        if (!(v < toComparable(operand))) return false;
        break;
      case "lte":
        if (!(v <= toComparable(operand))) return false;
        break;
      case "gt":
        if (!(v > toComparable(operand))) return false;
        break;
      case "gte":
        if (!(v >= toComparable(operand))) return false;
        break;
      case "contains":
        if (typeof v !== "string" || !v.toLowerCase().includes(String(operand).toLowerCase())) return false;
        break;
      case "startsWith":
        if (typeof v !== "string" || !v.toLowerCase().startsWith(String(operand).toLowerCase())) return false;
        break;
      case "endsWith":
        if (typeof v !== "string" || !v.toLowerCase().endsWith(String(operand).toLowerCase())) return false;
        break;
      case "mode":
        break; // case-insensitivity already applied
      default:
        break; // unknown operator -> ignore
    }
  }
  return true;
}

function matchWhere(row: Row, where: any, model: string): boolean {
  if (!where) return true;
  for (const [key, cond] of Object.entries(where)) {
    if (key === "AND") {
      const arr = Array.isArray(cond) ? cond : [cond];
      if (!arr.every((c) => matchWhere(row, c, model))) return false;
    } else if (key === "OR") {
      const arr = (cond as any[]) || [];
      if (arr.length && !arr.some((c) => matchWhere(row, c, model))) return false;
    } else if (key === "NOT") {
      const arr = Array.isArray(cond) ? cond : [cond];
      if (arr.some((c) => matchWhere(row, c, model))) return false;
    } else if (RELATIONS[model]?.[key]) {
      // relation filter — not needed by current pages; treat as pass-through
      continue;
    } else {
      if (!matchCondition(row[key], cond)) return false;
    }
  }
  return true;
}

// ---------------------------------------------------------------------------
// read shaping: decimals, include, select, orderBy
// ---------------------------------------------------------------------------
function wrapDecimals(model: string, row: Row): Row {
  const fields = DECIMAL_FIELDS[model];
  if (!fields) return { ...row };
  const out: Row = { ...row };
  for (const f of fields) {
    if (out[f] !== null && out[f] !== undefined && !(out[f] instanceof Decimal)) {
      out[f] = new Decimal(out[f]);
    }
  }
  return out;
}

function sortRows(rows: Row[], orderBy: any): Row[] {
  if (!orderBy) return rows;
  const orders = Array.isArray(orderBy) ? orderBy : [orderBy];
  return [...rows].sort((a, b) => {
    for (const o of orders) {
      const [field, dir] = Object.entries(o)[0] as [string, string];
      const av = toComparable(a[field]);
      const bv = toComparable(b[field]);
      if (av == null && bv == null) continue;
      if (av == null) return dir === "asc" ? -1 : 1;
      if (bv == null) return dir === "asc" ? 1 : -1;
      if (av < bv) return dir === "asc" ? -1 : 1;
      if (av > bv) return dir === "asc" ? 1 : -1;
    }
    return 0;
  });
}

class Engine {
  private data: DemoData;
  constructor() {
    this.data = getDemoData();
  }

  table(model: string): Row[] {
    if (!this.data[model]) this.data[model] = [];
    return this.data[model];
  }

  private resolveRelation(model: string, row: Row, relName: string, sub: any): any {
    const rel = RELATIONS[model]?.[relName];
    if (!rel) return rel === undefined ? undefined : null;
    const target = this.table(rel.model);
    const localVal = row[rel.localKey];
    let matches = target.filter((t) => t[rel.foreignKey] === localVal);
    const subObj = typeof sub === "object" && sub !== null ? sub : {};
    if (subObj.where) matches = matches.filter((m) => matchWhere(m, subObj.where, rel.model));
    if (subObj.orderBy) matches = sortRows(matches, subObj.orderBy);
    if (rel.list) {
      if (typeof subObj.take === "number") matches = matches.slice(0, subObj.take);
      return matches.map((m) => this.shape(rel.model, m, subObj));
    }
    return matches.length ? this.shape(rel.model, matches[0], subObj) : null;
  }

  private relationCount(model: string, row: Row, relName: string): number {
    const rel = RELATIONS[model]?.[relName];
    if (!rel || !rel.list) return 0;
    const target = this.table(rel.model);
    return target.filter((t) => t[rel.foreignKey] === row[rel.localKey]).length;
  }

  /** Apply include/select to a single row. */
  shape(model: string, row: Row, args: any): Row {
    const base = wrapDecimals(model, row);

    // select takes precedence and restricts fields
    if (args?.select) {
      const out: Row = {};
      for (const [key, val] of Object.entries(args.select)) {
        if (!val) continue;
        if (key === "_count") {
          out._count = this.buildCount(model, row, val);
        } else if (RELATIONS[model]?.[key]) {
          out[key] = this.resolveRelation(model, row, key, val);
        } else {
          out[key] = base[key];
        }
      }
      return out;
    }

    if (args?.include) {
      for (const [key, val] of Object.entries(args.include)) {
        if (!val) continue;
        if (key === "_count") {
          base._count = this.buildCount(model, row, val);
        } else if (RELATIONS[model]?.[key]) {
          base[key] = this.resolveRelation(model, row, key, val);
        }
      }
    }
    return base;
  }

  private buildCount(model: string, row: Row, spec: any): Record<string, number> {
    const out: Record<string, number> = {};
    const sel = spec?.select ?? spec;
    if (sel && typeof sel === "object") {
      for (const [rel, on] of Object.entries(sel)) {
        if (on) out[rel] = this.relationCount(model, row, rel);
      }
    }
    return out;
  }

  filterSortPage(model: string, args: any): Row[] {
    let rows = this.table(model).filter((r) => matchWhere(r, args?.where, model));
    rows = sortRows(rows, args?.orderBy);
    if (typeof args?.skip === "number") rows = rows.slice(args.skip);
    if (typeof args?.take === "number") rows = rows.slice(0, args.take);
    return rows;
  }

  findMany(model: string, args: any = {}): Row[] {
    return this.filterSortPage(model, args).map((r) => this.shape(model, r, args));
  }

  findFirst(model: string, args: any = {}): Row | null {
    const rows = this.filterSortPage(model, { ...args, take: 1 });
    return rows.length ? this.shape(model, rows[0], args) : null;
  }

  findUnique(model: string, args: any = {}): Row | null {
    const rows = this.table(model).filter((r) => matchWhere(r, args?.where, model));
    return rows.length ? this.shape(model, rows[0], args) : null;
  }

  count(model: string, args: any = {}): number {
    return this.table(model).filter((r) => matchWhere(r, args?.where, model)).length;
  }

  aggregate(model: string, args: any = {}): any {
    const rows = this.table(model).filter((r) => matchWhere(r, args?.where, model));
    const result: any = {};
    const apply = (key: "_sum" | "_avg" | "_min" | "_max") => {
      if (!args[key]) return;
      result[key] = {};
      for (const field of Object.keys(args[key])) {
        const nums = rows.map((r) => Number(toComparable(r[field])) || 0);
        if (key === "_sum") result[key][field] = nums.reduce((a, b) => a + b, 0);
        else if (key === "_avg") result[key][field] = nums.length ? nums.reduce((a, b) => a + b, 0) / nums.length : 0;
        else if (key === "_min") result[key][field] = nums.length ? Math.min(...nums) : 0;
        else if (key === "_max") result[key][field] = nums.length ? Math.max(...nums) : 0;
      }
    };
    apply("_sum");
    apply("_avg");
    apply("_min");
    apply("_max");
    if (args._count) {
      if (typeof args._count === "object") {
        result._count = {};
        for (const field of Object.keys(args._count)) result._count[field] = rows.length;
      } else {
        result._count = rows.length;
      }
    }
    return result;
  }

  groupBy(model: string, args: any = {}): any[] {
    const rows = this.table(model).filter((r) => matchWhere(r, args?.where, model));
    const by: string[] = args.by || [];
    const groups = new Map<string, Row[]>();
    for (const r of rows) {
      const key = by.map((b) => String(r[b])).join("|");
      if (!groups.has(key)) groups.set(key, []);
      groups.get(key)!.push(r);
    }
    const out: any[] = [];
    for (const grp of groups.values()) {
      const entry: any = {};
      for (const b of by) entry[b] = grp[0][b];
      if (args._count) {
        if (typeof args._count === "object") {
          entry._count = {};
          for (const f of Object.keys(args._count)) entry._count[f] = grp.length;
        } else entry._count = grp.length;
      }
      if (args._sum) {
        entry._sum = {};
        for (const f of Object.keys(args._sum))
          entry._sum[f] = grp.reduce((a, r) => a + (Number(toComparable(r[f])) || 0), 0);
      }
      if (args._avg) {
        entry._avg = {};
        for (const f of Object.keys(args._avg))
          entry._avg[f] = grp.reduce((a, r) => a + (Number(toComparable(r[f])) || 0), 0) / grp.length;
      }
      out.push(entry);
    }
    return out;
  }

  // --- writes (best-effort, in-memory) ---
  create(model: string, args: any = {}): Row {
    const rec: Row = {
      id: `${model}-${Math.random().toString(36).slice(2, 10)}`,
      createdAt: new Date(),
      updatedAt: new Date(),
      ...(args.data || {}),
    };
    // strip nested writes we cannot persist
    for (const k of Object.keys(rec)) {
      if (rec[k] && typeof rec[k] === "object" && ("create" in rec[k] || "connect" in rec[k])) {
        delete rec[k];
      }
    }
    this.table(model).unshift(rec);
    return this.shape(model, rec, args);
  }

  update(model: string, args: any = {}): Row {
    const rows = this.table(model);
    const idx = rows.findIndex((r) => matchWhere(r, args?.where, model));
    if (idx === -1) return this.shape(model, { id: "missing", ...(args.data || {}) }, args);
    rows[idx] = { ...rows[idx], ...(args.data || {}), updatedAt: new Date() };
    return this.shape(model, rows[idx], args);
  }

  delete(model: string, args: any = {}): Row {
    const rows = this.table(model);
    const idx = rows.findIndex((r) => matchWhere(r, args?.where, model));
    if (idx === -1) return { id: "missing" };
    const [removed] = rows.splice(idx, 1);
    return wrapDecimals(model, removed);
  }

  updateMany(model: string, args: any = {}): { count: number } {
    const rows = this.table(model);
    let count = 0;
    for (let i = 0; i < rows.length; i++) {
      if (matchWhere(rows[i], args?.where, model)) {
        rows[i] = { ...rows[i], ...(args.data || {}), updatedAt: new Date() };
        count++;
      }
    }
    return { count };
  }

  deleteMany(model: string, args: any = {}): { count: number } {
    const rows = this.table(model);
    let count = 0;
    for (let i = rows.length - 1; i >= 0; i--) {
      if (matchWhere(rows[i], args?.where, model)) {
        rows.splice(i, 1);
        count++;
      }
    }
    return { count };
  }

  createMany(model: string, args: any = {}): { count: number } {
    const list: Row[] = args.data || [];
    for (const d of list) this.create(model, { data: d });
    return { count: list.length };
  }
}

// ---------------------------------------------------------------------------
// Build a PrismaClient-compatible proxy
// ---------------------------------------------------------------------------
export function createDemoPrisma(): any {
  const engine = new Engine();

  const modelHandler = (model: string) => ({
    findMany: (a?: any) => Promise.resolve(engine.findMany(model, a)),
    findFirst: (a?: any) => Promise.resolve(engine.findFirst(model, a)),
    findUnique: (a?: any) => Promise.resolve(engine.findUnique(model, a)),
    findUniqueOrThrow: (a?: any) => Promise.resolve(engine.findUnique(model, a)),
    findFirstOrThrow: (a?: any) => Promise.resolve(engine.findFirst(model, a)),
    count: (a?: any) => Promise.resolve(engine.count(model, a)),
    aggregate: (a?: any) => Promise.resolve(engine.aggregate(model, a)),
    groupBy: (a?: any) => Promise.resolve(engine.groupBy(model, a)),
    create: (a?: any) => Promise.resolve(engine.create(model, a)),
    createMany: (a?: any) => Promise.resolve(engine.createMany(model, a)),
    update: (a?: any) => Promise.resolve(engine.update(model, a)),
    updateMany: (a?: any) => Promise.resolve(engine.updateMany(model, a)),
    upsert: (a?: any) => {
      const found = engine.findUnique(model, { where: a.where });
      return Promise.resolve(found ? engine.update(model, { where: a.where, data: a.update }) : engine.create(model, { data: a.create }));
    },
    delete: (a?: any) => Promise.resolve(engine.delete(model, a)),
    deleteMany: (a?: any) => Promise.resolve(engine.deleteMany(model, a)),
  });

  const cache: Record<string, any> = {};

  const base: any = {
    $connect: () => Promise.resolve(),
    $disconnect: () => Promise.resolve(),
    $queryRaw: () => Promise.resolve([]),
    $executeRaw: () => Promise.resolve(0),
  };

  const proxy: any = new Proxy(base, {
    get(target, prop: string) {
      if (prop in target) return (target as any)[prop];
      if (typeof prop !== "string") return undefined;
      if (!cache[prop]) cache[prop] = modelHandler(prop);
      return cache[prop];
    },
  });

  base.$transaction = (arg: any) => {
    if (typeof arg === "function") return Promise.resolve(arg(proxy));
    return Promise.all(arg);
  };

  return proxy;
}
