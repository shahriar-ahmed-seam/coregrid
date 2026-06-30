import "dotenv/config";
import { PrismaClient, UserRole, EmployeeStatus, DealStage, DealPriority, ExpenseCategory, ExpenseStatus, TaskStatus, TaskPriority, ProjectStatus, InvoiceStatus, PurchaseOrderStatus, LeaveType, LeaveStatus } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";
import { hash } from "bcryptjs";

const connectionString = process.env.DATABASE_URL;
const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

// ==========================================
// SEED DATA ARRAYS
// ==========================================

const firstNames = [
  "James", "Mary", "John", "Patricia", "Robert", "Jennifer", "Michael", "Linda",
  "William", "Elizabeth", "David", "Barbara", "Richard", "Susan", "Joseph", "Jessica",
  "Thomas", "Sarah", "Charles", "Karen", "Christopher", "Lisa", "Daniel", "Nancy",
  "Matthew", "Betty", "Anthony", "Margaret", "Mark", "Sandra", "Donald", "Ashley",
  "Steven", "Kimberly", "Paul", "Emily", "Andrew", "Donna", "Joshua", "Michelle",
  "Kenneth", "Dorothy", "Kevin", "Carol", "Brian", "Amanda", "George", "Melissa",
  "Timothy", "Deborah"
];

const lastNames = [
  "Smith", "Johnson", "Williams", "Brown", "Jones", "Garcia", "Miller", "Davis",
  "Rodriguez", "Martinez", "Hernandez", "Lopez", "Gonzalez", "Wilson", "Anderson",
  "Thomas", "Taylor", "Moore", "Jackson", "Martin", "Lee", "Perez", "Thompson",
  "White", "Harris", "Sanchez", "Clark", "Ramirez", "Lewis", "Robinson", "Walker",
  "Young", "Allen", "King", "Wright", "Scott", "Torres", "Nguyen", "Hill", "Flores"
];

const companyNames = [
  "TechFlow Solutions", "Quantum Dynamics Inc", "NexGen Systems", "CloudPeak Technologies",
  "DataSphere Analytics", "Innovate Labs", "Digital Frontier Corp", "CyberNet Solutions",
  "Phoenix Enterprises", "Atlas Global Services", "Vertex Industries", "Prism Technologies",
  "Horizon Software", "Apex Consulting", "Stellar Systems", "Fusion Tech Group",
  "Momentum Partners", "Catalyst Innovations", "Echo Digital", "Nova Computing"
];

const industries = [
  "Technology", "Healthcare", "Finance", "Manufacturing", "Retail", "Education",
  "Real Estate", "Energy", "Transportation", "Telecommunications", "Entertainment",
  "Construction", "Consulting", "Legal", "Marketing"
];

const productCategories = [
  { name: "Electronics", description: "Electronic devices and accessories" },
  { name: "Office Supplies", description: "Stationery and office equipment" },
  { name: "Computer Hardware", description: "Computers, peripherals and components" },
  { name: "Networking", description: "Network infrastructure and equipment" },
  { name: "Software Licenses", description: "Software and subscription licenses" },
  { name: "Furniture", description: "Office and workspace furniture" },
];

