

// Pagination Example
function paginateProducts(products: Product[], page: number, itemsPerPage: number): Product[] {
    const startIndex = (page - 1) * itemsPerPage;
    return products.slice(startIndex, startIndex + itemsPerPage);
}



// Price Calculation
function calculatePrice(customization: Customization): number {
    const prices = {
        frameType: { "Full-Suspension": 130, Diamond: 90, "Step-Through": 70 },
        frameFinish: { Matte: 50, Shiny: 30 },
        wheels: { "Road Wheels": 80, "Mountain Wheels": 100, "Fat Bike Wheels": 120 },
        rimColor: { Red: 20, Black: 15, Blue: 20 },
        chain: { "Single-Speed Chain": 43, "8-Speed Chain": 50 }
    };

    return Object.entries(customization)
        .reduce((total, [key, value]) => total + prices[key as keyof Customization][value], 0);
}


 /**
  *
  * Product entity
  *
  */

type Product = {
    id: number;
    name: string;
    category: string;
    price: number;
    stock: number;
};


const productCatalog: Product[] = [
    { id: 1, name: "Full-Suspension Bike", category: "Bicycle", price: 130, stock: 5 },
    { id: 2, name: "Mountain Wheels", category: "Accessories", price: 80, stock: 0 },
];

// Function to apply filters
function filterProducts(
    catalog: Product[],
    search: string,
    category: string
): Product[] {
    return catalog.filter(product => {
        const matchesSearch = product.name.toLowerCase().includes(search.toLowerCase());
        const matchesCategory = category ? product.category === category : true;
        return matchesSearch && matchesCategory;
    });
}

let products: Product[] = [];

function addProduct(newProduct: Product): void {
    products.push(newProduct);
    await addProduct(newProduct);
    Notification(`Product "${newProduct.name}" added successfully.`);
}

addProduct({ id: 3, name: "Surfboard", category: "Sports", price: 200, stock: 10 });

async function addProductAPI(product: Product): Promise<void> {
    await fetch("api/products", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(product)
    });
}

app.post("api/products", (req, res) => {
    try {
        const { name, category, price, stock } = req.body;
        const newProduct = await db.query(
            "INSERT INTO products (name, category, price, stock) VALUES (?, ?, ?, ?)",
            [name, category, price, stock]
        );
        res.status(201).send({ message: "Product added successfully", product: newProduct });
    } catch (error) {
        logger("Error adding product:", error);
        res.status(500).send({ message: "Failed to add product" });
    }
    products.push(newProduct);

});

app.get("api/products", async (req, res) => {
    try {
        const { search, category, page, itemsPerPage } = req.query;
        let query = "SELECT * FROM products";
        const params: any[] = [];
        if (search || category) {
            query += " WHERE";
            if (search) {
                query += " name LIKE ?";
                params.push(`%${search}%`);
            }
            if (category) {
                query += search ? " AND" : "";
                query += " category = ?";
                params.push(category);
            }
        }
        if (page && itemsPerPage) {
            const offset = (parseInt(page as string) - 1) * parseInt(itemsPerPage as string);
            query += " LIMIT ? OFFSET ?";
            params.push(parseInt(itemsPerPage as string), offset);
        }
        const [products] = await db.query(query, params);
        res.send(products);
    } catch (error) {
        logger("Error fetching products:", error);
        res.status(500).send({ message: "Failed to fetch products" });
    }
});


function updateProduct(productId: number, updatedData: Partial<Product>): void {
    const product = products.find(p => p.id === productId);
    if (product) {
        Object.assign(product, updatedData);
        await updateProductAPI(productId, updatedData);
        Notification(`Product with ID ${productId} updated successfully.`);
    } else {
        Notification(`Product with ID ${productId} not found.`);
    }
}


