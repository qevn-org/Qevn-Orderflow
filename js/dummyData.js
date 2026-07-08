// ==================== DUMMY DATA GENERATOR ====================

const DummyDataGenerator = (() => {
  // Mock Base Arrays
  const firstNames = ["James", "John", "Robert", "Michael", "William", "David", "Richard", "Joseph", "Thomas", "Charles", "Patricia", "Jennifer", "Linda", "Elizabeth", "Barbara", "Susan", "Jessica", "Sarah", "Karen", "Nancy"];
  const lastNames = ["Smith", "Johnson", "Williams", "Brown", "Jones", "Miller", "Davis", "Garcia", "Rodriguez", "Wilson", "Martinez", "Anderson", "Taylor", "Thomas", "Hernandez", "Moore", "Martin", "Jackson", "Thompson", "White"];
  
  const companyPrefixes = ["Apex", "Vortex", "Matrix", "Nexa", "Zenith", "Quantum", "Alpha", "Omega", "Helix", "Solis", "Titan", "Nova", "Aero", "Pulse", "Terra", "Stellar", "Core", "Flux", "Vector", "Optima"];
  const companySuffixes = ["Industries", "Technologies", "Controls", "Manufacturing", "Systems", "Solutions", "Automations", "Electronics", "Logistics", "Enterprises", "Dynamics", "Engineering", "Robotics", "Synthetics"];
  
  const productBases = [
    { name: "Direct Drive Motor", skuPref: "MC-DD", category: "Motors", basePrice: 250, image: "cpu" },
    { name: "High Torque Gearbox", skuPref: "GB-HT", category: "Gears", basePrice: 180, image: "settings" },
    { name: "Programmable PLC Unit", skuPref: "LC-PR", category: "Controllers", basePrice: 420, image: "box" },
    { name: "Precision Servo Actuator", skuPref: "AC-PS", category: "Controllers", basePrice: 310, image: "cpu" },
    { name: "Heavy Duty Shaft Axis", skuPref: "AX-HD", category: "Mechanical Parts", basePrice: 95, image: "settings" },
    { name: "Pneumatic Cylindrical Valve", skuPref: "VL-PN", category: "Mechanical Parts", basePrice: 65, image: "box" },
    { name: "Copper Coil Raw Spool", skuPref: "RM-CC", category: "Raw Materials", basePrice: 45, image: "layers" },
    { name: "Aluminum Casting Housing", skuPref: "RM-AC", category: "Raw Materials", basePrice: 35, image: "layers" }
  ];

  const cities = ["Mumbai", "Bengaluru", "Pune", "Chennai", "Delhi", "Hyderabad", "Ahmedabad", "Kolkata", "Surat", "Vadodara"];
  
  const courierNames = ["DHL Express", "FedEx SupplyChain", "BlueDart", "Delhivery Logistics", "ExpressFreight", "UPS Enterprise"];

  // Helper Random Functions
  const randomElem = (arr) => arr[Math.floor(Math.random() * arr.length)];
  const randomRange = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;
  const randomDate = (start, end) => {
    return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
  };

  // 1. GENERATE SALESPEOPLE (20)
  const generateSalespersons = () => {
    const list = [];
    for (let i = 1; i <= 20; i++) {
      const first = randomElem(firstNames);
      const last = randomElem(lastNames);
      const target = randomRange(30000, 100000);
      const sales = Math.round(target * (randomRange(60, 130) / 100));
      
      list.push({
        id: `sales-${i}`,
        name: `${first} ${last}`,
        email: `${first.toLowerCase()}.${last.toLowerCase()}@qevn.in`,
        monthlySales: sales,
        monthlyTarget: target,
        todayVisits: randomRange(1, 8),
        assignedCustomersCount: randomRange(5, 15),
        targetAchievement: Math.round((sales / target) * 100),
        commission: Math.round(sales * 0.04), // 4% commission
        attendance: Math.random() > 0.08 ? "Present" : "Absent",
        gpsStatus: Math.random() > 0.15 ? "Active" : "Inactive"
      });
    }
    return list;
  };

  // 2. GENERATE CUSTOMERS (100)
  const generateCustomers = () => {
    const list = [];
    const createdNames = new Set();
    
    for (let i = 1; i <= 100; i++) {
      let companyName = "";
      do {
        companyName = `${randomElem(companyPrefixes)} ${randomElem(companySuffixes)}`;
      } while (createdNames.has(companyName));
      createdNames.add(companyName);

      const city = randomElem(cities);
      const first = randomElem(firstNames);
      const last = randomElem(lastNames);
      const limit = randomElem([20000, 50000, 100000, 150000, 200000]);

      list.push({
        id: `cust-${i}`,
        name: companyName,
        contactPerson: `${first} ${last}`,
        email: `info@${companyName.toLowerCase().replace(/[^a-z0-9]/g, "")}.com`,
        gstNumber: `27${companyPrefixes[i % companyPrefixes.length].toUpperCase().padEnd(5, 'A')}${randomRange(1000, 9999)}A1Z${randomRange(1, 9)}`,
        creditLimit: limit,
        outstandingAmount: 0, // Will be calculated after orders
        address: `${randomRange(101, 999)}, Industrial Phase ${randomRange(1, 4)}, near Tech Park, ${city}, Pin - ${randomRange(400001, 411060)}`,
        history: [],
        timeline: [
          { date: new Date(2026, 0, randomRange(1, 28)).toISOString(), action: "Onboarded as Approved Partner" },
          { date: new Date(2026, 1, randomRange(1, 28)).toISOString(), action: "Credit line approved at " + limit.toLocaleString("en-US", { style: "currency", currency: "USD" }) }
        ]
      });
    }
    return list;
  };

  // 3. GENERATE PRODUCTS (50)
  const generateProducts = () => {
    const list = [];
    let prodCounter = 1;

    productBases.forEach(base => {
      // Create variants to make 50 products
      const variants = base.category === "Raw Materials" ? 
        ["Grade-A", "Premium-Mix", "Eco-Grade"] : 
        ["Standard", "Pro-Edition", "Ultra-Duty", "Compact-Size", "High-Voltage"];

      variants.forEach(variant => {
        if (prodCounter > 50) return;
        const name = `${base.name} (${variant})`;
        const price = Math.round(base.basePrice * (variant.includes("Ultra") || variant.includes("Pro") ? 1.4 : (variant.includes("Compact") ? 0.85 : 1)));
        const stock = randomRange(5, 450);
        
        list.push({
          id: `prod-${prodCounter}`,
          name: name,
          sku: `${base.skuPref}-${variant.substring(0, 3).toUpperCase()}-${randomRange(10, 99)}`,
          category: base.category,
          price: price,
          stock: stock,
          reservedStock: Math.round(stock * (randomRange(5, 20) / 100)),
          minStock: randomRange(15, 60),
          variants: [variant],
          specifications: {
            "Weight": `${randomRange(5, 50)} kg`,
            "Material": base.category === "Raw Materials" ? "Processed Composite" : "Diecast Aluminum & Iron",
            "Certifications": "CE, RoHS Compliant",
            "Warranty": base.category === "Raw Materials" ? "N/A" : "24 Months"
          },
          image: base.image
        });
        prodCounter++;
      });
    });

    // Fill remaining products to reach 50
    while (prodCounter <= 50) {
      const base = randomElem(productBases);
      const name = `${base.name} (Custom Spec-${randomRange(100, 999)})`;
      const price = Math.round(base.basePrice * 1.25);
      const stock = randomRange(10, 120);

      list.push({
        id: `prod-${prodCounter}`,
        name: name,
        sku: `${base.skuPref}-CUST-${prodCounter}`,
        category: base.category,
        price: price,
        stock: stock,
        reservedStock: 0,
        minStock: 20,
        variants: ["Custom"],
        specifications: { "Weight": "Variable", "Material": "Alloy Block" },
        image: base.image
      });
      prodCounter++;
    }

    return list;
  };

  // 4. GENERATE WAREHOUSES (5)
  const generateWarehouses = () => {
    const names = [
      { name: "Central Assembly Depot A", location: "Pune" },
      { name: "Northern Logistics Hub B", location: "Delhi" },
      { name: "Western Storage Bay C", location: "Mumbai" },
      { name: "Southern Shipping Port D", location: "Chennai" },
      { name: "Eastern Raw Depot E", location: "Kolkata" }
    ];
    return names.map((item, index) => ({
      id: `wh-${index + 1}`,
      name: item.name,
      location: item.location,
      capacity: 10000 + (index * 2000),
      utilization: randomRange(45, 92),
      rackCount: 30 + (index * 5)
    }));
  };

  // 5. GENERATE MACHINES (10) & WORKERS (15)
  const generateManufacturingEquipment = () => {
    const machineNames = [
      "CNC Mill Alpha", "Laser Cutter Beta", "Welding Assembly Gamma", 
      "Injection Molder Delta", "SMT Placement Epsilon", "Punch Press Zeta", 
      "Drill Press Eta", "Lathe System Theta", "Packaging Module Iota", "QC Inspection Station Kappa"
    ];

    const machines = machineNames.map((name, index) => ({
      id: `mach-${index + 1}`,
      name: name,
      status: randomElem(["Idle", "Running", "Running", "Maintenance", "Offline"]),
      efficiency: randomRange(78, 98),
      operatorId: null
    }));

    const workerNames = [
      "David Miller", "Sara Connor", "John Doe", "Robert Chen", "Elena Rostova", 
      "Marcus Aurelius", "Aisha Rahman", "Carlos Santana", "Yuki Tanaka", "Kofi Annan",
      "Liam Neeson", "Emma Watson", "Bruce Wayne", "Clark Kent", "Diana Prince"
    ];

    const roles = ["Machine Operator", "Machine Operator", "Assembly Tech", "Assembly Tech", "Quality Inspector", "Supervisor"];

    const workers = workerNames.map((name, index) => ({
      id: `wrk-${index + 1}`,
      name: name,
      role: roles[index % roles.length],
      status: randomElem(["Available", "On Shift", "On Shift", "On Leave"]),
      efficiencyRating: randomRange(82, 97)
    }));

    // Bind working machines with operators
    machines.forEach(m => {
      if (m.status === "Running") {
        const availableOp = workers.find(w => w.status === "On Shift" && !workers.some(worker => machines.some(mac => mac.operatorId === worker.id && mac.id !== m.id)));
        if (availableOp) {
          m.operatorId = availableOp.id;
        }
      }
    });

    return { machines, workers };
  };

  // 6. GENERATE INTERCONNECTED ORDERS (200) & INVOICES (100)
  const generateOrdersAndInvoices = (customers, products, salespersons, warehouses) => {
    const orders = [];
    const invoices = [];
    
    const startDate = new Date(2026, 2, 1); // March 1, 2026
    const endDate = new Date(2026, 6, 8);   // July 8, 2026 (current mock date)
    
    // Status distributions
    const statuses = [
      "Pending", "Approved", "Processing", "Quality Check", 
      "Ready to Ship", "Dispatched", "Cancelled"
    ];

    for (let i = 1; i <= 200; i++) {
      const orderId = `ORD-2026-${String(i).padStart(4, '0')}`;
      const customer = randomElem(customers);
      const salesperson = randomElem(salespersons);
      const orderDate = randomDate(startDate, endDate);
      
      // Determine items in order (1 to 4 products)
      const itemCount = randomRange(1, 4);
      const orderProducts = [];
      let subtotal = 0;
      
      const usedProducts = new Set();
      for (let j = 0; j < itemCount; j++) {
        let product;
        do {
          product = randomElem(products);
        } while (usedProducts.has(product.id));
        usedProducts.add(product.id);

        const quantity = randomRange(2, 15);
        const unitPrice = product.price;
        const discountPercent = randomElem([0, 0, 0, 5, 10]); // 3/5 chance of 0% discount
        const discountVal = Math.round(unitPrice * quantity * (discountPercent / 100));
        const itemSubtotal = (unitPrice * quantity) - discountVal;
        const gstVal = Math.round(itemSubtotal * 0.18);
        const itemTotal = itemSubtotal + gstVal;

        orderProducts.push({
          productId: product.id,
          name: product.name,
          sku: product.sku,
          quantity: quantity,
          unitPrice: unitPrice,
          discount: discountVal,
          gstRate: 18,
          total: itemTotal,
          warehouseId: randomElem(warehouses).id
        });

        subtotal += (unitPrice * quantity);
      }

      const discountTotal = orderProducts.reduce((sum, item) => sum + item.discount, 0);
      const gstTotal = Math.round((subtotal - discountTotal) * 0.18);
      const grandTotal = (subtotal - discountTotal) + gstTotal;

      // Assign Status based on creation date: older orders are completed, newer might be pending
      let status = "Dispatched";
      const daysDiff = (endDate.getTime() - orderDate.getTime()) / (1000 * 3600 * 24);
      
      if (daysDiff < 4) {
        status = randomElem(["Pending", "Approved", "Processing"]);
      } else if (daysDiff < 10) {
        status = randomElem(["Quality Check", "Ready to Ship", "Dispatched"]);
      } else if (daysDiff < 15) {
        status = randomElem(["Dispatched", "Cancelled"]);
      }

      const priority = randomElem(["Low", "Medium", "Medium", "High"]);
      
      // Payment statuses linked to order status
      let paymentStatus = "Unpaid";
      if (status === "Dispatched") {
        paymentStatus = randomElem(["Paid", "Paid", "Paid", "Partially Paid"]);
      } else if (status === "Ready to Ship" || status === "Quality Check") {
        paymentStatus = randomElem(["Paid", "Partially Paid", "Unpaid"]);
      }

      let invoiceStatus = status === "Pending" ? "Pending" : "Generated";

      // Expected delivery
      const expectedDelivery = new Date(orderDate.getTime());
      expectedDelivery.setDate(expectedDelivery.getDate() + randomRange(6, 12));

      const order = {
        id: orderId,
        customerId: customer.id,
        customerName: customer.name,
        salespersonId: salesperson.id,
        salespersonName: salesperson.name,
        products: orderProducts,
        subtotal: subtotal,
        discountTotal: discountTotal,
        gstTotal: gstTotal,
        grandTotal: grandTotal,
        status: status,
        priority: priority,
        paymentStatus: paymentStatus,
        invoiceStatus: invoiceStatus,
        createdDate: orderDate.toISOString(),
        expectedDelivery: expectedDelivery.toISOString()
      };

      orders.push(order);
      
      // Update customer timeline & history list
      customer.history.push(orderId);
      if (daysDiff < 10) {
        customer.timeline.unshift({
          date: orderDate.toISOString(),
          action: `Placed Order ${orderId} totaling $${grandTotal.toLocaleString()}`
        });
      }

      // Generate invoice for generated invoice status (limit to first 100 for spacing metrics, or dispatch status)
      if (invoiceStatus === "Generated" && invoices.length < 100) {
        const invId = `INV-2026-${String(invoices.length + 1).padStart(4, '0')}`;
        const invoiceDate = new Date(orderDate.getTime());
        invoiceDate.setDate(invoiceDate.getDate() + 1); // 1 day after order
        
        const dueDate = new Date(invoiceDate.getTime());
        dueDate.setDate(dueDate.getDate() + 30);

        let invStatus = "Unpaid";
        let outstanding = grandTotal;
        const paymentsList = [];

        if (paymentStatus === "Paid") {
          invStatus = "Paid";
          outstanding = 0;
          paymentsList.push({
            date: new Date(invoiceDate.getTime() + randomRange(1, 5) * 86400000).toISOString(),
            amountPaid: grandTotal,
            paymentMethod: randomElem(["ACH Transfer", "Bank Wire", "Credit Card"])
          });
        } else if (paymentStatus === "Partially Paid") {
          invStatus = "Partial";
          const paidVal = Math.round(grandTotal * 0.5);
          outstanding = grandTotal - paidVal;
          paymentsList.push({
            date: new Date(invoiceDate.getTime() + 86400000).toISOString(),
            amountPaid: paidVal,
            paymentMethod: "Bank Wire"
          });
        }

        if (invStatus !== "Paid" && dueDate.getTime() < endDate.getTime()) {
          invStatus = "Overdue";
        }

        invoices.push({
          id: invId,
          orderId: order.id,
          customerId: customer.id,
          customerName: customer.name,
          invoiceDate: invoiceDate.toISOString(),
          dueDate: dueDate.toISOString(),
          amount: grandTotal,
          status: invStatus,
          outstandingAmount: outstanding,
          payments: paymentsList
        });

        // Add outstanding amount back to customer record
        customer.outstandingAmount += outstanding;
      }
    }

    // Sort orders by date descending so the newest display first
    orders.sort((a, b) => new Date(b.createdDate) - new Date(a.createdDate));
    invoices.sort((a, b) => new Date(b.invoiceDate) - new Date(a.invoiceDate));

    return { orders, invoices };
  };

  // 7. BUILD EXPORT STATE OBJECT
  const buildInitialState = () => {
    const salespersons = generateSalespersons();
    const customers = generateCustomers();
    const products = generateProducts();
    const warehouses = generateWarehouses();
    const { machines, workers } = generateManufacturingEquipment();
    const { orders, invoices } = generateOrdersAndInvoices(customers, products, salespersons, warehouses);

    return {
      salespersons,
      customers,
      products,
      warehouses,
      machines,
      workers,
      orders,
      invoices,
      notifications: [
        { id: "notif-1", title: "Low Stock Alert: Direct Drive Motor (Standard)", type: "warning", time: new Date().toISOString(), read: false },
        { id: "notif-2", title: "New Customer Onboarded: Stellar Manufacturing", type: "info", time: new Date(Date.now() - 3600000).toISOString(), read: false },
        { id: "notif-3", title: "Payment Received: ORD-2026-0182 ($12,450.00)", type: "success", time: new Date(Date.now() - 14400000).toISOString(), read: true },
        { id: "notif-4", title: "Production Complete: ORD-2026-0195 Work Order #88", type: "success", time: new Date(Date.now() - 86400000).toISOString(), read: true }
      ],
      settings: {
        companyName: "QEVN Orderflow Global Systems Ltd",
        gstin: "27APXFS4820K1ZX",
        currency: "USD",
        theme: "light",
        address: "740 Silicon Valley Corporate Ave, San Jose, CA 95112"
      }
    };
  };

  return {
    buildInitialState
  };
})();
