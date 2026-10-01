"use client";

import { useEffect, useState } from "react";
import ProductForm from "./ProductForm";
import ProductSearchForm from "./ProductSearchForm";

import { defaultQuery, fetchProducts } from "@/lib/products";

import type {
  Product,
  ProductDraft,
  ProductList,
  SearchQuery,
} from "@/lib/products";

type LoadState = "loading" | "error" | "ready";

export default function ProductExplorer() {
  const [products, setProducts] = useState<Product[]>([]);
  const [status, setStatus] = useState<LoadState>("loading");
  const [errorMessage, setErrorMessage] = useState("");
  const [editing, setEditing] = useState<Product | null>(null);

  function showResult(list: ProductList) {
    setProducts(list.products);
    setEditing(null);
    setStatus("ready");
  }

  function showError(error: unknown) {
    setErrorMessage(
      error instanceof Error ? error.message : "เรียกข้อมูลไม่สำเร็จ"
    );
    setStatus("error");
  }

  async function loadProducts(query: SearchQuery) {
    setStatus("loading");
    setErrorMessage("");

    try {
      showResult(await fetchProducts(query));
    } catch (error) {
      showError(error);
    }
  }

  // 4.1  โหลดครั้งเดียวตอนแสดงผลครั้งแรก
  useEffect(() => {
    fetchProducts(defaultQuery).then(showResult).catch(showError);
  }, []);

  // 3.7 + 4.2  เพิ่มหรือแก้ไข
  function saveProduct(draft: ProductDraft) {
    if (editing) {
      setProducts(
        products.map((item) =>
          item.id === editing.id ? { ...item, ...draft } : item
        )
      );
      setEditing(null);
    } else {
      setProducts([
        ...products,
        { ...draft, thumbnail: "", id: Date.now() },
      ]);
    }
  }

  // 4.2  ลบ
  function removeProduct(id: number) {
    setProducts(products.filter((item) => item.id !== id));

    if (editing?.id === id) {
      setEditing(null);
    }
  }

  return (
    <main>
      <h1>รายการสินค้า</h1>

      <button
        type="button"
        onClick={() => loadProducts(defaultQuery)}
        disabled={status === "loading"}
      >
        {status === "loading" ? "กำลังโหลด" : "โหลดซ้ำ"}
      </button>

      <ProductSearchForm onSearch={loadProducts} />

      <ProductForm
        key={editing?.id ?? "new"}
        editing={editing}
        onSave={saveProduct}
        onCancel={() => setEditing(null)}
      />

      <section aria-live="polite">
        {status === "loading" && <p>กำลังโหลดข้อมูล...</p>}

        {status === "error" && <p role="alert">{errorMessage}</p>}

        {status === "ready" && products.length === 0 && (
          <p>ไม่พบสินค้าที่ตรงกับเงื่อนไข</p>
        )}

        {status === "ready" && products.length > 0 && (
          <table>
            <thead>
              <tr>
                <th>รูปภาพ</th>
                <th>ชื่อสินค้า</th>
                <th>ราคา</th>
                <th>คงเหลือ</th>
                <th>หมวดหมู่</th>
                <th>จัดการ</th>
              </tr>
            </thead>

            <tbody>
              {products.map((item) => (
                <tr key={item.id}>
                  <td>
                    {item.thumbnail && (
                      <img
                        src={item.thumbnail}
                        alt={item.title}
                        width={80}
                        height={80}
                      />
                    )}
                  </td>
                  <td>{item.title}</td>
                  <td>{item.price}</td>
                  <td>{item.stock}</td>
                  <td>{item.category}</td>
                  <td>
                    <button type="button" onClick={() => setEditing(item)}>
                      แก้ไข
                    </button>
                    <button
                      type="button"
                      onClick={() => removeProduct(item.id)}
                    >
                      ลบ
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </section>
    </main>
  );
}