async function updateProductAPI(productId: number, updatedData: Partial<Product>): Promise<void> {
    await fetch(`api/products/${productId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updatedData)
    });
}

updateProduct(3, { price: 220, stock: 15 });

app.put("api/products/:id", (req, res) => {
    try {
        const { id } = req.params;
        const { name, category, price, stock } = req.body;
        const [result] = await db.query(
            "UPDATE products SET name = ?, category = ?, price = ?, stock = ? WHERE id = ?",
            [name, category, price, stock, id]
        );

        if (result.affectedRows > 0) {
            res.send({ message: "Product updated successfully", result });
        } else {
            res.status(404).send({ message: "Product not found" });
        }
    } catch (error) {
        console.error("Error updating product:", error);
        res.status(500).send({ message: "Failed to update product" });
    }
});


/**
 *
 * Part entity
 *
 */

type Part = {
    id: number;
    name: string;
    category: string;
    price: number;
};

let parts: Part[] = [];

function addPart(newPart: Part): void {
    parts.push(newPart);
    await addPartAPI(newPart);
    Notification(`Part "${newPart.name}" added successfully.`);
}

addPart({ id: 1, name: "8-Speed Chain", category: "Chain", price: 50 });

async function addPartAPI(part: Part): Promise<void> {
    await fetch("api/parts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(part)
    });
}

app.post("api/parts", (req, res) => {
    try {
        const { name, category, price } = req.body;
        const newPart = await db.query(
            "INSERT INTO parts (name, category, price) VALUES (?, ?, ?)",
            [name, category, price]
        );
    res.status(201).send({ message: "Part added successfully", part: newPart });
    } catch (error) {
        logger("Error adding part:", error);
        res.status(500).send({ message: "Failed to add part" });
    }
});



/**
 *
 * Stock entity
 *
 */

function updateStock(productId: number, newStock: number): void {
    const product = products.find(p => p.id === productId);
    if (product) {
        product.stock = newStock;
        await updateStockAPI(productId, newStock)
        Notification(`Stock for "${product.name}" updated to ${newStock}.`);
    } else {
        Notification(`Product with ID ${productId} not found.`);
    }
}

async function updateStockAPI(productId: number, stock: number): Promise<void> {
    await fetch(`api/products/${productId}/stock`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ stock })
    });
}

app.patch("api/products/:id/stock", (req, res) => {
    try {
        const { id } = req.params;
        const { stock } = req.body;
        const [result] = await db.query(
            "UPDATE products SET stock = ? WHERE id = ?",
            [stock, id]
        );

        if (result.affectedRows > 0) {
            res.send({ message: "Stock updated successfully", result });
        } else {
            res.status(404).send({ message: "Product not found" });
        }
    } catch (error) {
        logger("Error updating stock:", error);
        res.status(500).send({ message: "Failed to update stock" });
    }
});


/**
 *
 * Create/Update pricing rule and combination
 *
 */

type Customization = {
    frameType: "Full-Suspension" | "Diamond" | "Step-Through";
    frameFinish: "Matte" | "Shiny";
    wheels: "Road Wheels" | "Mountain Wheels" | "Fat Bike Wheels";
    rimColor: "Red" | "Black" | "Blue";
    chain: "Single-Speed Chain" | "8-Speed Chain";
};

const restrictions = {
    wheelsToFrameType: {
        "Mountain Wheels": ["Full-Suspension"],
        "Fat Bike Wheels": ["Diamond", "Step-Through"]
    },
    unavailableRimColor: {
        "Fat Bike Wheels": ["Red"]
    }
};

// Disable choices based on restrictions
function validateCustomization(
    customization: Partial<Customization>
): Partial<Customization> {
    const { wheels, frameType, rimColor } = customization;
    let validCustomization = { ...customization };

    if (wheels && !restrictions.wheelsToFrameType[wheels]?.includes(frameType!)) {
        validCustomization.frameType = undefined;
    }
    if (wheels && restrictions.unavailableRimColor[wheels]?.includes(rimColor!)) {
        validCustomization.rimColor = undefined;
    }
    return validCustomization;
}

type PricingRule = {
    id: number;
    condition: string;
    priceAdjustment: number;
};

let pricingRules: PricingRule[] = [];

function addOrUpdatePricingRule(rule: PricingRule): void {
    const existingRule = pricingRules.find(r => r.id === rule.id);
    if (existingRule) {
        Object.assign(existingRule, rule);
        await addOrUpdatePricingRuleAPI(rule);
        Notification(`Pricing rule with ID ${rule.id} updated successfully.`);
    } else {
        pricingRules.push(rule);
        await addOrUpdatePricingRuleAPI(rule);
        Notification(`Pricing rule added successfully.`);
    }
}


type CombinationRule = {
    id: number;
    condition: string;
    allowed: boolean;
};

let combinationRules: CombinationRule[] = [];

function addOrUpdateCombinationRule(rule: CombinationRule): void {
    const existingRule = combinationRules.find(r => r.id === rule.id);
    if (existingRule) {
        Object.assign(existingRule, rule);
        await addOrUpdateCombinationRuleAPI(rule);
        Notification(`Combination rule with ID ${rule.id} updated successfully.`);
    } else {
        combinationRules.push(rule);
        await addOrUpdateCombinationRuleAPI(rule);
        Notification(`Combination rule added successfully.`);
    }
}


/**
 *
 * Order entity
 *
 */

type Order = {
    id: number;
    items: Product[];
    totalPrice: number;
    status: "Pending" | "Shipped" | "Delivered" | "Cancelled";
};

let orders: Order[] = [];

function updateOrderStatus(orderId: number, status: Order["status"]): void {
    const order = orders.find(o => o.id === orderId);
    if (order) {
        order.status = status;
        updateOrderStatusAPI(orderId, status);
        Notification(`Order ID ${orderId} status updated to "${status}".`);
    } else {
        Notification(`Order ID ${orderId} not found.`);
    }
}

async function updateOrderStatusAPI(orderId: number, status: Order["status"]): Promise<void> {
    await fetch(`api/orders/${orderId}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status })
    });
}

