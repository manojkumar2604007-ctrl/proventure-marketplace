"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { categoryService } from "@/services/category.service";
import { adminService } from "@/services/admin.service";
import { Category } from "@/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Modal } from "@/components/ui/modal";
import { Badge } from "@/components/ui/badge";
import { useUIStore } from "@/store/ui-store";
import {
  Layers,
  Plus,
  Sparkles,
  Edit2,
  Trash2,
  ExternalLink,
  Search,
} from "lucide-react";

export default function AdminCategoriesPage() {
  const { addToast } = useUIStore();
  const [categories, setCategories] = useState<Category[]>([]);
  const [search, setSearch] = useState("");

  // Add / Edit Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCatId, setEditingCatId] = useState<string | null>(null);
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [description, setDescription] = useState("");
  const [image, setImage] = useState("");
  const [featured, setFeatured] = useState(false);

  useEffect(() => {
    async function load() {
      const data = await categoryService.getCategories();
      setCategories(data);
    }
    load();
  }, []);

  const openAddModal = () => {
    setEditingCatId(null);
    setName("");
    setSlug("");
    setDescription("");
    setImage("https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600&auto=format&fit=crop&q=80");
    setFeatured(true);
    setIsModalOpen(true);
  };

  const openEditModal = (cat: Category) => {
    setEditingCatId(cat.id);
    setName(cat.name);
    setSlug(cat.slug);
    setDescription(cat.description || "");
    setImage(cat.image || "");
    setFeatured(Boolean(cat.featured));
    setIsModalOpen(true);
  };

  const handleSaveCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !slug) return;

    if (editingCatId) {
      const updated = await categoryService.updateCategory(editingCatId, {
        name,
        slug,
        description,
        image,
        featured,
      });

      if (updated) {
        setCategories(categories.map((c) => (c.id === editingCatId ? updated : c)));
        adminService.recordAuditLog({
          adminName: "Alex Vane (Super Admin)",
          action: "CATEGORY_UPDATED",
          entityType: "Category",
          entityId: editingCatId,
          details: `Modified category metadata for "${name}".`,
        });
        addToast({
          title: "Category Updated",
          description: `"${name}" changes saved.`,
          type: "success",
        });
      }
    } else {
      const newCat = await categoryService.createCategory({
        name,
        slug,
        description,
        image,
        featured,
      });
      setCategories([...categories, newCat]);
      adminService.recordAuditLog({
        adminName: "Alex Vane (Super Admin)",
        action: "CATEGORY_CREATED",
        entityType: "Category",
        entityId: newCat.id,
        details: `Created new catalog category "${name}".`,
      });
      addToast({
        title: "Category Published",
        description: `"${name}" added to marketplace taxonomy.`,
        type: "success",
      });
    }

    setIsModalOpen(false);
  };

  const handleDeleteCategory = async (cat: Category) => {
    if (confirm(`Are you sure you want to delete category "${cat.name}"?`)) {
      await categoryService.deleteCategory(cat.id);
      setCategories(categories.filter((c) => c.id !== cat.id));

      adminService.recordAuditLog({
        adminName: "Alex Vane (Super Admin)",
        action: "CATEGORY_DELETED",
        entityType: "Category",
        entityId: cat.id,
        details: `Deleted category "${cat.name}".`,
      });

      addToast({
        title: "Category Deleted",
        description: `"${cat.name}" removed from marketplace.`,
        type: "default",
      });
    }
  };

  const filtered = categories.filter(
    (c) =>
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.slug.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6 pb-12">
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <h1 className="text-2xl font-black text-white tracking-tight">
            Marketplace Taxonomy & Categories
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Create departments, manage megamenu hierarchy, assign cover imagery, and track product density
          </p>
        </div>

        <Button
          onClick={openAddModal}
          size="sm"
          className="bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs gap-1.5 font-bold shadow-md"
        >
          <Plus className="h-4 w-4" />
          <span>New Department</span>
        </Button>
      </div>

      {/* Search Bar */}
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-500" />
        <input
          type="text"
          placeholder="Filter categories by name or slug..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-800 bg-slate-900 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
        />
      </div>

      {/* Grid of Categories */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map((cat) => (
          <div
            key={cat.id}
            className="p-5 rounded-2xl border border-slate-800 bg-slate-900/80 shadow-sm flex flex-col justify-between space-y-4 hover:border-slate-700 transition-colors"
          >
            <div className="flex items-start justify-between gap-3">
              <div className="space-y-1 min-w-0">
                <div className="flex items-center gap-2">
                  <h4 className="font-bold text-sm text-white truncate">{cat.name}</h4>
                  {cat.featured && (
                    <Badge variant="default" className="text-[9px] bg-blue-600/30 text-blue-300 border border-blue-500/40 px-1.5 py-0">
                      Featured
                    </Badge>
                  )}
                </div>
                <p className="font-mono text-xs text-slate-400">/{cat.slug}</p>
                {cat.description && (
                  <p className="text-[11px] text-slate-400 line-clamp-2 pt-1">{cat.description}</p>
                )}
                <span className="text-[11px] text-blue-400 font-semibold block pt-1">
                  {cat.productCount ?? 12} items listed
                </span>
              </div>

              <div className="h-12 w-12 rounded-xl bg-slate-800 border border-slate-700 overflow-hidden relative shrink-0">
                {cat.image ? (
                  <Image src={cat.image} alt={cat.name} fill className="object-cover" />
                ) : (
                  <div className="h-full w-full flex items-center justify-center text-blue-400">
                    <Layers className="h-5 w-5" />
                  </div>
                )}
              </div>
            </div>

            <div className="flex items-center justify-between pt-3 border-t border-slate-800/80">
              <Link href={`/categories/${cat.slug}`} target="_blank" className="text-[11px] text-slate-400 hover:text-white flex items-center gap-1">
                <span>Storefront View</span>
                <ExternalLink className="h-3 w-3" />
              </Link>
              <div className="flex items-center gap-1">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => openEditModal(cat)}
                  className="h-7 w-7 text-slate-400 hover:text-white hover:bg-slate-800"
                  title="Edit category"
                >
                  <Edit2 className="h-3.5 w-3.5" />
                </Button>
                <button
                  onClick={() => handleDeleteCategory(cat)}
                  className="p-1.5 text-slate-400 hover:text-rose-400 rounded-md hover:bg-rose-950/40 transition-colors"
                  title="Delete category"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingCatId ? "Edit Department" : "Create New Department"}
      >
        <form onSubmit={handleSaveCategory} className="space-y-4">
          <div>
            <label className="text-xs font-medium text-slate-300 block mb-1">
              Department Name <span className="text-rose-500">*</span>
            </label>
            <Input
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                if (!editingCatId) {
                  setSlug(e.target.value.toLowerCase().replace(/\s+/g, "-"));
                }
              }}
              required
              className="text-xs h-9 bg-slate-950 border-slate-800 text-white"
            />
          </div>

          <div>
            <label className="text-xs font-medium text-slate-300 block mb-1">
              URL Slug <span className="text-rose-500">*</span>
            </label>
            <Input
              value={slug}
              onChange={(e) => setSlug(e.target.value)}
              required
              className="text-xs h-9 font-mono bg-slate-950 border-slate-800 text-white"
            />
          </div>

          <div>
            <label className="text-xs font-medium text-slate-300 block mb-1">
              Description
            </label>
            <Input
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Short teaser for homepage cards"
              className="text-xs h-9 bg-slate-950 border-slate-800 text-white"
            />
          </div>

          <div>
            <label className="text-xs font-medium text-slate-300 block mb-1">
              Cover Image URL
            </label>
            <Input
              value={image}
              onChange={(e) => setImage(e.target.value)}
              className="text-xs h-9 bg-slate-950 border-slate-800 text-white font-mono"
            />
          </div>

          <label className="flex items-center gap-2 text-xs text-slate-300 cursor-pointer pt-1">
            <input
              type="checkbox"
              checked={featured}
              onChange={(e) => setFeatured(e.target.checked)}
              className="rounded bg-slate-950 border-slate-800 text-blue-600 focus:ring-blue-500 h-4 w-4"
            />
            <span>Highlight as Featured Category on Storefront Homepage</span>
          </label>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-800">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setIsModalOpen(false)}
              className="border-slate-700 text-slate-300"
            >
              Cancel
            </Button>
            <Button type="submit" size="sm" className="bg-blue-600 hover:bg-blue-500 text-white font-bold">
              {editingCatId ? "Save Changes" : "Create Category"}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
