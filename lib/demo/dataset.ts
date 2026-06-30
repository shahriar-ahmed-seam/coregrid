/**
 * Deterministic in-memory dataset for CoreGrid demo mode.
 *
 * Decimal columns are stored as plain numbers here; the query engine wraps them
 * in Decimal instances on read so `.toNumber()` keeps working in the UI.
 * Dates are real Date objects. IDs are stable, human-readable strings so the
 * data set is identical across server renders (no hydration drift).
 */

// ---------------------------------------------------------------------------
// Seeded pseudo-random helpers (mulberry32) — stable output every run.
// ---------------------------------------------------------------------------
function mulberry32(seed: number) {
  let a = seed;
  return function () {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
const rand = mulberry32(20260630);
const pick = <T>(arr: T[]): T => arr[Math.floor(rand() * arr.length)];
const num = (min: number, max: number) => Math.floor(rand() * (max - min + 1)) + min;
const money = (min: number, max: number) => Math.round((rand() * (max - min) + min) * 100) / 100;
const dateBetween = (start: Date, end: Date) =>
  new Date(start.getTime() + rand() * (end.getTime() - start.getTime()));
const daysAgo = (d: number) => new Date(Date.now() - d * 86400000);
const daysAhead = (d: number) => new Date(Date.now() + d * 86400000);

// ---------------------------------------------------------------------------
// Source vocabularies
// ---------------------------------------------------------------------------
const firstNames = ["James","Mary","John","Patricia","Robert","Jennifer","Michael","Linda","William","Elizabeth","David","Barbara","Richard","Susan","Joseph","Jessica","Thomas","Sarah","Charles","Karen","Christopher","Lisa","Daniel","Nancy","Matthew","Betty","Anthony","Margaret","Mark","Sandra","Steven","Kimberly","Paul","Emily","Andrew","Donna","Joshua","Michelle","Kenneth","Dorothy","Kevin","Carol","Brian","Amanda","George","Melissa","Avery","Jordan","Riley","Morgan"];
const lastNames = ["Smith","Johnson","Williams","Brown","Jones","Garcia","Miller","Davis","Rodriguez","Martinez","Hernandez","Lopez","Gonzalez","Wilson","Anderson","Thomas","Taylor","Moore","Jackson","Martin","Lee","Perez","Thompson","White","Harris","Sanchez","Clark","Ramirez","Lewis","Robinson","Walker","Young","Allen","King","Wright","Scott","Torres","Nguyen","Hill","Flores"];
const companyNames = ["TechFlow Solutions","Quantum Dynamics Inc","NexGen Systems","CloudPeak Technologies","DataSphere Analytics","Innovate Labs","Digital Frontier Corp","CyberNet Solutions","Phoenix Enterprises","Atlas Global Services","Vertex Industries","Prism Technologies","Horizon Software","Apex Consulting","Stellar Systems","Fusion Tech Group","Momentum Partners","Catalyst Innovations","Echo Digital","Nova Computing"];
const industries = ["Technology","Healthcare","Finance","Manufacturing","Retail","Education","Real Estate","Energy","Transportation","Telecommunications"];
const jobTitles = ["Software Engineer","Senior Developer","Product Manager","UX Designer","Data Analyst","DevOps Engineer","QA Engineer","Technical Lead","Sales Representative","Account Executive","Sales Manager","Business Analyst","HR Specialist","Recruiter","Financial Analyst","Accountant","Marketing Specialist","IT Administrator","Support Specialist","Network Engineer"];
const cities = ["New York","San Francisco","Chicago","Austin","Seattle","Boston","Los Angeles","Denver"];
const states = ["NY","CA","IL","TX","WA","MA","CO","AZ"];

const departmentSeed = [
  { name: "Engineering", budget: 500000 },
  { name: "Sales", budget: 300000 },
  { name: "Human Resources", budget: 150000 },
  { name: "Finance", budget: 200000 },
  { name: "Marketing", budget: 250000 },
  { name: "Operations", budget: 180000 },
  { name: "IT Support", budget: 220000 },
  { name: "Customer Success", budget: 160000 },
];

const categorySeed = [
  { name: "Electronics", description: "Electronic devices and accessories" },
  { name: "Office Supplies", description: "Stationery and office equipment" },
  { name: "Computer Hardware", description: "Computers, peripherals and components" },
  { name: "Networking", description: "Network infrastructure and equipment" },
  { name: "Software Licenses", description: "Software and subscription licenses" },
  { name: "Furniture", description: "Office and workspace furniture" },
];

const productSeed = [
  { name: "Wireless Mouse", sku: "ELEC-001", category: "Electronics", cost: 15, price: 29.99 },
  { name: "Mechanical Keyboard", sku: "ELEC-002", category: "Electronics", cost: 45, price: 89.99 },
  { name: "USB-C Hub", sku: "ELEC-003", category: "Electronics", cost: 25, price: 49.99 },
  { name: "Webcam HD 1080p", sku: "ELEC-004", category: "Electronics", cost: 35, price: 69.99 },
  { name: "Monitor Stand", sku: "ELEC-005", category: "Electronics", cost: 20, price: 44.99 },
  { name: "A4 Paper Ream (500)", sku: "OFFC-001", category: "Office Supplies", cost: 4, price: 8.99 },
  { name: "Ballpoint Pens (50 pack)", sku: "OFFC-002", category: "Office Supplies", cost: 8, price: 16.99 },
  { name: "Sticky Notes Assorted", sku: "OFFC-003", category: "Office Supplies", cost: 3, price: 7.99 },
  { name: "Desk Organizer", sku: "OFFC-005", category: "Office Supplies", cost: 12, price: 24.99 },
  { name: "Desktop PC i7", sku: "COMP-001", category: "Computer Hardware", cost: 650, price: 999.99 },
  { name: 'Laptop 15.6" Business', sku: "COMP-002", category: "Computer Hardware", cost: 550, price: 849.99 },
  { name: '27" 4K Monitor', sku: "COMP-003", category: "Computer Hardware", cost: 280, price: 449.99 },
  { name: "External SSD 1TB", sku: "COMP-004", category: "Computer Hardware", cost: 70, price: 129.99 },
  { name: "RAM DDR5 32GB", sku: "COMP-005", category: "Computer Hardware", cost: 95, price: 159.99 },
  { name: "Ethernet Switch 24-Port", sku: "NETW-001", category: "Networking", cost: 180, price: 299.99 },
  { name: "WiFi 6 Router", sku: "NETW-002", category: "Networking", cost: 120, price: 199.99 },
  { name: "CAT6 Cable 100m", sku: "NETW-003", category: "Networking", cost: 45, price: 79.99 },
  { name: "Microsoft 365 Business", sku: "SOFT-001", category: "Software Licenses", cost: 150, price: 249.99 },
  { name: "Adobe Creative Cloud", sku: "SOFT-003", category: "Software Licenses", cost: 400, price: 599.99 },
  { name: "CRM Software License", sku: "SOFT-005", category: "Software Licenses", cost: 200, price: 349.99 },
  { name: "Ergonomic Office Chair", sku: "FURN-001", category: "Furniture", cost: 180, price: 299.99 },
  { name: "Standing Desk Electric", sku: "FURN-002", category: "Furniture", cost: 350, price: 549.99 },
  { name: "Filing Cabinet 4-Drawer", sku: "FURN-003", category: "Furniture", cost: 120, price: 199.99 },
  { name: "Conference Table 8ft", sku: "FURN-004", category: "Furniture", cost: 450, price: 699.99 },
];

const supplierSeed = [
  { name: "Global Tech Distributors", email: "orders@globaltechdist.com", rating: 5 },
  { name: "Office Essentials Co", email: "sales@officeessentials.com", rating: 4 },
  { name: "Premier Hardware Supply", email: "info@premierhw.com", rating: 5 },
  { name: "NetWorks Plus", email: "orders@networksplus.com", rating: 4 },
  { name: "SoftLicense Direct", email: "enterprise@softlicensedirect.com", rating: 5 },
  { name: "FurniPro Business", email: "b2b@furnipro.com", rating: 4 },
];

const slug = (s: string) => s.toLowerCase().replace(/[^a-z0-9]+/g, "");
const id = (prefix: string, n: number) => `${prefix}-${String(n).padStart(4, "0")}`;

// ---------------------------------------------------------------------------
// Build records
// ---------------------------------------------------------------------------
type Row = Record<string, unknown>;

export interface DemoData {
  [model: string]: Row[];
}

function build(): DemoData {
  const now = new Date();

  // Departments
  const departments: Row[] = departmentSeed.map((d, i) => ({
    id: id("dept", i + 1),
    name: d.name,
    code: d.name.substring(0, 3).toUpperCase(),
    description: `${d.name} department`,
    managerId: null,
    budget: d.budget,
    createdAt: daysAgo(900 - i * 10),
    updatedAt: daysAgo(20),
  }));

  // Users + Employees
  const roleByIndex = ["ADMIN", "HR", "SALES", "INVENTORY", "FINANCE", "PROJECT_MANAGER"];
  const users: Row[] = [];
  const employees: Row[] = [];
  const empCount = 60;
  for (let i = 0; i < empCount; i++) {
    const fn = pick(firstNames);
    const ln = pick(lastNames);
    const role = i === 0 ? "ADMIN" : i < 6 ? roleByIndex[i] : "EMPLOYEE";
    const name = i === 0 ? "Avery Quinn" : `${fn} ${ln}`;
    const email =
      i === 0 ? "admin@coregrid.com" : `${slug(fn)}.${slug(ln)}${i}@coregrid.com`;
    const userId = i === 0 ? "demo-admin" : id("user", i + 1);
    const dept = pick(departments);
    const hire = dateBetween(new Date(2020, 0, 1), daysAgo(40));
    users.push({
      id: userId,
      email,
      emailVerified: null,
      passwordHash: null,
      name,
      image: null,
      role,
      isActive: true,
      createdAt: hire,
      updatedAt: daysAgo(10),
    });
    const isOnLeave = rand() < 0.06;
    employees.push({
      id: id("emp", i + 1),
      employeeId: `EMP-${String(i + 1).padStart(4, "0")}`,
      userId,
      firstName: i === 0 ? "Avery" : fn,
      lastName: i === 0 ? "Quinn" : ln,
      email,
      gender: pick(["MALE", "FEMALE", "OTHER"]),
      dateOfBirth: dateBetween(new Date(1980, 0, 1), new Date(2000, 0, 1)),
      phone: `+1-${num(200, 999)}-${num(100, 999)}-${num(1000, 9999)}`,
      address: `${num(100, 9999)} Main St`,
      city: pick(cities),
      state: pick(states),
      zipCode: String(num(10000, 99999)),
      country: "USA",
      position: i === 0 ? "Chief Operating Officer" : pick(jobTitles),
      hireDate: hire,
      terminationDate: null,
      salary: num(48000, 165000),
      employmentType: pick(["FULL_TIME", "FULL_TIME", "FULL_TIME", "PART_TIME", "CONTRACT"]),
      status: isOnLeave ? "ON_LEAVE" : "ACTIVE",
      departmentId: (dept as Row).id,
      managerId: null,
      createdAt: hire,
      updatedAt: daysAgo(5),
    });
  }
  // assign department managers
  for (const d of departments) {
    const inDept = employees.filter((e) => e.departmentId === d.id);
    if (inDept.length) d.managerId = inDept[0].id;
  }

  // Suppliers
  const suppliers: Row[] = supplierSeed.map((s, i) => ({
    id: id("sup", i + 1),
    name: s.name,
    code: `SUP-${String(i + 1).padStart(3, "0")}`,
    contactName: `${pick(firstNames)} ${pick(lastNames)}`,
    contactPerson: `${pick(firstNames)} ${pick(lastNames)}`,
    email: s.email,
    phone: `+1-${num(200, 999)}-${num(100, 999)}-${num(1000, 9999)}`,
    address: `${num(100, 9999)} Industrial Ave`,
    city: pick(cities),
    state: pick(states),
    zipCode: String(num(10000, 99999)),
    postalCode: String(num(10000, 99999)),
    country: "USA",
    website: `https://${slug(s.name)}.com`,
    notes: null,
    rating: s.rating,
    paymentTerms: pick(["Net 30", "Net 60", "Net 15"]),
    isActive: true,
    createdAt: daysAgo(800 - i * 15),
    updatedAt: daysAgo(15),
  }));

  // Categories
  const categories: Row[] = categorySeed.map((c, i) => ({
    id: id("cat", i + 1),
    name: c.name,
    description: c.description,
    parentId: null,
    createdAt: daysAgo(850),
    updatedAt: daysAgo(30),
  }));
  const catByName = new Map(categories.map((c) => [c.name, c.id]));

  // Products
  const products: Row[] = productSeed.map((p, i) => {
    const stock = num(0, 200);
    const reorder = num(10, 30);
    return {
      id: id("prod", i + 1),
      sku: p.sku,
      name: p.name,
      description: `High quality ${p.name.toLowerCase()}`,
      categoryId: catByName.get(p.category) ?? null,
      supplierId: pick(suppliers).id,
      costPrice: p.cost,
      sellingPrice: p.price,
      stockLevel: stock,
      reorderPoint: reorder,
      reorderQty: num(20, 100),
      unit: "pcs",
      isActive: true,
      createdAt: daysAgo(700 - i * 8),
      updatedAt: daysAgo(8),
    };
  });

  // Customers + Contacts
  const customers: Row[] = [];
  const contacts: Row[] = [];
  companyNames.forEach((cn, i) => {
    const cid = id("cust", i + 1);
    customers.push({
      id: cid,
      companyName: cn,
      industry: pick(industries),
      website: `https://${slug(cn)}.com`,
      phone: `+1-${num(200, 999)}-${num(100, 999)}-${num(1000, 9999)}`,
      email: `contact@${slug(cn)}.com`,
      address: `${num(100, 9999)} Market St`,
      city: pick(cities),
      state: pick(states),
      zipCode: String(num(10000, 99999)),
      country: "USA",
      notes: null,
      createdAt: daysAgo(600 - i * 12),
      updatedAt: daysAgo(12),
    });
    const contactCount = num(1, 3);
    for (let j = 0; j < contactCount; j++) {
      const fn = pick(firstNames);
      const ln = pick(lastNames);
      contacts.push({
        id: id("contact", contacts.length + 1),
        customerId: cid,
        firstName: fn,
        lastName: ln,
        email: `${slug(fn)}.${slug(ln)}@${slug(cn)}.com`,
        phone: `+1-${num(200, 999)}-${num(100, 999)}-${num(1000, 9999)}`,
        jobTitle: pick(["CEO", "CTO", "Procurement Manager", "IT Director", "Operations Manager"]),
        isPrimary: j === 0,
        createdAt: daysAgo(580),
        updatedAt: daysAgo(20),
      });
    }
  });

  // Deals
  const salesReps = employees.slice(0, 12);
  const dealStages = ["LEAD", "QUALIFIED", "PROPOSAL", "NEGOTIATION", "CLOSED_WON", "CLOSED_LOST"];
  const dealPriorities = ["LOW", "MEDIUM", "HIGH", "URGENT"];
  const deals: Row[] = [];
  const dealActivities: Row[] = [];
  for (let i = 0; i < 50; i++) {
    const cust = pick(customers);
    const custContacts = contacts.filter((c) => c.customerId === cust.id);
    const stage = pick(dealStages);
    const did = id("deal", i + 1);
    deals.push({
      id: did,
      title: `${cust.companyName} - ${pick(["Software License", "Hardware Bundle", "Consulting", "Support Contract", "Implementation"])}`,
      description: "Strategic business opportunity in active pipeline.",
      customerId: cust.id,
      contactId: custContacts.length ? pick(custContacts).id : null,
      salesRepId: pick(salesReps).id,
      stage,
      priority: pick(dealPriorities),
      value: num(5000, 500000),
      probability: stage === "CLOSED_WON" ? 100 : stage === "CLOSED_LOST" ? 0 : num(10, 90),
      expectedCloseDate: daysAhead(num(5, 180)),
      actualCloseDate: stage.startsWith("CLOSED") ? daysAgo(num(1, 60)) : null,
      lostReason: stage === "CLOSED_LOST" ? pick(["Budget", "Competitor", "Timing", "No decision"]) : null,
      createdAt: daysAgo(num(30, 300)),
      updatedAt: daysAgo(num(1, 20)),
    });
    const actCount = num(1, 4);
    for (let j = 0; j < actCount; j++) {
      dealActivities.push({
        id: id("dact", dealActivities.length + 1),
        dealId: did,
        type: pick(["CALL", "EMAIL", "MEETING", "NOTE"]),
        subject: pick(["Intro call", "Sent proposal", "Demo session", "Follow-up", "Contract review"]),
        description: "Logged activity in the deal timeline.",
        date: daysAgo(num(1, 90)),
        createdAt: daysAgo(num(1, 90)),
      });
    }
  }

  // Invoices
  const invoiceStatuses = ["DRAFT", "SENT", "PAID", "OVERDUE", "CANCELLED"];
  const invoices: Row[] = [];
  const invoiceItems: Row[] = [];
  for (let i = 0; i < 100; i++) {
    const cust = pick(customers);
    const issue = dateBetween(daysAgo(210), daysAgo(5));
    const due = new Date(issue.getTime() + 30 * 86400000);
    const subtotal = money(1000, 50000);
    const taxRate = 8;
    const taxAmount = Math.round(subtotal * (taxRate / 100) * 100) / 100;
    const total = Math.round((subtotal + taxAmount) * 100) / 100;
    const status = pick(invoiceStatuses);
    const iid = id("inv", i + 1);
    invoices.push({
      id: iid,
      invoiceNumber: `INV-${String(i + 1).padStart(5, "0")}`,
      customerId: cust.id,
      status,
      issueDate: issue,
      dueDate: due,
      paidDate: status === "PAID" ? new Date(issue.getTime() + num(2, 28) * 86400000) : null,
      subtotal,
      taxRate,
      taxAmount,
      discount: 0,
      total,
      notes: null,
      createdAt: issue,
      updatedAt: daysAgo(num(1, 30)),
    });
    const lines = num(1, 4);
    for (let j = 0; j < lines; j++) {
      const qty = num(1, 10);
      const unit = money(100, 1500);
      invoiceItems.push({
        id: id("invi", invoiceItems.length + 1),
        invoiceId: iid,
        description: pick(["Professional Services", "License Subscription", "Implementation", "Support Retainer", "Hardware"]),
        quantity: qty,
        unitPrice: unit,
        total: Math.round(qty * unit * 100) / 100,
      });
    }
  }

  // Expenses
  const expenseCategories = ["TRAVEL", "MEALS", "SUPPLIES", "EQUIPMENT", "SOFTWARE", "MARKETING", "UTILITIES", "RENT", "OTHER"];
  const expenseStatuses = ["PENDING", "APPROVED", "REJECTED", "REIMBURSED"];
  const expenses: Row[] = [];
  for (let i = 0; i < 120; i++) {
    const emp = pick(employees);
    expenses.push({
      id: id("exp", i + 1),
      employeeId: emp.id,
      category: pick(expenseCategories),
      amount: money(20, 2200),
      description: pick(["Business lunch", "Travel expenses", "Office supplies", "Software subscription", "Client dinner", "Conference fee", "Equipment purchase", "Training materials"]),
      vendor: pick(["Amazon", "Staples", "Delta Airlines", "Hilton Hotels", "Uber", "WeWork"]),
      receiptUrl: null,
      expenseDate: dateBetween(daysAgo(180), daysAgo(1)),
      status: pick(expenseStatuses),
      approvedBy: null,
      approvedAt: null,
      notes: null,
      createdAt: daysAgo(num(1, 180)),
      updatedAt: daysAgo(num(1, 30)),
    });
  }

  // Purchase orders
  const poStatuses = ["DRAFT", "SUBMITTED", "APPROVED", "ORDERED", "RECEIVED", "CANCELLED"];
  const purchaseOrders: Row[] = [];
  const purchaseOrderItems: Row[] = [];
  for (let i = 0; i < 36; i++) {
    const sup = pick(suppliers);
    const order = dateBetween(daysAgo(200), daysAgo(2));
    let subtotal = 0;
    const poid = id("po", i + 1);
    const lines = num(2, 6);
    const tmp: Row[] = [];
    for (let j = 0; j < lines; j++) {
      const prod = pick(products);
      const qty = num(10, 100);
      const unit = prod.costPrice as number;
      const lineTotal = Math.round(qty * unit * 100) / 100;
      subtotal += lineTotal;
      tmp.push({
        id: id("poi", purchaseOrderItems.length + tmp.length + 1),
        purchaseOrderId: poid,
        productId: prod.id,
        quantity: qty,
        unitPrice: unit,
        total: lineTotal,
      });
    }
    purchaseOrderItems.push(...tmp);
    const tax = Math.round(subtotal * 0.08 * 100) / 100;
    const status = pick(poStatuses);
    purchaseOrders.push({
      id: poid,
      poNumber: `PO-${String(i + 1).padStart(5, "0")}`,
      supplierId: sup.id,
      status,
      orderDate: order,
      expectedDate: new Date(order.getTime() + 14 * 86400000),
      receivedDate: status === "RECEIVED" ? new Date(order.getTime() + 12 * 86400000) : null,
      subtotal: Math.round(subtotal * 100) / 100,
      tax,
      total: Math.round((subtotal + tax) * 100) / 100,
      notes: null,
      createdAt: order,
      updatedAt: daysAgo(num(1, 20)),
    });
  }

  // Stock movements
  const stockMovements: Row[] = [];
  for (let i = 0; i < 80; i++) {
    const prod = pick(products);
    const type = pick(["PURCHASE", "SALE", "ADJUSTMENT", "RETURN"]);
    stockMovements.push({
      id: id("mov", i + 1),
      productId: prod.id,
      quantity: type === "SALE" ? -num(1, 20) : num(1, 50),
      type,
      reference: pick(["PO-00012", "SALE-00231", "ADJ-0007", "RET-0003"]),
      notes: null,
      createdAt: dateBetween(daysAgo(120), now),
    });
  }

  // Projects + Tasks
  const projectNames = ["Website Redesign","Mobile App Development","ERP Implementation","Cloud Migration","Security Audit","Data Analytics Platform","Customer Portal","API Integration","Automation Initiative"];
  const projectStatuses = ["PLANNING", "ACTIVE", "ON_HOLD", "COMPLETED", "CANCELLED"];
  const taskStatuses = ["TODO", "IN_PROGRESS", "IN_REVIEW", "COMPLETED", "BLOCKED"];
  const taskPriorities = ["LOW", "MEDIUM", "HIGH", "URGENT"];
  const projects: Row[] = [];
  const tasks: Row[] = [];
  projectNames.forEach((pn, i) => {
    const dept = pick(departments);
    const status = i < 5 ? "ACTIVE" : pick(projectStatuses);
    const pid = id("proj", i + 1);
    projects.push({
      id: pid,
      name: pn,
      description: `${pn} initiative for improving business operations and efficiency.`,
      departmentId: dept.id,
      status,
      startDate: dateBetween(daysAgo(180), daysAgo(30)),
      endDate: daysAhead(num(30, 240)),
      budget: num(50000, 500000),
      createdAt: daysAgo(num(60, 200)),
      updatedAt: daysAgo(num(1, 20)),
    });
    const taskCount = num(6, 14);
    for (let j = 0; j < taskCount; j++) {
      tasks.push({
        id: id("task", tasks.length + 1),
        projectId: pid,
        title: `${pick(["Requirements gathering", "Design review", "Development sprint", "Testing phase", "Documentation", "Deployment", "Stakeholder meeting", "Code review", "Performance optimization"])} ${j + 1}`,
        description: "Task tracked on the project board.",
        status: pick(taskStatuses),
        priority: pick(taskPriorities),
        assigneeId: pick(users).id,
        creatorId: "demo-admin",
        dueDate: daysAhead(num(-10, 90)),
        estimatedHours: num(2, 40),
        actualHours: num(0, 38),
        parentId: null,
        position: j,
        createdAt: daysAgo(num(10, 120)),
        updatedAt: daysAgo(num(1, 15)),
      });
    }
  });

  // Leave requests
  const leaveTypes = ["ANNUAL", "SICK", "PERSONAL", "MATERNITY", "PATERNITY", "UNPAID"];
  const leaveStatuses = ["PENDING", "APPROVED", "REJECTED", "CANCELLED"];
  const leaveRequests: Row[] = [];
  for (let i = 0; i < 45; i++) {
    const emp = pick(employees);
    const start = daysAhead(num(-30, 90));
    const days = num(1, 10);
    leaveRequests.push({
      id: id("leave", i + 1),
      employeeId: emp.id,
      leaveType: pick(leaveTypes),
      startDate: start,
      endDate: new Date(start.getTime() + days * 86400000),
      days,
      reason: pick(["Family vacation", "Personal matters", "Medical appointment", "Wedding", "Relocation"]),
      status: pick(leaveStatuses),
      approverId: null,
      approvedAt: null,
      createdAt: daysAgo(num(1, 60)),
      updatedAt: daysAgo(num(1, 30)),
    });
  }

  // Attendance (recent)
  const attendanceStatuses = ["PRESENT", "PRESENT", "PRESENT", "LATE", "ABSENT", "HALF_DAY", "ON_LEAVE"];
  const attendance: Row[] = [];
  employees.slice(0, 30).forEach((emp, ei) => {
    for (let d = 0; d < 5; d++) {
      const day = daysAgo(d);
      attendance.push({
        id: id("att", attendance.length + 1),
        employeeId: emp.id,
        date: day,
        status: pick(attendanceStatuses),
        checkIn: new Date(day.setHours(9, num(0, 30), 0, 0)),
        checkOut: new Date(daysAgo(d).setHours(17, num(0, 45), 0, 0)),
        notes: null,
        createdAt: daysAgo(d),
        updatedAt: daysAgo(d),
      });
    }
  });

  // Payroll (latest period)
  const payrollRecords: Row[] = [];
  employees.forEach((emp, i) => {
    const base = (emp.salary as number) / 12;
    const bonus = i % 5 === 0 ? money(500, 4000) : 0;
    const deductions = Math.round(base * 0.05 * 100) / 100;
    const tax = Math.round(base * 0.22 * 100) / 100;
    payrollRecords.push({
      id: id("pay", i + 1),
      employeeId: emp.id,
      periodStart: daysAgo(30),
      periodEnd: daysAgo(1),
      baseSalary: Math.round(base * 100) / 100,
      bonus,
      deductions,
      taxWithheld: tax,
      netPay: Math.round((base + bonus - deductions - tax) * 100) / 100,
      paidAt: daysAgo(1),
      createdAt: daysAgo(2),
      updatedAt: daysAgo(1),
    });
  });

  // Notifications
  const notifTypes = ["INFO", "WARNING", "SUCCESS", "ERROR"];
  const notifications: Row[] = [];
  const notifSeed = [
    { title: "Invoice overdue", message: "INV-00042 from Quantum Dynamics is 6 days overdue.", type: "WARNING", link: "/finance/invoices" },
    { title: "Low stock alert", message: "Wireless Mouse dropped below its reorder point.", type: "WARNING", link: "/inventory/products" },
    { title: "Deal won", message: "TechFlow Solutions - Implementation moved to Closed Won.", type: "SUCCESS", link: "/crm/deals" },
    { title: "New leave request", message: "A pending leave request needs your review.", type: "INFO", link: "/hr/leave-requests" },
    { title: "Payroll processed", message: "Monthly payroll has been processed for 60 employees.", type: "SUCCESS", link: "/hr/payroll" },
    { title: "Purchase order received", message: "PO-00018 has been marked as received.", type: "INFO", link: "/inventory/orders" },
  ];
  notifSeed.forEach((n, i) => {
    notifications.push({
      id: id("notif", i + 1),
      userId: "demo-admin",
      title: n.title,
      message: n.message,
      type: n.type,
      link: n.link,
      isRead: i > 3,
      createdAt: daysAgo(i),
    });
  });
  void notifTypes;

  // Audit log
  const auditLogs: Row[] = [];
  for (let i = 0; i < 25; i++) {
    auditLogs.push({
      id: id("audit", i + 1),
      userId: "demo-admin",
      action: pick(["CREATE", "UPDATE", "DELETE", "USER_LOGIN", "AI_QUERY"]),
      entityType: pick(["Employee", "Product", "Invoice", "Deal", "Project"]),
      entityId: id("ent", num(1, 50)),
      oldValue: null,
      newValue: null,
      ipAddress: "127.0.0.1",
      userAgent: "Demo",
      createdAt: daysAgo(i),
    });
  }

  return {
    user: users,
    employee: employees,
    department: departments,
    supplier: suppliers,
    productCategory: categories,
    product: products,
    customer: customers,
    contact: contacts,
    deal: deals,
    dealActivity: dealActivities,
    invoice: invoices,
    invoiceItem: invoiceItems,
    expense: expenses,
    purchaseOrder: purchaseOrders,
    purchaseOrderItem: purchaseOrderItems,
    stockMovement: stockMovements,
    project: projects,
    task: tasks,
    leaveRequest: leaveRequests,
    attendance,
    payrollRecord: payrollRecords,
    notification: notifications,
    auditLog: auditLogs,
    // empty collections that may be queried
    contactDeals: [],
    communication: [],
    performanceReview: [],
    sale: [],
    saleItem: [],
    comment: [],
    timeLog: [],
    aIConversation: [],
    systemSetting: [],
    account: [],
    session: [],
    verificationToken: [],
  };
}

// Build once per server process and reuse.
let _data: DemoData | null = null;
export function getDemoData(): DemoData {
  if (!_data) _data = build();
  return _data;
}
