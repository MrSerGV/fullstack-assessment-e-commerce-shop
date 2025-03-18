# Create New Product

When Marcus creates a new product following information is typically required:
1. Basic information: name, description, category, base price.
2. Define the parts that can be customized for the product.
3. List of available choices for each part.
4. Define allowed combinations.
5. Price rule if existed.
6. Update/create stock quantities for each part.

# Create new part option

At Part Management from list of parts, each item has edit and delete buttons, select part where will add new options.

Click edit, at form fill name, associated product, price, stock quantity.

After save create new record at Parts table.

Then insert new part to ProductParts and ProhibitedCombinations tables for relevant product.
