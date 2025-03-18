# New price
At Part Management tab from list of parts, Each item has edit and delete buttons.

Select part where will add new price.

Click edit, at form set up new price, click save.

Send to DB request with id of part and new price, update row at Parts table.

The UI shows a notification message about successfully updates.

Used Server-Sent Events with EventSource method for update prices for users.

Onmessage new price is reflected on the product page for customers.

# New price rule

At Pricing Rule tab will show exist list of rules. Each item has edit and delete buttons.

Admin can edit or create new rule via button Create new
