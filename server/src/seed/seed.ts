import 'dotenv/config';
import { connectDB } from '../config/db';
import User from '../models/User';

async function main() {
  await connectDB(process.env.MONGODB_URI || '');
  const email = process.env.ADMIN_EMAIL || 'admin@thematka.local';
  const password = process.env.ADMIN_PASSWORD || 'Admin@12345';
  const name = process.env.ADMIN_NAME || 'Admin';

  let admin = await User.findOne({ email });
  if (!admin) {
    admin = await User.create({ name, email, password, role: 'admin', status: 'active' });
    console.log('Created admin user:', email);
  } else {
    console.log('Admin already exists:', email);
  }
  process.exit(0);
}

main().catch((e) => { console.error(e); process.exit(1); });
