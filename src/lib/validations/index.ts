import { z } from "zod";

export const ProductSchema = z.object({
  title: z
    .string()
    .min(3, "Title must be at least 3 characters")
    .max(120, "Title cannot exceed 120 characters"),
  description: z
    .string()
    .min(20, "Description must be at least 20 characters"),
  shortDescription: z.string().max(250).optional(),
  price: z.coerce.number().positive("Price must be greater than 0"),
  comparePrice: z.coerce.number().positive().optional().nullable(),
  sku: z.string().min(2, "SKU is required").max(30),
  stock: z.coerce.number().int().min(0, "Stock cannot be negative"),
  categoryId: z.string().min(1, "Please select a category"),
  status: z.enum(["DRAFT", "ACTIVE", "ARCHIVED", "OUT_OF_STOCK"]).default("ACTIVE"),
  tags: z.array(z.string()).default([]),
  featured: z.boolean().default(false),
  imageUrl: z.string().url("Must be a valid URL").optional(),
});

export type ProductFormValues = z.infer<typeof ProductSchema>;

export const SellerProfileSchema = z.object({
  storeName: z.string().min(3, "Store name must be at least 3 characters"),
  slug: z
    .string()
    .min(3, "Slug must be at least 3 characters")
    .regex(/^[a-z0-9-]+$/, "Slug can only contain lowercase letters, numbers, and hyphens"),
  description: z.string().max(500, "Description cannot exceed 500 characters").optional(),
  email: z.string().email("Invalid email address"),
  phone: z.string().min(10, "Phone number must be at least 10 digits"),
  city: z.string().min(2, "City is required"),
  state: z.string().min(2, "State is required"),
  postalCode: z.string().min(5, "Postal code is required"),
});

export type SellerProfileFormValues = z.infer<typeof SellerProfileSchema>;

export const ShippingAddressSchema = z.object({
  fullName: z.string().min(2, "Full name is required"),
  phone: z.string().min(10, "Valid 10-digit phone number is required"),
  street: z.string().min(5, "Street address is required"),
  city: z.string().min(2, "City is required"),
  state: z.string().min(2, "State is required"),
  postalCode: z.string().min(4, "Postal code is required"),
  country: z.string().default("India"),
});

export type ShippingAddressValues = z.infer<typeof ShippingAddressSchema>;

export const ReviewSchema = z.object({
  rating: z.number().min(1, "Rating must be between 1 and 5").max(5),
  title: z.string().min(3, "Review title is required").max(100),
  comment: z.string().min(10, "Review comment must be at least 10 characters"),
});

export type ReviewFormValues = z.infer<typeof ReviewSchema>;

export const LoginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

export const RegisterSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  role: z.enum(["CUSTOMER", "SELLER"]).default("CUSTOMER"),
});
