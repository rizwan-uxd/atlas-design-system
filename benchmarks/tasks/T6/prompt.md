Build a new prototype screen called "invoices-table" — an Invoices screen with a data table, like the other prototypes in this project. Mobile frame is fine; the table may scroll.

It needs:
- A table of 6 sample invoices: invoice number, customer, amount, status (Paid / Pending / Overdue) and due date.
- Filters above the table: a search field and a status filter.
- A checkbox on every row and a select-all checkbox in the header.
- When one or more rows are selected, a bulk action bar shows the number selected with two actions: "Mark as paid" and "Delete". Deleting must ask for confirmation first.
- A loading state, and a state for when the filters match no invoices. Provide a way to switch to each so they can be reviewed.

Use the Atlas design system. Register it so it appears on the prototypes index. When you're done, make sure it passes the token lint.
