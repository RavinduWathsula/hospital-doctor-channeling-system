# Database Configuration

This folder contains the database schema and seed data for the Smart Hospital System.

- `schema.sql`: Contains the table definitions and constraints.
- `seed.sql`: Contains the initial default data (admin user, departments) to populate the database.

## Setup Instructions

1. Ensure MySQL is running on your machine.
2. Run `schema.sql` to create the database and tables.
3. Run `seed.sql` to populate initial data.

```bash
mysql -u root -p < schema.sql
mysql -u root -p smart_hospital < seed.sql
```
