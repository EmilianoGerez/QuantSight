import { Pool } from 'pg';

const pool = new Pool({
  user: 'finance_user',
  host: 'localhost',
  database: 'finance_db',
  password: 'finance_pass',
  port: 5432,
});

export default pool;