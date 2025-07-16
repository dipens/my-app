import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { categories, subcategories } from '@/db/schema';
import { eq } from 'drizzle-orm';

export async function GET(request: NextRequest) {
  try {
    const categoriesData = await db
      .select({
        id: categories.id,
        name: categories.name,
        slug: categories.slug,
        description: categories.description,
        color: categories.color,
        createdAt: categories.createdAt,
      })
      .from(categories)
      .orderBy(categories.name);

    const subcategoriesData = await db
      .select({
        id: subcategories.id,
        name: subcategories.name,
        slug: subcategories.slug,
        description: subcategories.description,
        categoryId: subcategories.categoryId,
        createdAt: subcategories.createdAt,
      })
      .from(subcategories)
      .orderBy(subcategories.name);

    // Organize subcategories under their parent categories
    const categoriesWithSubs = categoriesData.map(category => ({
      ...category,
      subcategories: subcategoriesData.filter(
        sub => sub.categoryId === category.id
      ),
    }));

    return NextResponse.json({ categories: categoriesWithSubs });
  } catch (error) {
    console.error('Error fetching categories:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
