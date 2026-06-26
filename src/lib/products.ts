import { Prisma } from "@/generated/prisma/client";
import { prisma } from "./prisma";
import { PAGE_SIZE } from "./site";

export type ProductWithCategories = Prisma.ProductGetPayload<{
  include: { categories: { include: { category: true } } };
}>;

export type ProductListResult = {
  products: ProductWithCategories[];
  total: number;
  page: number;
  totalPages: number;
};

type GetProductsArgs = {
  page?: number;
  query?: string;
  categorySlug?: string;
  pageSize?: number;
};

export const getProducts = async ({
  page = 1,
  query,
  categorySlug,
  pageSize = PAGE_SIZE,
}: GetProductsArgs = {}): Promise<ProductListResult> => {
  const currentPage = Math.max(1, page);

  const where: Prisma.ProductWhereInput = { published: true };

  if (query && query.trim().length > 0) {
    const q = query.trim();
    where.OR = [
      { title: { contains: q, mode: "insensitive" } },
      { shortDescription: { contains: q, mode: "insensitive" } },
      { content: { contains: q, mode: "insensitive" } },
    ];
  }

  if (categorySlug) {
    where.categories = { some: { category: { slug: categorySlug } } };
  }

  const [total, products] = await Promise.all([
    prisma.product.count({ where }),
    prisma.product.findMany({
      where,
      include: { categories: { include: { category: true } } },
      orderBy: { createdAt: "desc" },
      skip: (currentPage - 1) * pageSize,
      take: pageSize,
    }),
  ]);

  return {
    products,
    total,
    page: currentPage,
    totalPages: Math.max(1, Math.ceil(total / pageSize)),
  };
};

export const getProductBySlug = async (
  slug: string
): Promise<ProductWithCategories | null> => {
  return prisma.product.findFirst({
    where: { slug, published: true },
    include: { categories: { include: { category: true } } },
  });
};

export const getRelatedProducts = async (
  product: ProductWithCategories,
  take = 3
): Promise<ProductWithCategories[]> => {
  const categoryIds = product.categories.map((c) => c.categoryId);

  return prisma.product.findMany({
    where: {
      published: true,
      id: { not: product.id },
      categories: { some: { categoryId: { in: categoryIds } } },
    },
    include: { categories: { include: { category: true } } },
    orderBy: { createdAt: "desc" },
    take,
  });
};

export const getCategories = async () => {
  return prisma.category.findMany({
    orderBy: { name: "asc" },
    include: { _count: { select: { products: true } } },
  });
};

export const getCategoryBySlug = async (slug: string) => {
  return prisma.category.findUnique({ where: { slug } });
};

export const getAllProductSlugs = async () => {
  return prisma.product.findMany({
    where: { published: true },
    select: { slug: true, updatedAt: true },
    orderBy: { createdAt: "desc" },
  });
};
