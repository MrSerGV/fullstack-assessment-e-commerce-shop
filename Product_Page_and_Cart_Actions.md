# Product page

1. Before load page get from backend response with available combinations and price rule.
2. Will display product overview name, description, category, and base price etc.
3. Customization options with sections of dropdowns and radio buttons, show availability at stock.
4. Base on price rule calculate final price.
5. Once calculation done, user allow to add product to cart via click on button.

# Cart actions

After add product to cart. On load cart page check valid combination, stock availability and price, saved cart to db.

Repeat check each time when user made change at cart.

Saved to a temporary cart new set of selected product, customizations, calculated price.

When the customer confirms the order, update stock levels, create Order, delete temporary cart.