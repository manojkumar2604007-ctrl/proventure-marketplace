import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth/server-guard";
import { categoryService } from "@/services/category.service";

export async function GET(request: NextRequest) {
  try {
    const categories = await categoryService.getCategories();
    return NextResponse.json({ success: true, data: categories });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || "Failed to fetch categories" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    try {
      await requireAdmin();
    } catch (e: any) {
      return NextResponse.json({ success: false, error: e.message || "Forbidden: Admin access required" }, { status: e.status || 403 });
    }

    const body = await request.json();
    const { name, slug, description, image, icon, featured } = body;

    if (!name || !slug) {
      return NextResponse.json({ success: false, error: "Name and slug are required" }, { status: 400 });
    }

    const created = await categoryService.createCategory({
      name,
      slug,
      description,
      image,
      icon,
      featured,
    });

    return NextResponse.json({ success: true, data: created }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || "Failed to create category" },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    try {
      await requireAdmin();
    } catch (e: any) {
      return NextResponse.json({ success: false, error: e.message || "Forbidden: Admin access required" }, { status: e.status || 403 });
    }

    const body = await request.json();
    const { id, ...updates } = body;

    if (!id) {
      return NextResponse.json({ success: false, error: "Category ID is required" }, { status: 400 });
    }

    const updated = await categoryService.updateCategory(id, updates);
    if (!updated) {
      return NextResponse.json({ success: false, error: "Category not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: updated });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || "Failed to update category" },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    try {
      await requireAdmin();
    } catch (e: any) {
      return NextResponse.json({ success: false, error: e.message || "Forbidden: Admin access required" }, { status: e.status || 403 });
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ success: false, error: "Category ID is required" }, { status: 400 });
    }

    const deleted = await categoryService.deleteCategory(id);
    if (!deleted) {
      return NextResponse.json({ success: false, error: "Category not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true, message: "Category deleted successfully" });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || "Failed to delete category" },
      { status: 500 }
    );
  }
}
