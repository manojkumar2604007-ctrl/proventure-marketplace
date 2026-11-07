"use client";

import React, { useState, useEffect } from "react";
import { categoryService } from "@/services/category.service";
import { Category } from "@/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useUIStore } from "@/store/ui-store";
import { Layers, Plus, Sparkles } from "lucide-react";

export default function AdminCategoriesPage() {
  const { addToast } = useUIStore();
  const [categories, setCategories] = useState<Category[]>([]);
  const [showAdd, setShowAdd] = useState(false);
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [image, setImage] = useState("");

  useEffect(() => {
    async function load() {
      const data = await categoryService.getCategories();
      setCategories(data);
    }
    load();
  }, []);

  const handleAddCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !slug) return;

    const newCat = await categoryService.createCategory({
      name,
      slug,
      image,
      featured: true,
    });

    setCategories([...categories, newCat]);
    setShowAdd(false);
    setName("");
    setSlug("");
    setImage("");

    addToast({
      title: "Category Created",
      description: `"${newCat.name}" is now live in the marketplace catalog.`,
      type: "success",
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between pb-4 border-b border-slate-800">
        <div>
          <h1 className="text-2xl font-black text-white tracking-tight">
            Marketplace Departments & Categories
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Organize catalog classification, icons, and featured homepage megamenus
          </p>
        </div>

        <Button
          onClick={() => setShowAdd(!showAdd)}
          size="sm"
          className="bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs gap-1.5 font-semibold"
        >
          <Plus className="h-4 w-4" />
          <span>{showAdd ? "Close Form" : "New Department"}</span>
        </Button>
      </div>

      {showAdd && (
        <form
          onSubmit={handleAddCategory}
          className="p-6 rounded-2xl border border-slate-800 bg-slate-900 space-y-4 max-w-lg"
        >
          <h3 className="text-sm font-bold text-white">Create New Department</h3>
          <div>
            <label className="text-xs font-medium text-slate-300 block mb-1">
              Category Name *
            </label>
            <Input
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                setSlug(e.target.value.toLowerCase().replace(/\s+/g, "-"));
              }}
              required
              className="text-xs h-9 bg-slate-950 border-slate-800 text-white"
            />
          </div>
          <div>
            <label className="text-xs font-medium text-slate-300 block mb-1">
              URL Slug *
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
              Cover Image URL
            </label>
            <Input
              value={image}
              onChange={(e) => setImage(e.target.value)}
              className="text-xs h-9 bg-slate-950 border-slate-800 text-white"
            />
          </div>
          <Button type="submit" size="sm" className="bg-indigo-600 text-xs rounded-xl">
            Publish Department
          </Button>
        </form>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {categories.map((cat) => (
          <div
            key={cat.id}
            className="p-5 rounded-2xl border border-slate-800 bg-slate-900/60 shadow-sm flex items-center justify-between"
          >
            <div className="space-y-1">
              <h4 className="font-bold text-sm text-white">{cat.name}</h4>
              <p className="font-mono text-xs text-slate-400">/{cat.slug}</p>
              <span className="text-[11px] text-indigo-400 font-semibold block pt-1">
                {cat.productCount ?? 12} live products
              </span>
            </div>

            <div className="h-10 w-10 rounded-xl bg-indigo-500/10 text-indigo-400 flex items-center justify-center">
              <Layers className="h-5 w-5" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
