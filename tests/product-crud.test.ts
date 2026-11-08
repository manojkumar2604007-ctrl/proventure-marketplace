import { describe, it, expect } from "./test-utils";
import { productService } from "@/services/product.service";

describe("3. Product Management & Catalog Tests", () => {
  it("should retrieve mock products when database is bypassed/offline", async () => {
    const res = await productService.getProducts({ limit: 10 });
    expect(res).toBeDefined();
    expect(res.products).toBeInstanceOf(Array);
    expect(res.products.length).toBeGreaterThan(0);
    expect(res.total).toBeGreaterThan(0);
  });

  it("should retrieve a single product by slug with accurate numeric price", async () => {
    const res = await productService.getProducts({ limit: 1 });
    const sample = res.products[0];
    expect(sample).toBeDefined();

    const bySlug = await productService.getProductBySlug(sample.slug);
    expect(bySlug).toBeDefined();
    expect(bySlug?.id).toBe(sample.id);
    expect(typeof bySlug?.price).toBe("number");
    expect(bySlug?.price).toBeGreaterThan(0);
  });

  it("should create a product with auto-generated slug and price fields", async () => {
    const newProduct = await productService.createProduct({
      title: "Audited Titanium Noise-Cancelling Headphones",
      description: "High-fidelity audiophile grade headphones with ANC.",
      price: 18999,
      comparePrice: 24999,
      stock: 45,
      sku: `SKU-AUDIT-${Date.now()}`,
      categoryId: "cat_electronics",
      sellerId: "seller_technexus",
    });

    expect(newProduct).toBeDefined();
    expect(newProduct.id).toBeDefined();
    expect(newProduct.title).toBe("Audited Titanium Noise-Cancelling Headphones");
    expect(newProduct.slug).toContain("audited-titanium-noise-cancelling-headphones");
    expect(newProduct.stock).toBe(45);
    expect(newProduct.price).toBe(18999);

    // Update product stock and pricing
    const updated = await productService.updateProduct(newProduct.id, {
      price: 17499,
      stock: 40,
    });
    expect(updated).toBeDefined();
    expect(updated?.price).toBe(17499);
    expect(updated?.stock).toBe(40);
  });

  it("should filter products by seller ID", async () => {
    const technexusProducts = await productService.getProductsBySeller("seller_technexus");
    expect(technexusProducts).toBeInstanceOf(Array);
    expect(technexusProducts.length).toBeGreaterThan(0);
    for (const prod of technexusProducts) {
      expect(prod.sellerId).toBe("seller_technexus");
    }
  });
});
