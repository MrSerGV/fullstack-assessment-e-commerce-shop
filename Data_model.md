# Solution
For this project pick up Relational Database like PostgreSQL or MySQL.
Why exactly this type, because:
1. At this project I see strong relationships between products, parts, stock, prohibited combinations, and pricing rules.
2. Relation database give us data consistency for transactional operations like orders and stock updates.
3. SQL give ability to handle complex queries for customizations or dependencies combinations.

In case if product line will changed rapidly or the data model becomes less structured, transitioning hybrid approach with MongoDB  will be good solution.

-- Table: Products

CREATE TABLE Products (
id INT PRIMARY KEY,
name VARCHAR(100) NOT NULL,
description TEXT,
category VARCHAR(50),
base_price DECIMAL(10, 2),
created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Table: Parts

CREATE TABLE Parts (
id INT PRIMARY KEY,
name VARCHAR(100) NOT NULL,
type VARCHAR(50) NOT NULL,
price DECIMAL(10, 2),
in_stock BOOLEAN DEFAULT TRUE
);

-- Table: ProductParts

CREATE TABLE ProductParts (
id INT PRIMARY KEY,
product_id INT,
part_id INT,
available BOOLEAN DEFAULT TRUE,
stock_quantity INT DEFAULT 0,
FOREIGN KEY (product_id) REFERENCES Products(id),
FOREIGN KEY (part_id) REFERENCES Parts(id)
);

-- Table: PricingRules

CREATE TABLE PricingRules (
id INT PRIMARY KEY,
product_id INT,
dependent_part_id INT,
condition TEXT NOT NULL,
additional_price DECIMAL(10, 2),
FOREIGN KEY (product_id) REFERENCES Products(id),
FOREIGN KEY (dependent_part_id) REFERENCES Parts(id)
);

-- Table: ProhibitedCombinations

CREATE TABLE ProhibitedCombinations (
id INT PRIMARY KEY,
product_id INT,
part_1_id INT,
part_2_id INT,
reason TEXT,
FOREIGN KEY (product_id) REFERENCES Products(id),
FOREIGN KEY (part_1_id) REFERENCES Parts(id),
FOREIGN KEY (part_2_id) REFERENCES Parts(id)
);

-- Table: Customers

CREATE TABLE Customers (
id INT PRIMARY KEY,
name VARCHAR(100) NOT NULL,
email VARCHAR(100) UNIQUE NOT NULL,
phone VARCHAR(15),
address TEXT,
created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Table: Orders

CREATE TABLE Orders (
id INT PRIMARY KEY,
customer_id INT,
product_id INT,
total_price DECIMAL(10, 2),
created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
FOREIGN KEY (customer_id) REFERENCES Customers(id),
FOREIGN KEY (product_id) REFERENCES Products(id)
);

-- Table: Cart

CREATE TABLE Cart (
id INT PRIMARY KEY,
customer_id INT,
product_id INT,
total_price DECIMAL(10, 2),
created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
FOREIGN KEY (customer_id) REFERENCES Customers(id),
FOREIGN KEY (product_id) REFERENCES Products(id)
);


-- Table: OrderDetails

CREATE TABLE OrderDetails (
id INT PRIMARY KEY,
order_id INT,
part_id INT,
price DECIMAL(10, 2),
FOREIGN KEY (order_id) REFERENCES Orders(id),
FOREIGN KEY (part_id) REFERENCES Parts(id)
);

## Relationships

Products & ProductParts: One product can have many associated parts. 1 to M

Parts & ProductParts: One part can be used in multiple products. 1 to M

ProductParts & Orders: Tracks selected parts for each order. M to 1

Products & PricingRules: One product can have multiple conditional pricing rules. 1 to M

Products & ProhibitedCombinations: Tracks allowed combinations for each product. M to 1

Orders & Customers: One customer can have many orders. 1 to M


#  Hybrid database model

At SQL we leave structured data like Products, Parts, ProductParts, Customers, ProhibitedCombinations, Orders, OrderDetails.

To Mongo will move flexible configurations, store customizations and pricing rules as nested documents, cart as temporal information.