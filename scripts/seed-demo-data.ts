import { drizzle } from 'drizzle-orm/mysql2';
import mysql from 'mysql2/promise';
import * as schema from '../drizzle/schema';

/**
 * Seed script to populate demo data for accommodations, marketplace, and rewards
 * Run with: npx tsx scripts/seed-demo-data.ts
 */

async function main() {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    throw new Error('DATABASE_URL is required');
  }

  const connection = await mysql.createConnection(connectionString);
  const db = drizzle(connection, { schema, mode: 'default' });

  console.log('🌱 Starting seed process...');

  // Create demo users first
  console.log('Creating demo users...');
  const demoUsers = await db.insert(schema.users).values([
    {
      openId: 'demo_user_1',
      name: 'Sarah Johnson',
      email: 'sarah.johnson@university.edu',
      loginMethod: 'email',
      role: 'user',
    },
    {
      openId: 'demo_user_2',
      name: 'Michael Chen',
      email: 'michael.chen@university.edu',
      loginMethod: 'email',
      role: 'user',
    },
    {
      openId: 'demo_user_3',
      name: 'Emma Williams',
      email: 'emma.williams@university.edu',
      loginMethod: 'email',
      role: 'user',
    },
  ]);

  console.log('✅ Demo users created');

  // Seed accommodations
  console.log('Seeding accommodations...');
  await db.insert(schema.accommodations).values([
    {
      userId: 1,
      title: 'Modern Studio Near Campus',
      description: 'Fully furnished studio apartment just 5 minutes walk from university. Features modern amenities, high-speed internet, and a quiet study environment. Perfect for international students.',
      address: '123 University Avenue, Apt 4B',
      city: 'Boston',
      country: 'USA',
      price: '1200.00',
      currency: 'USD',
      propertyType: 'studio',
      bedrooms: 1,
      bathrooms: 1,
      amenities: JSON.stringify(['WiFi', 'Furnished', 'Laundry', 'Kitchen', 'Air Conditioning']),
      images: JSON.stringify(['/assets/demo/accommodation1.webp']),
      availableFrom: new Date('2026-02-01'),
      availableUntil: new Date('2026-08-31'),
      isAvailable: true,
      latitude: '42.3601',
      longitude: '-71.0589',
    },
    {
      userId: 2,
      title: 'Shared Apartment - 2 Bedrooms Available',
      description: 'Looking for 2 roommates to share a spacious 3-bedroom apartment. Great location near public transport and shopping centers. Friendly atmosphere and inclusive utilities.',
      address: '456 College Street, Unit 12',
      city: 'Boston',
      country: 'USA',
      price: '800.00',
      currency: 'USD',
      propertyType: 'apartment',
      bedrooms: 2,
      bathrooms: 2,
      amenities: JSON.stringify(['WiFi', 'Furnished', 'Parking', 'Gym Access', 'Study Room']),
      images: JSON.stringify(['/assets/demo/accommodation2.jpg', '/assets/demo/accommodation3.jpg']),
      availableFrom: new Date('2026-01-15'),
      availableUntil: new Date('2026-12-31'),
      isAvailable: true,
      latitude: '42.3656',
      longitude: '-71.0596',
    },
    {
      userId: 1,
      title: 'Private Room in Student House',
      description: 'Cozy private room in a shared student house with 4 other students. Great community atmosphere, regular house activities, and close to campus facilities.',
      address: '789 Student Lane',
      city: 'Boston',
      country: 'USA',
      price: '650.00',
      currency: 'USD',
      propertyType: 'room',
      bedrooms: 1,
      bathrooms: 1,
      amenities: JSON.stringify(['WiFi', 'Shared Kitchen', 'Living Room', 'Backyard', 'Bike Storage']),
      images: JSON.stringify(['/assets/demo/accommodation4.jpg']),
      availableFrom: new Date('2026-03-01'),
      availableUntil: null,
      isAvailable: true,
      latitude: '42.3736',
      longitude: '-71.1097',
    },
  ]);

  console.log('✅ Accommodations seeded');

  // Seed marketplace items
  console.log('Seeding marketplace items...');
  await db.insert(schema.marketplaceItems).values([
    {
      userId: 2,
      title: 'Calculus & Physics Textbooks Bundle',
      description: 'Selling my first-year math and physics textbooks. All in excellent condition with minimal highlighting. Includes: Calculus Early Transcendentals (9th Ed), University Physics (15th Ed), and study guides.',
      category: 'books',
      condition: 'good',
      price: '120.00',
      currency: 'USD',
      images: JSON.stringify(['/assets/demo/marketplace_books.jpg']),
      location: 'Boston University Campus',
      isAvailable: true,
      isFeatured: true,
      views: 45,
    },
    {
      userId: 3,
      title: 'MacBook Air M1 - Perfect for Students',
      description: 'Selling my MacBook Air M1 (2020) with 8GB RAM and 256GB SSD. Excellent condition, barely used. Comes with original charger and case. Great for coding, design work, and everyday tasks.',
      category: 'electronics',
      condition: 'like-new',
      price: '750.00',
      currency: 'USD',
      images: JSON.stringify(['/assets/demo/marketplace_laptop.jpg']),
      location: 'Cambridge, MA',
      isAvailable: true,
      isFeatured: true,
      views: 128,
    },
    {
      userId: 1,
      title: 'Wooden Study Desk Chair',
      description: 'Comfortable wooden desk chair, perfect for long study sessions. Ergonomic design with good back support. Moving out sale - must go this week!',
      category: 'furniture',
      condition: 'good',
      price: '45.00',
      currency: 'USD',
      images: JSON.stringify(['/assets/demo/marketplace_chair.jpg']),
      location: 'Allston',
      isAvailable: true,
      isFeatured: false,
      views: 23,
    },
    {
      userId: 2,
      title: 'Modern Desk Chair with Wheels',
      description: 'White desk chair with gold accents and wheels. Very comfortable and stylish. Perfect condition, only used for 6 months.',
      category: 'furniture',
      condition: 'like-new',
      price: '80.00',
      currency: 'USD',
      images: JSON.stringify(['/assets/demo/marketplace_desk_chair.jpg']),
      location: 'Brookline',
      isAvailable: true,
      isFeatured: false,
      views: 31,
    },
  ]);

  console.log('✅ Marketplace items seeded');

  // Seed rewards for users
  console.log('Seeding rewards...');
  await db.insert(schema.rewards).values([
    {
      userId: 1,
      points: 450,
      level: 'silver',
      totalEarned: 650,
      totalRedeemed: 200,
    },
    {
      userId: 2,
      points: 1200,
      level: 'gold',
      totalEarned: 1500,
      totalRedeemed: 300,
    },
    {
      userId: 3,
      points: 150,
      level: 'bronze',
      totalEarned: 150,
      totalRedeemed: 0,
    },
  ]);

  console.log('✅ Rewards seeded');

  // Seed reward transactions
  console.log('Seeding reward transactions...');
  await db.insert(schema.rewardTransactions).values([
    {
      userId: 1,
      type: 'earn',
      points: 100,
      description: 'Welcome bonus for joining StudentKonnect',
      referenceType: 'signup',
      referenceId: null,
    },
    {
      userId: 1,
      type: 'earn',
      points: 50,
      description: 'Posted accommodation listing',
      referenceType: 'accommodation_post',
      referenceId: 1,
    },
    {
      userId: 2,
      type: 'earn',
      points: 200,
      description: 'Successful marketplace sale',
      referenceType: 'marketplace_sale',
      referenceId: 1,
    },
    {
      userId: 2,
      type: 'redeem',
      points: -300,
      description: 'Redeemed 25% discount voucher',
      referenceType: 'reward_redemption',
      referenceId: 1,
    },
    {
      userId: 3,
      type: 'earn',
      points: 150,
      description: 'Referral bonus - 3 friends joined',
      referenceType: 'referral',
      referenceId: null,
    },
  ]);

  console.log('✅ Reward transactions seeded');

  // Seed reward catalog
  console.log('Seeding reward catalog...');
  await db.insert(schema.rewardCatalog).values([
    {
      title: '10% Off Next Accommodation Booking',
      description: 'Get 10% discount on your next accommodation booking through StudentKonnect. Valid for 30 days from redemption.',
      pointsCost: 200,
      category: 'discount',
      image: '/assets/demo/reward_coupon.jpg',
      termsAndConditions: 'Valid for 30 days. Cannot be combined with other offers. Minimum booking value $500.',
      isActive: true,
      stock: null,
    },
    {
      title: '25% Off Marketplace Purchase',
      description: 'Save 25% on any marketplace item purchase. Perfect for getting student essentials at a great price!',
      pointsCost: 300,
      category: 'voucher',
      image: '/assets/demo/reward_voucher.jpg',
      termsAndConditions: 'Valid for 60 days. Maximum discount $50. One-time use only.',
      isActive: true,
      stock: null,
    },
    {
      title: 'StudentKonnect Premium Badge',
      description: 'Unlock premium features including priority listing, featured posts, and exclusive community access for 3 months.',
      pointsCost: 500,
      category: 'service',
      image: '/assets/demo/reward_badge.jpg',
      termsAndConditions: 'Premium access for 3 months. Auto-renews with points if available.',
      isActive: true,
      stock: 100,
    },
    {
      title: 'Free Coffee Voucher - Campus Cafe',
      description: 'Enjoy a free coffee at any participating campus cafe. Choose from regular coffee, latte, or cappuccino.',
      pointsCost: 50,
      category: 'voucher',
      image: '/assets/demo/reward_voucher.jpg',
      termsAndConditions: 'Valid at participating locations. Must show digital voucher. Expires 14 days after redemption.',
      isActive: true,
      stock: 500,
    },
    {
      title: 'Student Event Ticket',
      description: 'Free ticket to exclusive student networking events, workshops, and career fairs organized by StudentKonnect.',
      pointsCost: 150,
      category: 'experience',
      image: '/assets/demo/reward_badge.jpg',
      termsAndConditions: 'Subject to availability. Must register in advance. Non-transferable.',
      isActive: true,
      stock: 50,
    },
  ]);

  console.log('✅ Reward catalog seeded');

  await connection.end();
  console.log('🎉 Seed process completed successfully!');
}

main().catch((error) => {
  console.error('❌ Seed process failed:', error);
  process.exit(1);
});
