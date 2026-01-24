# StudentKonnect - New Features Implementation

This document describes the newly implemented database tables and demo data for **Accommodation**, **Marketplace**, and **Rewards** features.

## Overview

Three major features have been added to the StudentKonnect platform:

1. **Accommodation Listings** - Students can find and list housing options
2. **Marketplace** - Buy and sell items between students
3. **Rewards System** - Earn and redeem loyalty points

## Database Schema

### Tables Created

#### 1. Accommodations Table
Stores student housing and accommodation listings.

**Key Fields:**
- Property details (title, description, address, city, country)
- Pricing (price, currency)
- Property type (apartment, room, studio, house, dormitory)
- Amenities (stored as JSON)
- Images (stored as JSON array)
- Availability dates
- Geolocation (latitude, longitude)

#### 2. Marketplace Items Table
Stores items for sale or exchange between students.

**Key Fields:**
- Item details (title, description)
- Category (books, electronics, furniture, clothing, sports, services, other)
- Condition (new, like-new, good, fair, poor)
- Pricing (price, currency)
- Images (stored as JSON array)
- Availability status
- Featured flag for promoted items
- View counter

#### 3. Rewards Table
Tracks user reward points and loyalty levels.

**Key Fields:**
- Current points balance
- Loyalty level (bronze, silver, gold, platinum)
- Total points earned (lifetime)
- Total points redeemed (lifetime)

#### 4. Reward Transactions Table
Records all point earning and redemption activities.

**Key Fields:**
- Transaction type (earn or redeem)
- Points amount
- Description
- Reference to related entity (optional)

#### 5. Reward Catalog Table
Defines available rewards that can be redeemed.

**Key Fields:**
- Reward details (title, description)
- Points cost
- Category (discount, voucher, merchandise, service, experience)
- Terms and conditions
- Stock availability
- Active status

## Database Migration

### Migration File
Location: `/drizzle/0001_new_features.sql`

This SQL file contains the CREATE TABLE statements for all five new tables.

### Schema Definition
Location: `/drizzle/schema.ts`

Updated with TypeScript definitions using Drizzle ORM, including:
- Table schemas
- Type inference
- Relations between tables

## Demo Data

### Seed Script
Location: `/scripts/seed-demo-data.ts`

### Running the Seed Script

```bash
# Make sure DATABASE_URL is set in your environment
export DATABASE_URL="your_database_connection_string"

# Run the migration first
mysql -u your_user -p your_database < drizzle/0001_new_features.sql

# Then run the seed script
npx tsx scripts/seed-demo-data.ts
```

### Demo Data Included

#### Users (3 demo users)
- Sarah Johnson
- Michael Chen
- Emma Williams

#### Accommodations (3 listings)
1. **Modern Studio Near Campus** - $1,200/month studio in Boston
2. **Shared Apartment** - $800/month shared apartment with 2 bedrooms
3. **Private Room in Student House** - $650/month private room

#### Marketplace Items (4 items)
1. **Calculus & Physics Textbooks Bundle** - $120
2. **MacBook Air M1** - $750
3. **Wooden Study Desk Chair** - $45
4. **Modern Desk Chair with Wheels** - $80

#### Rewards
- User points ranging from 150 to 1,200
- Multiple loyalty levels (bronze, silver, gold)
- Transaction history showing earning and redemption

#### Reward Catalog (5 rewards)
1. **10% Off Accommodation** - 200 points
2. **25% Off Marketplace** - 300 points
3. **Premium Badge** - 500 points
4. **Free Coffee Voucher** - 50 points
5. **Student Event Ticket** - 150 points

## Demo Images

All demo images are stored in `/assets/demo/` directory:

### Accommodation Images
- `accommodation1.webp` - Modern studio
- `accommodation2.jpg` - Shared apartment
- `accommodation3.jpg` - Studio interior
- `accommodation4.jpg` - Private room

### Marketplace Images
- `marketplace_books.jpg` - Textbooks
- `marketplace_laptop.jpg` - Laptop
- `marketplace_chair.jpg` - Wooden chair
- `marketplace_desk_chair.jpg` - Modern desk chair

### Reward Images
- `reward_badge.jpg` - Loyalty badge
- `reward_voucher.jpg` - Discount voucher
- `reward_coupon.jpg` - Coupon design

## API Integration Points

### Recommended API Endpoints

#### Accommodations
- `GET /api/accommodations` - List all accommodations
- `GET /api/accommodations/:id` - Get single accommodation
- `POST /api/accommodations` - Create new listing
- `PUT /api/accommodations/:id` - Update listing
- `DELETE /api/accommodations/:id` - Delete listing

#### Marketplace
- `GET /api/marketplace` - List all items
- `GET /api/marketplace/:id` - Get single item
- `POST /api/marketplace` - Create new listing
- `PUT /api/marketplace/:id` - Update listing
- `DELETE /api/marketplace/:id` - Delete listing
- `POST /api/marketplace/:id/view` - Increment view counter

#### Rewards
- `GET /api/rewards/balance` - Get user's point balance
- `GET /api/rewards/transactions` - Get transaction history
- `GET /api/rewards/catalog` - List available rewards
- `POST /api/rewards/redeem` - Redeem a reward
- `POST /api/rewards/earn` - Award points (admin/system)

## Frontend Integration

### React Native Components Needed

1. **Accommodation Module**
   - AccommodationList component
   - AccommodationDetail component
   - AccommodationForm component
   - Map view with geolocation

2. **Marketplace Module**
   - MarketplaceList component
   - MarketplaceDetail component
   - MarketplaceForm component
   - Category filters

3. **Rewards Module**
   - RewardsBalance component
   - RewardsCatalog component
   - TransactionHistory component
   - RedemptionFlow component

## Next Steps

1. **Database Setup**
   - Run the migration SQL file
   - Execute the seed script
   - Verify data in database

2. **Backend Development**
   - Implement API endpoints
   - Add authentication middleware
   - Set up image upload handling

3. **Frontend Development**
   - Create UI components
   - Implement navigation
   - Add image handling
   - Integrate with backend APIs

4. **Testing**
   - Test all CRUD operations
   - Verify image uploads
   - Test reward point calculations
   - Validate business logic

## Business Logic Notes

### Rewards System
- Users earn points for various activities:
  - Signup bonus: 100 points
  - Posting accommodation: 50 points
  - Marketplace sale: 200 points
  - Referrals: 50 points per referral

- Loyalty levels based on total earned:
  - Bronze: 0-499 points
  - Silver: 500-999 points
  - Gold: 1000-1999 points
  - Platinum: 2000+ points

### Image Handling
- Images are stored as JSON arrays in the database
- Actual image files should be uploaded to cloud storage (S3, Cloudinary, etc.)
- Image paths in the database are references to stored files

## Support

For questions or issues with the implementation, refer to the main project documentation or contact the development team.

---

**Created:** January 2026  
**Version:** 1.0  
**Status:** Ready for Integration
