import * as dotenv from 'dotenv';

// Load environment variables
dotenv.config({ path: '.env.local' });

import { db } from './index';
import { categories, subcategories } from './schema';

const categoriesData = [
  {
    name: 'Electronics',
    slug: 'electronics',
    description: 'Deals on electronics, gadgets, and tech products',
    color: '#3B82F6',
  },
  {
    name: 'Clothing & Fashion',
    slug: 'clothing-fashion',
    description: 'Fashion deals, clothing, shoes, and accessories',
    color: '#EC4899',
  },
  {
    name: 'Home & Garden',
    slug: 'home-garden',
    description: 'Home improvement, furniture, and garden deals',
    color: '#10B981',
  },
  {
    name: 'Automotive',
    slug: 'automotive',
    description: 'Car parts, accessories, and automotive deals',
    color: '#F59E0B',
  },
  {
    name: 'Health & Beauty',
    slug: 'health-beauty',
    description: 'Health products, cosmetics, and wellness deals',
    color: '#8B5CF6',
  },
  {
    name: 'Sports & Outdoors',
    slug: 'sports-outdoors',
    description: 'Sports equipment, outdoor gear, and fitness deals',
    color: '#EF4444',
  },
  {
    name: 'Food & Beverages',
    slug: 'food-beverages',
    description: 'Restaurant deals, grocery, and food delivery',
    color: '#F97316',
  },
  {
    name: 'Travel & Entertainment',
    slug: 'travel-entertainment',
    description: 'Travel deals, hotels, events, and entertainment',
    color: '#06B6D4',
  },
];

const subcategoriesData = [
  // Electronics
  { name: 'Smartphones', slug: 'smartphones', categorySlug: 'electronics' },
  {
    name: 'Laptops & Computers',
    slug: 'laptops-computers',
    categorySlug: 'electronics',
  },
  { name: 'Gaming', slug: 'gaming', categorySlug: 'electronics' },
  { name: 'Audio & Video', slug: 'audio-video', categorySlug: 'electronics' },
  { name: 'Smart Home', slug: 'smart-home', categorySlug: 'electronics' },
  {
    name: 'Cameras & Photography',
    slug: 'cameras-photography',
    categorySlug: 'electronics',
  },

  // Clothing & Fashion
  {
    name: "Men's Clothing",
    slug: 'mens-clothing',
    categorySlug: 'clothing-fashion',
  },
  {
    name: "Women's Clothing",
    slug: 'womens-clothing',
    categorySlug: 'clothing-fashion',
  },
  { name: 'Shoes', slug: 'shoes', categorySlug: 'clothing-fashion' },
  {
    name: 'Accessories',
    slug: 'accessories',
    categorySlug: 'clothing-fashion',
  },
  { name: 'Jewelry', slug: 'jewelry', categorySlug: 'clothing-fashion' },

  // Home & Garden
  { name: 'Furniture', slug: 'furniture', categorySlug: 'home-garden' },
  {
    name: 'Kitchen & Dining',
    slug: 'kitchen-dining',
    categorySlug: 'home-garden',
  },
  { name: 'Home Decor', slug: 'home-decor', categorySlug: 'home-garden' },
  {
    name: 'Garden & Outdoor',
    slug: 'garden-outdoor',
    categorySlug: 'home-garden',
  },
  {
    name: 'Tools & Hardware',
    slug: 'tools-hardware',
    categorySlug: 'home-garden',
  },

  // Automotive
  { name: 'Car Parts', slug: 'car-parts', categorySlug: 'automotive' },
  {
    name: 'Car Accessories',
    slug: 'car-accessories',
    categorySlug: 'automotive',
  },
  { name: 'Motorcycles', slug: 'motorcycles', categorySlug: 'automotive' },
  { name: 'Car Care', slug: 'car-care', categorySlug: 'automotive' },

  // Health & Beauty
  { name: 'Skincare', slug: 'skincare', categorySlug: 'health-beauty' },
  { name: 'Makeup', slug: 'makeup', categorySlug: 'health-beauty' },
  { name: 'Hair Care', slug: 'hair-care', categorySlug: 'health-beauty' },
  {
    name: 'Vitamins & Supplements',
    slug: 'vitamins-supplements',
    categorySlug: 'health-beauty',
  },
  {
    name: 'Personal Care',
    slug: 'personal-care',
    categorySlug: 'health-beauty',
  },

  // Sports & Outdoors
  {
    name: 'Fitness Equipment',
    slug: 'fitness-equipment',
    categorySlug: 'sports-outdoors',
  },
  {
    name: 'Outdoor Gear',
    slug: 'outdoor-gear',
    categorySlug: 'sports-outdoors',
  },
  { name: 'Team Sports', slug: 'team-sports', categorySlug: 'sports-outdoors' },
  {
    name: 'Water Sports',
    slug: 'water-sports',
    categorySlug: 'sports-outdoors',
  },
  {
    name: 'Winter Sports',
    slug: 'winter-sports',
    categorySlug: 'sports-outdoors',
  },

  // Food & Beverages
  { name: 'Restaurants', slug: 'restaurants', categorySlug: 'food-beverages' },
  { name: 'Grocery', slug: 'grocery', categorySlug: 'food-beverages' },
  {
    name: 'Food Delivery',
    slug: 'food-delivery',
    categorySlug: 'food-beverages',
  },
  { name: 'Coffee & Tea', slug: 'coffee-tea', categorySlug: 'food-beverages' },

  // Travel & Entertainment
  { name: 'Hotels', slug: 'hotels', categorySlug: 'travel-entertainment' },
  { name: 'Flights', slug: 'flights', categorySlug: 'travel-entertainment' },
  {
    name: 'Car Rentals',
    slug: 'car-rentals',
    categorySlug: 'travel-entertainment',
  },
  {
    name: 'Events & Concerts',
    slug: 'events-concerts',
    categorySlug: 'travel-entertainment',
  },
  {
    name: 'Movies & Streaming',
    slug: 'movies-streaming',
    categorySlug: 'travel-entertainment',
  },
];

export async function seedDatabase() {
  try {
    console.log('Seeding categories...');

    const insertedCategories = await db
      .insert(categories)
      .values(categoriesData)
      .returning();
    console.log(`Inserted ${insertedCategories.length} categories`);

    console.log('Seeding subcategories...');

    for (const subcategory of subcategoriesData) {
      const category = insertedCategories.find(
        cat => cat.slug === subcategory.categorySlug
      );
      if (category) {
        await db.insert(subcategories).values({
          name: subcategory.name,
          slug: subcategory.slug,
          categoryId: category.id,
        });
      }
    }

    console.log(`Inserted ${subcategoriesData.length} subcategories`);
    console.log('Database seeded successfully!');
  } catch (error) {
    console.error('Error seeding database:', error);
    throw error;
  }
}

if (require.main === module) {
  seedDatabase()
    .then(() => process.exit(0))
    .catch(error => {
      console.error(error);
      process.exit(1);
    });
}
