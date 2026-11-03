/**
 * Seed script — run with: npm run seed
 * Clears and repopulates users + products collections.
 */
require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

// Require models directly (no circular deps at this level)
const User = require('../models/User');
const Product = require('../models/Product');

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/chatcommerce';

// ── Seed data ────────────────────────────────────────────────────────────────

const users = [
  { name: 'Ishan Admin', email: 'admin@chatcommerce.com', password: 'admin123', role: 'admin' },
  { name: 'Alice Kumar', email: 'alice@example.com', password: 'alice123', role: 'user' },
  { name: 'Bob Singh', email: 'bob@example.com', password: 'bob123', role: 'user' },
  { name: 'Carol Mehta', email: 'carol@example.com', password: 'carol123', role: 'user' },
];

const products = [
  {
    name: 'iPhone 15 Pro',
    description: 'Latest Apple flagship with titanium build and A17 Pro chip',
    price: 1299.99,
    category: 'electronics',
    stock: 50,
  },
  {
    name: 'MacBook Air M3',
    description: 'Ultra-thin 13-inch laptop powered by the M3 chip, all-day battery',
    price: 1099.99,
    category: 'electronics',
    stock: 30,
  },
  {
    name: 'Sony WH-1000XM5',
    description: 'Industry-leading noise canceling wireless headphones',
    price: 399.99,
    category: 'electronics',
    stock: 100,
  },
  {
    name: 'Samsung 55" QLED 4K TV',
    description: 'Smart TV with Quantum Dot technology and built-in voice assistants',
    price: 799.99,
    category: 'electronics',
    stock: 20,
  },
  {
    name: 'Nike Air Max 270',
    description: 'Lifestyle running shoes with Max Air unit for unrivalled comfort',
    price: 150.00,
    category: 'footwear',
    stock: 200,
  },
  {
    name: 'Adidas Ultraboost 22',
    description: 'Premium running shoe with responsive Boost midsole',
    price: 180.00,
    category: 'footwear',
    stock: 150,
  },
  {
    name: 'Mechanical Keyboard RGB',
    description: 'Full-size mechanical gaming keyboard with Cherry MX switches and per-key RGB',
    price: 129.99,
    category: 'electronics',
    stock: 80,
  },
  {
    name: 'Coffee Maker Pro 12-Cup',
    description: 'Programmable drip coffee maker with thermal carafe and auto-brew',
    price: 89.99,
    category: 'kitchen',
    stock: 75,
  },
  {
    name: 'Yoga Mat Premium 6mm',
    description: 'Non-slip extra-thick yoga mat with carrying strap, eco-friendly material',
    price: 45.00,
    category: 'fitness',
    stock: 150,
  },
  {
    name: 'Logitech MX Master 3S',
    description: 'Advanced wireless mouse with electromagnetic scroll wheel and 8K DPI',
    price: 99.99,
    category: 'electronics',
    stock: 120,
  },
];

// ── Run ──────────────────────────────────────────────────────────────────────

async function seed() {
  console.log('\n🌱 ChatCommerce Seed Script');
  console.log('─'.repeat(40));
  console.log(`Connecting to: ${MONGO_URI}`);

  await mongoose.connect(MONGO_URI);
  console.log('✅ Connected to MongoDB\n');

  // Clear existing data
  await User.deleteMany({});
  await Product.deleteMany({});
  console.log('🗑️  Cleared existing users and products\n');

  // Seed users
  console.log('👤 Seeding users...');
  for (const u of users) {
    const passwordHash = await bcrypt.hash(u.password, 12);
    await User.create({ name: u.name, email: u.email, passwordHash, role: u.role });
    console.log(`   ✓ ${u.name} (${u.role}) — ${u.email}`);
  }

  // Seed products
  console.log('\n📦 Seeding products...');
  const created = await Product.insertMany(products);
  created.forEach((p) => console.log(`   ✓ ${p.name} — $${p.price}`));

  console.log('\n─'.repeat(40));
  console.log(`✅ Seed complete! ${users.length} users, ${products.length} products\n`);

  console.log('🔑 Test credentials:');
  users.forEach((u) => console.log(`   ${u.email} / ${u.password}  [${u.role}]`));
  console.log('');

  await mongoose.disconnect();
  process.exit(0);
}

seed().catch((err) => {
  console.error('\n❌ Seed failed:', err.message);
  process.exit(1);
});
