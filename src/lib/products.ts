import { z } from "zod";

// รายชื่อหมวดหมู่
// https://dummyjson.com/products/category-list
export const CATEGORIES = [
  "beauty",
  "fragrances",
  "furniture",
  "groceries",
  "home-decoration",
  "kitchen-accessories",
  "laptops",
  "mens-shirts",
  "mens-shoes",
  "mens-watches",
  "mobile-accessories",
  "motorcycle",
  "skin-care",
  "smartphones",
  "sports-accessories",
  "sunglasses",
  "tablets",
  "tops",
  "vehicle",
  "womens-bags",
  "womens-dresses",
  "womens-jewellery",
  "womens-shoes",
  "womens-watches",
] as const;

export const ProductSchema = z.object({
  id: z.number(),

  title: z
    .string()
    .trim()
    .min(1, "กรุณากรอกชื่อสินค้า"),

  price: z
    .number({ error: "กรุณากรอกราคา" })
    .min(0, "ราคาต้องไม่ติดลบ"),

  stock: z
    .number({ error: "กรุณากรอกจำนวนคงเหลือ" })
    .int("จำนวนคงเหลือต้องเป็นจำนวนเต็ม")
    .min(0, "จำนวนคงเหลือต้องไม่ติดลบ"),

  category: z.enum(CATEGORIES, {
    error: "กรุณาเลือกหมวดหมู่",
  }),

  // รูปภาพสินค้า
  thumbnail: z.string(),
});

export const ProductListSchema = z.object({
  products: z.array(ProductSchema),
  total: z.number(),
  skip: z.number(),
  limit: z.number(),
});

export type Product = z.infer<typeof ProductSchema>;

export type ProductList = z.infer<typeof ProductListSchema>;

const API_BASE = "https://dummyjson.com";

export const SORT_FIELDS = [
  "title",
  "price",
  "stock",
] as const;

export type SearchQuery = {
  q: string;
  limit: number;
  sortBy: (typeof SORT_FIELDS)[number];
};

export const defaultQuery: SearchQuery = {
  q: "",
  limit: 10,
  sortBy: "title",
};

export function buildProductUrl(query: SearchQuery): string {
  const params = new URLSearchParams();

  params.set("q", query.q);
  params.set("limit", String(query.limit));
  params.set("sortBy", query.sortBy);
  params.set("order", "asc");

  // เพิ่ม thumbnail เพื่อให้ API ส่งรูปภาพกลับมา
  params.set(
    "select",
    "title,price,stock,category,thumbnail"
  );

  return `${API_BASE}/products/search?${params.toString()}`;
}

export async function fetchProducts(
  query: SearchQuery
): Promise<ProductList> {
  const response = await fetch(buildProductUrl(query));

  if (!response.ok) {
    throw new Error(
      `เรียกข้อมูลไม่สำเร็จ สถานะ ${response.status}`
    );
  }

  const data = await response.json();

  const result = ProductListSchema.safeParse(data);

  if (!result.success) {
    throw new Error(
      "รูปแบบข้อมูลที่ได้รับไม่ตรงกับที่กำหนดไว้"
    );
  }

  return result.data;
}
