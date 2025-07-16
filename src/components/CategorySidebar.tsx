'use client';

import { useState } from 'react';

interface Category {
  id: number;
  name: string;
  slug: string;
  description: string;
  color: string;
  subcategories: {
    id: number;
    name: string;
    slug: string;
  }[];
}

interface CategorySidebarProps {
  categories: Category[];
  selectedCategory: string | null;
  selectedSubcategory: string | null;
  onCategorySelect: (
    categorySlug: string | null,
    subcategorySlug?: string | null
  ) => void;
}

export default function CategorySidebar({
  categories,
  selectedCategory,
  selectedSubcategory,
  onCategorySelect,
}: CategorySidebarProps) {
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(
    new Set()
  );

  const toggleCategory = (categorySlug: string) => {
    const newExpanded = new Set(expandedCategories);
    if (newExpanded.has(categorySlug)) {
      newExpanded.delete(categorySlug);
    } else {
      newExpanded.add(categorySlug);
    }
    setExpandedCategories(newExpanded);
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
      <h2 className="text-lg font-semibold text-gray-900 mb-4">Categories</h2>

      {/* All Categories */}
      <button
        onClick={() => onCategorySelect(null)}
        className={`w-full text-left px-3 py-2 rounded-md text-sm font-medium mb-2 transition-colors ${
          !selectedCategory
            ? 'bg-blue-100 text-blue-700'
            : 'text-gray-700 hover:bg-gray-100'
        }`}
      >
        All Categories
      </button>

      {/* Category List */}
      <div className="space-y-1">
        {categories.map(category => {
          const isExpanded = expandedCategories.has(category.slug);
          const isSelected = selectedCategory === category.slug;

          return (
            <div key={category.id}>
              {/* Category Header */}
              <div className="flex items-center">
                <button
                  onClick={() => onCategorySelect(category.slug)}
                  className={`flex-1 text-left px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    isSelected && !selectedSubcategory
                      ? 'bg-blue-100 text-blue-700'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  <div className="flex items-center">
                    <div
                      className="w-3 h-3 rounded-full mr-2"
                      style={{ backgroundColor: category.color }}
                    />
                    {category.name}
                  </div>
                </button>

                {category.subcategories.length > 0 && (
                  <button
                    onClick={() => toggleCategory(category.slug)}
                    className="p-1 rounded hover:bg-gray-100"
                  >
                    <svg
                      className={`w-4 h-4 text-gray-400 transition-transform ${
                        isExpanded ? 'rotate-90' : ''
                      }`}
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      suppressHydrationWarning
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 5l7 7-7 7"
                      />
                    </svg>
                  </button>
                )}
              </div>

              {/* Subcategories */}
              {isExpanded && category.subcategories.length > 0 && (
                <div className="ml-4 mt-1 space-y-1">
                  {category.subcategories.map(subcategory => (
                    <button
                      key={subcategory.id}
                      onClick={() =>
                        onCategorySelect(category.slug, subcategory.slug)
                      }
                      className={`w-full text-left px-3 py-1 rounded-md text-sm transition-colors ${
                        selectedSubcategory === subcategory.slug
                          ? 'bg-blue-50 text-blue-600'
                          : 'text-gray-600 hover:bg-gray-50'
                      }`}
                    >
                      {subcategory.name}
                    </button>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
