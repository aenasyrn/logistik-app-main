# Project Customization Rules

## Database Migrations Policy
To prevent data loss on local development and production environments, always follow these rules when database schema updates are requested:
1. **Never edit old migrations** that have already been executed unless explicitly asked by the user or if it's the very first setup.
2. **Never run `php artisan migrate:fresh`** or `--seed` on existing active databases containing custom user data.
3. **Use incremental migrations**: Always generate a new migration file to modify columns (add, update, or drop) using:
   ```bash
   php artisan make:migration <action>_columns_in_<table_name>_table --table=<table_name>
   ```
4. **Apply migrations safely**: Run `php artisan migrate` to update the database schema while fully preserving existing data records.