const products = [
  { name: "Wireless Mouse", sku: "ELEC-001", category: "Electronics", cost: 15.00, price: 29.99 },
  { name: "Mechanical Keyboard", sku: "ELEC-002", category: "Electronics", cost: 45.00, price: 89.99 },
  { name: "USB-C Hub", sku: "ELEC-003", category: "Electronics", cost: 25.00, price: 49.99 },
  { name: "Webcam HD 1080p", sku: "ELEC-004", category: "Electronics", cost: 35.00, price: 69.99 },
  { name: "Monitor Stand", sku: "ELEC-005", category: "Electronics", cost: 20.00, price: 44.99 },
  { name: "A4 Paper Ream (500)", sku: "OFFC-001", category: "Office Supplies", cost: 4.00, price: 8.99 },
  { name: "Ballpoint Pens (50 pack)", sku: "OFFC-002", category: "Office Supplies", cost: 8.00, price: 16.99 },
  { name: "Sticky Notes Assorted", sku: "OFFC-003", category: "Office Supplies", cost: 3.00, price: 7.99 },
  { name: "Binder Clips Large", sku: "OFFC-004", category: "Office Supplies", cost: 2.00, price: 5.99 },
  { name: "Desk Organizer", sku: "OFFC-005", category: "Office Supplies", cost: 12.00, price: 24.99 },
  { name: "Desktop PC i7", sku: "COMP-001", category: "Computer Hardware", cost: 650.00, price: 999.99 },
  { name: "Laptop 15.6\" Business", sku: "COMP-002", category: "Computer Hardware", cost: 550.00, price: 849.99 },
  { name: "27\" 4K Monitor", sku: "COMP-003", category: "Computer Hardware", cost: 280.00, price: 449.99 },
  { name: "External SSD 1TB", sku: "COMP-004", category: "Computer Hardware", cost: 70.00, price: 129.99 },
  { name: "RAM DDR5 32GB", sku: "COMP-005", category: "Computer Hardware", cost: 95.00, price: 159.99 },
  { name: "Ethernet Switch 24-Port", sku: "NETW-001", category: "Networking", cost: 180.00, price: 299.99 },
  { name: "WiFi 6 Router", sku: "NETW-002", category: "Networking", cost: 120.00, price: 199.99 },
  { name: "CAT6 Cable 100m", sku: "NETW-003", category: "Networking", cost: 45.00, price: 79.99 },
  { name: "Network Rack 42U", sku: "NETW-004", category: "Networking", cost: 350.00, price: 549.99 },
  { name: "PoE Injector", sku: "NETW-005", category: "Networking", cost: 25.00, price: 49.99 },
  { name: "Microsoft 365 Business", sku: "SOFT-001", category: "Software Licenses", cost: 150.00, price: 249.99 },
  { name: "Antivirus Suite 1yr", sku: "SOFT-002", category: "Software Licenses", cost: 35.00, price: 59.99 },
  { name: "Adobe Creative Cloud", sku: "SOFT-003", category: "Software Licenses", cost: 400.00, price: 599.99 },
  { name: "Project Management Tool", sku: "SOFT-004", category: "Software Licenses", cost: 80.00, price: 149.99 },
  { name: "CRM Software License", sku: "SOFT-005", category: "Software Licenses", cost: 200.00, price: 349.99 },
  { name: "Ergonomic Office Chair", sku: "FURN-001", category: "Furniture", cost: 180.00, price: 299.99 },
  { name: "Standing Desk Electric", sku: "FURN-002", category: "Furniture", cost: 350.00, price: 549.99 },
  { name: "Filing Cabinet 4-Drawer", sku: "FURN-003", category: "Furniture", cost: 120.00, price: 199.99 },
  { name: "Conference Table 8ft", sku: "FURN-004", category: "Furniture", cost: 450.00, price: 699.99 },
  { name: "Bookshelf Unit", sku: "FURN-005", category: "Furniture", cost: 85.00, price: 149.99 },
];

const suppliers = [
  { name: "Global Tech Distributors", email: "orders@globaltechdist.com", rating: 5 },
  { name: "Office Essentials Co", email: "sales@officeessentials.com", rating: 4 },
  { name: "Premier Hardware Supply", email: "info@premierhw.com", rating: 5 },
  { name: "NetWorks Plus", email: "orders@networksplus.com", rating: 4 },
  { name: "SoftLicense Direct", email: "enterprise@softlicensedirect.com", rating: 5 },
  { name: "FurniPro Business", email: "b2b@furnipro.com", rating: 4 },
];

const departments = [
  { name: "Engineering", budget: 500000 },
  { name: "Sales", budget: 300000 },
  { name: "Human Resources", budget: 150000 },
  { name: "Finance", budget: 200000 },
  { name: "Marketing", budget: 250000 },
  { name: "Operations", budget: 180000 },
  { name: "IT Support", budget: 220000 },
  { name: "Customer Success", budget: 160000 },
];