app.get("api/orders", (req, res) => {
    try {
        const [orders] = await db.query("SELECT * FROM orders");
        res.send(orders);
    } catch (error) {
        logger("Error fetching orders:", error);
        res.status(500).send({ message: "Failed to fetch orders" });
    }
});

app.patch("api/orders/:id/status", (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;
        const [result] = await db.query(
            "UPDATE orders SET status = ? WHERE id = ?",
            [status, id]
        );

        if (result.affectedRows > 0) {
            res.send({ message: "Order status updated successfully", result });
        } else {
            res.status(404).send({ message: "Order not found" });
        }
    } catch (error) {
        logger("Error updating order status:", error);
        res.status(500).send({ message: "Failed to update order status" });
    }
});


/**
 *
 * Customer entity
 *
 */

type Customer = {
    id: number;
    name: string;
    email: string;
    orderHistory: Order[];
};

let customers: Customer[] = [];

function reviewCustomer(customerId: number): void {
    const customer = customers.find(c => c.id === customerId);
    if (customer) {
        await getCustomerAPI(customerId);
        await getOrderHistoryAPI(customerId);
    } else {
        Notification(`Customer with ID ${customerId} not found.`);
    }
}

/**
 *
 * Cart entity
 *
 */

type CartItem = {
    product: string;
    quantity: number;
    price: number;
};

let shoppingCart: CartItem[] = [];

function addToCart(product: string, quantity: number, price: number): void {
    const existingItem = shoppingCart.find(item => item.product === product);
    if (existingItem) {
        existingItem.quantity += quantity;
    } else {
        shoppingCart.push({ product, quantity, price });
    }
}

function adjustQuantity(product: string, newQuantity: number): void {
    const item = shoppingCart.find(item => item.product === product);
    if (item) {
        item.quantity = newQuantity;
    }
}

function removeFromCart(product: string): void {
    shoppingCart = shoppingCart.filter(item => item.product !== product);
}

type ShippingInfo = {
    address: string;
    city: string;
    postalCode: string;
};

type BillingInfo = {
    cardNumber: string;
    cardholderName: string;
    expirationDate: string;
};

function finalizePurchase(shipping: ShippingInfo, billing: BillingInfo): void {
    // Some logic to send data to server and generate an invoice
}

function generateInvoice(orderId: number): void {
// Some logic for generate an invoice for order ID
}

function getTrackingInfo(orderId: number): void {
// Some logic for generate an tracking info for order ID
}


type Order = {
    id: number;
    items: CartItem[];
    totalPrice: number;
    date: string;
};


function viewOrderHistory async (): Order[] {
    return await fetchOrderHistory;
}