const jobTitles = [
  "Software Engineer", "Senior Developer", "Product Manager", "UX Designer",
  "Data Analyst", "DevOps Engineer", "QA Engineer", "Technical Lead",
  "Sales Representative", "Account Executive", "Sales Manager", "Business Analyst",
  "HR Specialist", "Recruiter", "HR Manager", "Training Coordinator",
  "Financial Analyst", "Accountant", "Controller", "CFO",
  "Marketing Specialist", "Content Writer", "SEO Specialist", "Marketing Manager",
  "IT Administrator", "Support Specialist", "Network Engineer", "Security Analyst"
];

const projectNames = [
  "Website Redesign", "Mobile App Development", "ERP Implementation",
  "Cloud Migration", "Security Audit", "Data Analytics Platform",
  "Customer Portal", "API Integration", "Automation Initiative"
];

// ==========================================
// HELPER FUNCTIONS
// ==========================================

function randomElement<T>(array: T[]): T {
  return array[Math.floor(Math.random() * array.length)];
}

function randomNumber(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function randomDate(start: Date, end: Date): Date {
  return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
}

function generateEmail(firstName: string, lastName: string): string {
  return `${firstName.toLowerCase()}.${lastName.toLowerCase()}@coregrid.com`;
}

function generatePhoneNumber(): string {
  return `+1-${randomNumber(200, 999)}-${randomNumber(100, 999)}-${randomNumber(1000, 9999)}`;
}

// ==========================================
// MAIN SEED FUNCTION
// ==========================================

async function main() {
  console.log("🌱 Starting database seeding...\n");

  // Clear existing data in reverse order of dependencies
  console.log("🗑️  Clearing existing data...");
  await prisma.aIConversation.deleteMany();
  await prisma.auditLog.deleteMany();
  await prisma.notification.deleteMany();
  await prisma.comment.deleteMany();
  await prisma.timeLog.deleteMany();
  await prisma.task.deleteMany();
  await prisma.project.deleteMany();
  await prisma.saleItem.deleteMany();
  await prisma.sale.deleteMany();
  await prisma.expense.deleteMany();
  await prisma.invoiceItem.deleteMany();
  await prisma.invoice.deleteMany();
  await prisma.stockMovement.deleteMany();
  await prisma.purchaseOrderItem.deleteMany();
  await prisma.purchaseOrder.deleteMany();
  await prisma.product.deleteMany();
  await prisma.productCategory.deleteMany();
  await prisma.supplier.deleteMany();
  await prisma.communication.deleteMany();
  await prisma.dealActivity.deleteMany();
  await prisma.deal.deleteMany();
  await prisma.contact.deleteMany();
  await prisma.customer.deleteMany();
  await prisma.payrollRecord.deleteMany();
  await prisma.performanceReview.deleteMany();
  await prisma.leaveRequest.deleteMany();
  await prisma.employee.deleteMany();
  await prisma.department.deleteMany();
  await prisma.session.deleteMany();
  await prisma.account.deleteMany();
  await prisma.user.deleteMany();

  // ==========================================
  // 1. CREATE USERS
  // ==========================================
  console.log("\n👤 Creating users...");
  
  const passwordHash = await hash("password123", 12);
  
  // Create admin user
  const adminUser = await prisma.user.create({
    data: {
      email: "admin@coregrid.com",
      name: "System Administrator",
      passwordHash,
      role: UserRole.ADMIN,
    },
  });
  console.log(`   ✓ Admin: admin@coregrid.com`);

  // Create role-specific users
  const roleUsers = await Promise.all([
    prisma.user.create({
      data: {
        email: "hr@coregrid.com",
        name: "Sarah Johnson",
        passwordHash,
        role: UserRole.HR,
      },
    }),
    prisma.user.create({
      data: {
        email: "sales@coregrid.com",
        name: "Mike Williams",
        passwordHash,
        role: UserRole.SALES,
      },
    }),
    prisma.user.create({
      data: {
        email: "inventory@coregrid.com",
        name: "Emily Davis",
        passwordHash,
        role: UserRole.INVENTORY,
      },
    }),
    prisma.user.create({
      data: {
        email: "finance@coregrid.com",
        name: "Robert Chen",
        passwordHash,
        role: UserRole.FINANCE,
      },
    }),
    prisma.user.create({
      data: {
        email: "pm@coregrid.com",
        name: "Alex Thompson",
        passwordHash,
        role: UserRole.PROJECT_MANAGER,
      },
    }),
  ]);
  console.log(`   ✓ Created ${roleUsers.length} role-specific users`);

  // Create employee users
  const employeeUsers: any[] = [];
  for (let i = 0; i < 50; i++) {
    const firstName = randomElement(firstNames);
    const lastName = randomElement(lastNames);
    const user = await prisma.user.create({
      data: {
        email: `${firstName.toLowerCase()}.${lastName.toLowerCase()}${i}@coregrid.com`,
        name: `${firstName} ${lastName}`,
        passwordHash,
        role: UserRole.EMPLOYEE,
      },
    });
    employeeUsers.push(user);
  }
  console.log(`   ✓ Created ${employeeUsers.length} employee users`);

  // ==========================================
  // 2. CREATE DEPARTMENTS
  // ==========================================
  console.log("\n🏢 Creating departments...");
  
  const createdDepartments = await Promise.all(
    departments.map((dept) =>
      prisma.department.create({
        data: {
          name: dept.name,
          code: dept.name.substring(0, 3).toUpperCase(),
          description: `${dept.name} department`,
          budget: dept.budget,
        },
      })
    )
  );
  console.log(`   ✓ Created ${createdDepartments.length} departments`);

  // ==========================================
  // 3. CREATE EMPLOYEES
  // ==========================================
  console.log("\n👥 Creating employees...");

  const allUsers = [adminUser, ...roleUsers, ...employeeUsers];
  const createdEmployees: any[] = [];
  
  for (let i = 0; i < allUsers.length; i++) {
    const user = allUsers[i];
    const department = randomElement(createdDepartments);
    const nameParts = user.name?.split(" ") || ["John", "Doe"];
    
    const employee = await prisma.employee.create({
      data: {
        employeeId: `EMP-${String(i + 1).padStart(4, "0")}`,
        userId: user.id,
        firstName: nameParts[0],
        lastName: nameParts[1] || "Unknown",
        email: user.email,
        gender: randomElement(["MALE", "FEMALE", "OTHER"]),
        phone: generatePhoneNumber(),
        position: randomElement(jobTitles),
        salary: randomNumber(45000, 150000),
        employmentType: randomElement(["FULL_TIME", "PART_TIME", "CONTRACT"]),
        status: EmployeeStatus.ACTIVE,
        departmentId: department.id,
        hireDate: randomDate(new Date(2020, 0, 1), new Date(2025, 11, 31)),
        city: randomElement(["New York", "San Francisco", "Chicago", "Austin", "Seattle", "Boston"]),
        state: randomElement(["NY", "CA", "IL", "TX", "WA", "MA"]),
        country: "USA",
      },
    });
    createdEmployees.push(employee);
  }
  console.log(`   ✓ Created ${createdEmployees.length} employees`);

  // ==========================================
  // 4. CREATE SUPPLIERS
  // ==========================================
  console.log("\n📦 Creating suppliers...");
  
  const createdSuppliers = await Promise.all(
    suppliers.map((supplier) =>
      prisma.supplier.create({
        data: {
          name: supplier.name,
          contactName: `${randomElement(firstNames)} ${randomElement(lastNames)}`,
          email: supplier.email,
          phone: generatePhoneNumber(),
          rating: supplier.rating,
          city: randomElement(["Los Angeles", "Dallas", "Miami", "Denver", "Portland"]),
          country: "USA",
        },
      })
    )
  );
  console.log(`   ✓ Created ${createdSuppliers.length} suppliers`);

  // ==========================================
  // 5. CREATE PRODUCT CATEGORIES
  // ==========================================
  console.log("\n📂 Creating product categories...");
  
  const createdCategories: Record<string, any> = {};
  for (const cat of productCategories) {
    const category = await prisma.productCategory.create({
      data: {
        name: cat.name,
        description: cat.description,
      },
    });
    createdCategories[cat.name] = category;
  }
  console.log(`   ✓ Created ${Object.keys(createdCategories).length} categories`);

  // ==========================================
  // 6. CREATE PRODUCTS
  // ==========================================
  console.log("\n🛍️  Creating products...");
  
  const createdProducts: any[] = [];
  for (const product of products) {
    const category = createdCategories[product.category];
    const supplier = randomElement(createdSuppliers);
    
    const created = await prisma.product.create({
      data: {
        sku: product.sku,
        name: product.name,
        description: `High quality ${product.name.toLowerCase()}`,
        categoryId: category.id,
        supplierId: supplier.id,
        costPrice: product.cost,
        sellingPrice: product.price,
        stockLevel: randomNumber(5, 200),
        reorderPoint: randomNumber(10, 30),
        reorderQty: randomNumber(20, 100),
        unit: "pcs",
        isActive: true,
      },
    });
    createdProducts.push(created);
  }
  console.log(`   ✓ Created ${createdProducts.length} products`);

  // ==========================================
  // 7. CREATE CUSTOMERS
  // ==========================================
  console.log("\n🏪 Creating customers...");
  
  const createdCustomers: any[] = [];
  for (const companyName of companyNames) {
    const customer = await prisma.customer.create({
      data: {
        companyName,
        industry: randomElement(industries),
        website: `https://${companyName.toLowerCase().replace(/\s+/g, "")}.com`,
        email: `contact@${companyName.toLowerCase().replace(/\s+/g, "")}.com`,
        phone: generatePhoneNumber(),
        city: randomElement(["New York", "Los Angeles", "Chicago", "Houston", "Phoenix"]),
        state: randomElement(["NY", "CA", "IL", "TX", "AZ"]),
        country: "USA",
      },
    });
    createdCustomers.push(customer);
    
    // Create 1-3 contacts per customer
    const contactCount = randomNumber(1, 3);
    for (let j = 0; j < contactCount; j++) {
      const firstName = randomElement(firstNames);
      const lastName = randomElement(lastNames);
      await prisma.contact.create({
        data: {
          customerId: customer.id,
          firstName,
          lastName,
          email: `${firstName.toLowerCase()}.${lastName.toLowerCase()}@${companyName.toLowerCase().replace(/\s+/g, "")}.com`,
          phone: generatePhoneNumber(),
          jobTitle: randomElement(["CEO", "CTO", "Procurement Manager", "IT Director", "Operations Manager"]),
          isPrimary: j === 0,
        },
      });
    }
  }
  console.log(`   ✓ Created ${createdCustomers.length} customers with contacts`);

  // ==========================================
  // 8. CREATE DEALS
  // ==========================================
  console.log("\n💼 Creating deals...");
  
  const salesEmployees = createdEmployees.filter((_, i) => i < 10);
  const stages = Object.values(DealStage);
  const priorities = Object.values(DealPriority);
  
  const createdDeals: any[] = [];
  for (let i = 0; i < 50; i++) {
    const customer = randomElement(createdCustomers);
    const deal = await prisma.deal.create({
      data: {
        title: `${customer.companyName} - ${randomElement(["Software License", "Hardware Bundle", "Consulting", "Support Contract", "Implementation"])}`,
        description: "Business opportunity",
        customerId: customer.id,
        salesRepId: randomElement(salesEmployees).id,
        stage: randomElement(stages),
        priority: randomElement(priorities),
        value: randomNumber(5000, 500000),
        probability: randomNumber(10, 90),
        expectedCloseDate: randomDate(new Date(2026, 0, 1), new Date(2026, 11, 31)),
      },
    });
    createdDeals.push(deal);
  }
  console.log(`   ✓ Created ${createdDeals.length} deals`);

  // ==========================================
  // 9. CREATE SALES
  // ==========================================
  console.log("\n💵 Creating sales history...");
  
  const createdSales: any[] = [];
  for (let i = 0; i < 200; i++) {
    const saleDate = randomDate(new Date(2025, 0, 1), new Date(2026, 0, 25));
    const itemCount = randomNumber(1, 5);
    let subtotal = 0;
    
    const saleItems: any[] = [];
    for (let j = 0; j < itemCount; j++) {
      const product = randomElement(createdProducts);
      const quantity = randomNumber(1, 10);
      const itemTotal = Number(product.sellingPrice) * quantity;
      subtotal += itemTotal;
      saleItems.push({
        productId: product.id,
        quantity,
        unitPrice: product.sellingPrice,
        total: itemTotal,
      });
    }
    
    const taxAmount = subtotal * 0.08;
    const total = subtotal + taxAmount;
    
    const sale = await prisma.sale.create({
      data: {
        saleNumber: `SALE-${String(i + 1).padStart(5, "0")}`,
        saleDate,
        subtotal,
        taxAmount,
        total,
        items: {
          create: saleItems,
        },
      },
    });
    createdSales.push(sale);
  }
  console.log(`   ✓ Created ${createdSales.length} sales records`);

  // ==========================================
  // 10. CREATE INVOICES
  // ==========================================
  console.log("\n📄 Creating invoices...");
  
  const invoiceStatuses = Object.values(InvoiceStatus);
  for (let i = 0; i < 100; i++) {
    const customer = randomElement(createdCustomers);
    const issueDate = randomDate(new Date(2025, 0, 1), new Date(2026, 0, 25));
    const dueDate = new Date(issueDate);
    dueDate.setDate(dueDate.getDate() + 30);
    
    const subtotal = randomNumber(1000, 50000);
    const taxRate = 8;
    const taxAmount = subtotal * (taxRate / 100);
    const total = subtotal + taxAmount;
    
    await prisma.invoice.create({
      data: {
        invoiceNumber: `INV-${String(i + 1).padStart(5, "0")}`,
        customerId: customer.id,
        status: randomElement(invoiceStatuses),
        issueDate,
        dueDate,
        subtotal,
        taxRate,
        taxAmount,
        total,
        items: {
          create: [
            {
              description: "Professional Services",
              quantity: randomNumber(1, 10),
              unitPrice: randomNumber(100, 1000),
              total: subtotal,
            },
          ],
        },
      },
    });
  }
  console.log(`   ✓ Created 100 invoices`);

  // ==========================================
  // 11. CREATE EXPENSES
  // ==========================================
  console.log("\n💳 Creating expenses...");
  
  const expenseCategories = Object.values(ExpenseCategory);
  const expenseStatuses = Object.values(ExpenseStatus);
  
  for (let i = 0; i < 150; i++) {
    const employee = randomElement(createdEmployees);
    await prisma.expense.create({
      data: {
        employeeId: employee.id,
        category: randomElement(expenseCategories),
        amount: randomNumber(20, 2000),
        description: randomElement([
          "Business lunch", "Travel expenses", "Office supplies",
          "Software subscription", "Client dinner", "Conference fee",
          "Equipment purchase", "Training materials"
        ]),
        vendor: randomElement(["Amazon", "Staples", "Delta Airlines", "Hilton Hotels", "Uber", "WeWork"]),
        expenseDate: randomDate(new Date(2025, 0, 1), new Date(2026, 0, 25)),
        status: randomElement(expenseStatuses),
      },
    });
  }
  console.log(`   ✓ Created 150 expenses`);

  // ==========================================
  // 12. CREATE PROJECTS & TASKS
  // ==========================================
  console.log("\n📊 Creating projects and tasks...");
  
  const projectStatuses = Object.values(ProjectStatus);
  const taskStatuses = Object.values(TaskStatus);
  const taskPriorities = Object.values(TaskPriority);
  
  for (const projectName of projectNames) {
    const department = randomElement(createdDepartments);
    const project = await prisma.project.create({
      data: {
        name: projectName,
        description: `${projectName} initiative for improving business operations`,
        departmentId: department.id,
        status: randomElement(projectStatuses),
        startDate: randomDate(new Date(2025, 6, 1), new Date(2025, 11, 31)),
        endDate: randomDate(new Date(2026, 3, 1), new Date(2026, 11, 31)),
        budget: randomNumber(50000, 500000),
      },
    });
    
    // Create 5-15 tasks per project
    const taskCount = randomNumber(5, 15);
    for (let j = 0; j < taskCount; j++) {
      await prisma.task.create({
        data: {
          projectId: project.id,
          title: randomElement([
            "Requirements gathering", "Design review", "Development sprint",
            "Testing phase", "Documentation", "Deployment", "Training session",
            "Stakeholder meeting", "Code review", "Performance optimization"
          ]) + ` ${j + 1}`,
          description: "Task description",
          status: randomElement(taskStatuses),
          priority: randomElement(taskPriorities),
          assigneeId: randomElement(allUsers).id,
          creatorId: adminUser.id,
          dueDate: randomDate(new Date(2026, 0, 1), new Date(2026, 6, 30)),
          estimatedHours: randomNumber(2, 40),
          position: j,
        },
      });
    }
  }
  console.log(`   ✓ Created ${projectNames.length} projects with tasks`);

  // ==========================================
  // 13. CREATE LEAVE REQUESTS
  // ==========================================
  console.log("\n🏖️  Creating leave requests...");
  
  const leaveTypes = Object.values(LeaveType);
  const leaveStatuses = Object.values(LeaveStatus);
  
  for (let i = 0; i < 50; i++) {
    const employee = randomElement(createdEmployees);
    const startDate = randomDate(new Date(2026, 0, 1), new Date(2026, 11, 31));
    const endDate = new Date(startDate);
    endDate.setDate(endDate.getDate() + randomNumber(1, 10));
    
    await prisma.leaveRequest.create({
      data: {
        employeeId: employee.id,
        leaveType: randomElement(leaveTypes),
        startDate,
        endDate,
        days: randomNumber(1, 10),
        reason: randomElement(["Family vacation", "Personal matters", "Medical appointment", "Wedding", "Moving"]),
        status: randomElement(leaveStatuses),
      },
    });
  }
  console.log(`   ✓ Created 50 leave requests`);

  // ==========================================
  // 14. CREATE PURCHASE ORDERS
  // ==========================================
  console.log("\n📋 Creating purchase orders...");
  
  const poStatuses = Object.values(PurchaseOrderStatus);
  
  for (let i = 0; i < 30; i++) {
    const supplier = randomElement(createdSuppliers);
    const itemCount = randomNumber(2, 6);
    let subtotal = 0;
    
    const poItems: any[] = [];
    for (let j = 0; j < itemCount; j++) {
      const product = randomElement(createdProducts);
      const quantity = randomNumber(10, 100);
      const itemTotal = Number(product.costPrice) * quantity;
      subtotal += itemTotal;
      poItems.push({
        productId: product.id,
        quantity,
        unitPrice: product.costPrice,
        total: itemTotal,
      });
    }
    
    const tax = subtotal * 0.08;
    const total = subtotal + tax;
    
    await prisma.purchaseOrder.create({
      data: {
        poNumber: `PO-${String(i + 1).padStart(5, "0")}`,
        supplierId: supplier.id,
        status: randomElement(poStatuses),
        orderDate: randomDate(new Date(2025, 6, 1), new Date(2026, 0, 25)),
        subtotal,
        tax,
        total,
        items: {
          create: poItems,
        },
      },
    });
  }
  console.log(`   ✓ Created 30 purchase orders`);

  // ==========================================
  // SUMMARY
  // ==========================================
  console.log("\n✅ Database seeding completed successfully!\n");
  console.log("📊 Summary:");
  console.log(`   • Users: ${allUsers.length}`);
  console.log(`   • Departments: ${createdDepartments.length}`);
  console.log(`   • Employees: ${createdEmployees.length}`);
  console.log(`   • Suppliers: ${createdSuppliers.length}`);
  console.log(`   • Products: ${createdProducts.length}`);
  console.log(`   • Customers: ${createdCustomers.length}`);
  console.log(`   • Deals: ${createdDeals.length}`);
  console.log(`   • Sales: ${createdSales.length}`);
  console.log(`   • Invoices: 100`);
  console.log(`   • Expenses: 150`);
  console.log(`   • Projects: ${projectNames.length}`);
  console.log(`   • Leave Requests: 50`);
  console.log(`   • Purchase Orders: 30`);
  console.log("\n🔑 Login Credentials:");
  console.log("   Email: admin@coregrid.com");
  console.log("   Password: password123");
  console.log("\n   (All users have password: password123)\n");
}

main()
  .catch((e) => {
    console.error("❌ Seeding failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
