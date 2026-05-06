"use client";

import { useState, useEffect, useCallback } from "react";
import { useNavigationStore } from "@/store/navigation";
import {
  formatPrice,
  type Product,
  type Category,
} from "@/types";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetFooter,
} from "@/components/ui/sheet";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  ArrowLeft,
  Plus,
  Search,
  Pencil,
  Trash2,
  Package,
  Loader2,
  X,
} from "lucide-react";

interface ProductFormData {
  name: string;
  slug: string;
  description: string;
  content: string;
  categoryId: string;
  price: string;
  comparePrice: string;
  sku: string;
  stock: string;
  status: string;
  featured: boolean;
  professional: boolean;
  usage: string;
}

const emptyForm: ProductFormData = {
  name: "",
  slug: "",
  description: "",
  content: "",
  categoryId: "",
  price: "",
  comparePrice: "",
  sku: "",
  stock: "0",
  status: "active",
  featured: false,
  professional: false,
  usage: "general",
};

function slugify(text: string): string {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

export default function AdminProductsPage() {
  const { navigate } = useNavigationStore();
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [sheetOpen, setSheetOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [form, setForm] = useState<ProductFormData>(emptyForm);
  const [saving, setSaving] = useState(false);
  const [deleteProduct, setDeleteProduct] = useState<Product | null>(null);
  const [deleting, setDeleting] = useState(false);

  const fetchProducts = useCallback(async () => {
    try {
      const res = await fetch("/api/products?limit=100&status=all");
      if (res.ok) {
        const data = await res.json();
        setProducts(data.products || []);
      }
    } catch (error) {
      console.error("Error fetching products:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchCategories = useCallback(async () => {
    try {
      const res = await fetch("/api/categories");
      if (res.ok) {
        const data = await res.json();
        setCategories(data);
      }
    } catch (error) {
      console.error("Error fetching categories:", error);
    }
  }, []);

  useEffect(() => {
    Promise.all([fetchProducts(), fetchCategories()]);
  }, [fetchProducts, fetchCategories]);

  const filteredProducts = products.filter((p) =>
    p.name.toLowerCase().includes(search.toLowerCase())
  );

  const openNewProduct = () => {
    setEditingProduct(null);
    setForm(emptyForm);
    setSheetOpen(true);
  };

  const openEditProduct = (product: Product) => {
    setEditingProduct(product);
    setForm({
      name: product.name,
      slug: product.slug,
      description: product.description || "",
      content: product.content || "",
      categoryId: product.categoryId || "",
      price: product.price.toString(),
      comparePrice: product.comparePrice?.toString() || "",
      sku: product.sku || "",
      stock: product.stock.toString(),
      status: product.status,
      featured: product.featured,
      professional: product.professional,
      usage: product.usage,
    });
    setSheetOpen(true);
  };

  const handleNameChange = (value: string) => {
    setForm((prev) => ({
      ...prev,
      name: value,
      slug: editingProduct ? prev.slug : slugify(value),
    }));
  };

  const handleSave = async () => {
    if (!form.name.trim()) return;
    setSaving(true);
    try {
      const payload = {
        name: form.name,
        slug: form.slug,
        description: form.description || null,
        content: form.content || null,
        categoryId: form.categoryId || null,
        price: parseFloat(form.price) || 0,
        comparePrice: form.comparePrice ? parseFloat(form.comparePrice) : null,
        sku: form.sku || null,
        stock: parseInt(form.stock) || 0,
        status: form.status,
        featured: form.featured,
        professional: form.professional,
        usage: form.usage,
        images: "[]",
        tags: "[]",
      };

      if (editingProduct) {
        const res = await fetch(`/api/products/${editingProduct.slug}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        if (!res.ok) throw new Error("Error updating product");
      } else {
        const res = await fetch("/api/products", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        if (!res.ok) throw new Error("Error creating product");
      }

      setSheetOpen(false);
      setEditingProduct(null);
      setForm(emptyForm);
      await fetchProducts();
    } catch (error) {
      console.error("Error saving product:", error);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteProduct) return;
    setDeleting(true);
    try {
      const res = await fetch(`/api/products/${deleteProduct.slug}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error("Error deleting product");
      setDeleteProduct(null);
      await fetchProducts();
    } catch (error) {
      console.error("Error deleting product:", error);
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-gray-bg">
      {/* Sidebar */}
      <aside className="hidden md:flex md:flex-col md:w-[240px] bg-navy text-white shrink-0">
        <div className="p-6 border-b border-white/10">
          <h1 className="font-heading text-xl font-bold tracking-tight">
            CENPOD Admin
          </h1>
          <p className="text-navy-200 text-xs mt-1">Panel de administración</p>
        </div>
        <nav className="flex-1 p-4 space-y-1">
          <button
            onClick={() => navigate("admin")}
            className="w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium text-navy-200 hover:bg-white/10 hover:text-white transition-colors"
          >
            <ArrowLeft className="size-4" />
            Dashboard
          </button>
          <button className="w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium bg-white/15 text-white">
            <Package className="size-4" />
            Productos
          </button>
        </nav>
        <div className="p-4 border-t border-white/10">
          <button
            onClick={() => navigate("home")}
            className="w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium text-navy-200 hover:bg-white/10 hover:text-white transition-colors"
          >
            <ArrowLeft className="size-4" />
            Volver a la tienda
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 min-h-screen">
        {/* Mobile Header */}
        <div className="md:hidden bg-navy text-white p-4 flex items-center gap-3">
          <button
            onClick={() => navigate("admin")}
            className="p-1 hover:bg-white/10 rounded"
          >
            <ArrowLeft className="size-5" />
          </button>
          <h1 className="font-heading text-lg font-bold">Productos</h1>
        </div>

        {/* Desktop Header */}
        <div className="hidden md:flex items-center justify-between px-8 py-4 bg-white border-b border-border">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate("admin")}
              className="text-navy hover:bg-navy-50"
            >
              <ArrowLeft className="size-4 mr-1" />
              Dashboard
            </Button>
            <div className="h-5 w-px bg-border" />
            <h2 className="font-heading text-xl font-semibold text-navy">
              Productos
            </h2>
          </div>
          <Button
            onClick={openNewProduct}
            className="bg-navy hover:bg-navy-light text-white"
          >
            <Plus className="size-4 mr-2" />
            Nuevo producto
          </Button>
        </div>

        <div className="p-4 md:p-8 space-y-4">
          {/* Mobile New Product Button + Search */}
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
              <Input
                placeholder="Buscar productos..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9 bg-white"
              />
              {search && (
                <button
                  onClick={() => setSearch("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2"
                >
                  <X className="size-4 text-muted-foreground hover:text-foreground" />
                </button>
              )}
            </div>
            <Button
              onClick={openNewProduct}
              className="md:hidden bg-navy hover:bg-navy-light text-white"
            >
              <Plus className="size-4 mr-2" />
              Nuevo producto
            </Button>
          </div>

          {/* Products Table */}
          <Card className="border-0 shadow-sm">
            <CardContent className="p-0">
              {loading ? (
                <div className="p-8 space-y-4">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <div
                      key={i}
                      className="h-12 rounded bg-gray-bg animate-pulse"
                    />
                  ))}
                </div>
              ) : filteredProducts.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16">
                  <Package className="size-12 text-muted-foreground mb-4" />
                  <p className="text-muted-foreground text-sm">
                    {search
                      ? "No se encontraron productos"
                      : "No hay productos aún"}
                  </p>
                  {!search && (
                    <Button
                      variant="outline"
                      onClick={openNewProduct}
                      className="mt-4 border-navy text-navy hover:bg-navy-50"
                    >
                      <Plus className="size-4 mr-2" />
                      Crear producto
                    </Button>
                  )}
                </div>
              ) : (
                <>
                  {/* Desktop Table */}
                  <div className="hidden md:block">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead className="w-[50px]">Imagen</TableHead>
                          <TableHead>Nombre</TableHead>
                          <TableHead>Categoría</TableHead>
                          <TableHead>Precio (MXN)</TableHead>
                          <TableHead>Stock</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead className="text-right">
                            Acciones
                          </TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filteredProducts.map((product) => (
                          <TableRow
                            key={product.id}
                            className="hover:bg-navy-50/30"
                          >
                            <TableCell>
                              <div className="size-10 rounded-lg bg-gradient-to-br from-navy-50 to-blue-light flex items-center justify-center">
                                <Package className="size-4 text-navy/40" />
                              </div>
                            </TableCell>
                            <TableCell>
                              <div>
                                <p className="font-medium text-sm text-navy max-w-[200px] truncate">
                                  {product.name}
                                </p>
                                <p className="text-xs text-muted-foreground">
                                  {product.slug}
                                </p>
                              </div>
                            </TableCell>
                            <TableCell className="text-sm">
                              {product.category?.name || (
                                <span className="text-muted-foreground">—</span>
                              )}
                            </TableCell>
                            <TableCell className="font-semibold text-sm">
                              {formatPrice(product.price)}
                            </TableCell>
                            <TableCell>
                              <Badge
                                variant="outline"
                                className={`border-0 text-xs ${
                                  product.stock > 5
                                    ? "bg-green-50 text-green-700"
                                    : product.stock > 0
                                    ? "bg-amber-50 text-amber-700"
                                    : "bg-red-50 text-red-700"
                                }`}
                              >
                                {product.stock}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              <Badge
                                variant="outline"
                                className={`border-0 text-xs ${
                                  product.status === "active"
                                    ? "bg-green-50 text-green-700"
                                    : "bg-gray-100 text-gray-500"
                                }`}
                              >
                                {product.status === "active"
                                  ? "Activo"
                                  : "Inactivo"}
                              </Badge>
                            </TableCell>
                            <TableCell className="text-right">
                              <div className="flex items-center justify-end gap-1">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => openEditProduct(product)}
                                  className="h-8 w-8 p-0 text-navy hover:bg-navy-50"
                                >
                                  <Pencil className="size-3.5" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => setDeleteProduct(product)}
                                  className="h-8 w-8 p-0 text-red-500 hover:bg-red-50"
                                >
                                  <Trash2 className="size-3.5" />
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>

                  {/* Mobile Cards */}
                  <div className="md:hidden divide-y divide-border">
                    {filteredProducts.map((product) => (
                      <div
                        key={product.id}
                        className="p-4 hover:bg-navy-50/30 transition-colors"
                      >
                        <div className="flex items-start gap-3">
                          <div className="size-10 rounded-lg bg-gradient-to-br from-navy-50 to-blue-light flex items-center justify-center shrink-0">
                            <Package className="size-4 text-navy/40" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between">
                              <p className="font-medium text-sm text-navy truncate pr-2">
                                {product.name}
                              </p>
                              <div className="flex items-center gap-1 shrink-0">
                                <button
                                  onClick={() => openEditProduct(product)}
                                  className="p-1.5 text-navy hover:bg-navy-50 rounded"
                                >
                                  <Pencil className="size-3.5" />
                                </button>
                                <button
                                  onClick={() => setDeleteProduct(product)}
                                  className="p-1.5 text-red-500 hover:bg-red-50 rounded"
                                >
                                  <Trash2 className="size-3.5" />
                                </button>
                              </div>
                            </div>
                            <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                              <span className="text-sm font-semibold text-navy">
                                {formatPrice(product.price)}
                              </span>
                              <Badge
                                variant="outline"
                                className={`border-0 text-xs ${
                                  product.stock > 5
                                    ? "bg-green-50 text-green-700"
                                    : product.stock > 0
                                    ? "bg-amber-50 text-amber-700"
                                    : "bg-red-50 text-red-700"
                                }`}
                              >
                                Stock: {product.stock}
                              </Badge>
                              <Badge
                                variant="outline"
                                className={`border-0 text-xs ${
                                  product.status === "active"
                                    ? "bg-green-50 text-green-700"
                                    : "bg-gray-100 text-gray-500"
                                }`}
                              >
                                {product.status === "active"
                                  ? "Activo"
                                  : "Inactivo"}
                              </Badge>
                            </div>
                            {product.category && (
                              <p className="text-xs text-muted-foreground mt-1">
                                {product.category.name}
                              </p>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </>
              )}

              {/* Product Count */}
              {!loading && filteredProducts.length > 0 && (
                <div className="px-4 py-3 border-t border-border text-xs text-muted-foreground">
                  {filteredProducts.length} producto
                  {filteredProducts.length !== 1 ? "s" : ""}
                  {search && ` encontrado para "${search}"`}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </main>

      {/* New/Edit Product Sheet */}
      <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
        <SheetContent
          side="right"
          className="w-full sm:max-w-lg overflow-y-auto"
        >
          <SheetHeader>
            <SheetTitle className="font-heading text-navy">
              {editingProduct ? "Editar producto" : "Nuevo producto"}
            </SheetTitle>
          </SheetHeader>

          <div className="space-y-5 px-4 pb-4">
            {/* Name */}
            <div className="space-y-2">
              <Label htmlFor="name" className="text-sm font-medium">
                Nombre *
              </Label>
              <Input
                id="name"
                value={form.name}
                onChange={(e) => handleNameChange(e.target.value)}
                placeholder="Nombre del producto"
              />
            </div>

            {/* Slug */}
            <div className="space-y-2">
              <Label htmlFor="slug" className="text-sm font-medium">
                Slug
              </Label>
              <Input
                id="slug"
                value={form.slug}
                onChange={(e) =>
                  setForm((prev) => ({ ...prev, slug: e.target.value }))
                }
                placeholder="slug-del-producto"
              />
            </div>

            {/* Description */}
            <div className="space-y-2">
              <Label htmlFor="description" className="text-sm font-medium">
                Descripción
              </Label>
              <Textarea
                id="description"
                value={form.description}
                onChange={(e) =>
                  setForm((prev) => ({ ...prev, description: e.target.value }))
                }
                placeholder="Descripción breve del producto"
                rows={3}
              />
            </div>

            {/* Content */}
            <div className="space-y-2">
              <Label htmlFor="content" className="text-sm font-medium">
                Contenido (descripción rica)
              </Label>
              <Textarea
                id="content"
                value={form.content}
                onChange={(e) =>
                  setForm((prev) => ({ ...prev, content: e.target.value }))
                }
                placeholder="Descripción detallada del producto"
                rows={5}
              />
            </div>

            {/* Category */}
            <div className="space-y-2">
              <Label className="text-sm font-medium">Categoría</Label>
              <Select
                value={form.categoryId}
                onValueChange={(value) =>
                  setForm((prev) => ({
                    ...prev,
                    categoryId: value === "__none__" ? "" : value,
                  }))
                }
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Seleccionar categoría" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="__none__">
                    Sin categoría
                  </SelectItem>
                  {categories.map((cat) => (
                    <SelectItem key={cat.id} value={cat.id}>
                      {cat.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Price + Compare Price */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="price" className="text-sm font-medium">
                  Precio (MXN) *
                </Label>
                <Input
                  id="price"
                  type="number"
                  value={form.price}
                  onChange={(e) =>
                    setForm((prev) => ({ ...prev, price: e.target.value }))
                  }
                  placeholder="0"
                  min="0"
                  step="0.01"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="comparePrice" className="text-sm font-medium">
                  Precio comparación
                </Label>
                <Input
                  id="comparePrice"
                  type="number"
                  value={form.comparePrice}
                  onChange={(e) =>
                    setForm((prev) => ({
                      ...prev,
                      comparePrice: e.target.value,
                    }))
                  }
                  placeholder="0"
                  min="0"
                  step="0.01"
                />
              </div>
            </div>

            {/* SKU + Stock */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="sku" className="text-sm font-medium">
                  SKU
                </Label>
                <Input
                  id="sku"
                  value={form.sku}
                  onChange={(e) =>
                    setForm((prev) => ({ ...prev, sku: e.target.value }))
                  }
                  placeholder="SKU-001"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="stock" className="text-sm font-medium">
                  Stock
                </Label>
                <Input
                  id="stock"
                  type="number"
                  value={form.stock}
                  onChange={(e) =>
                    setForm((prev) => ({ ...prev, stock: e.target.value }))
                  }
                  min="0"
                />
              </div>
            </div>

            {/* Status Toggle */}
            <div className="flex items-center justify-between py-2">
              <Label className="text-sm font-medium">Estado activo</Label>
              <Switch
                checked={form.status === "active"}
                onCheckedChange={(checked) =>
                  setForm((prev) => ({
                    ...prev,
                    status: checked ? "active" : "inactive",
                  }))
                }
              />
            </div>

            {/* Featured Toggle */}
            <div className="flex items-center justify-between py-2">
              <Label className="text-sm font-medium">Destacado</Label>
              <Switch
                checked={form.featured}
                onCheckedChange={(checked) =>
                  setForm((prev) => ({ ...prev, featured: checked }))
                }
              />
            </div>

            {/* Professional Toggle */}
            <div className="flex items-center justify-between py-2">
              <Label className="text-sm font-medium">Profesional</Label>
              <Switch
                checked={form.professional}
                onCheckedChange={(checked) =>
                  setForm((prev) => ({ ...prev, professional: checked }))
                }
              />
            </div>

            {/* Usage Select */}
            <div className="space-y-2">
              <Label className="text-sm font-medium">Uso</Label>
              <Select
                value={form.usage}
                onValueChange={(value) =>
                  setForm((prev) => ({ ...prev, usage: value }))
                }
              >
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="general">General</SelectItem>
                  <SelectItem value="profesional">Profesional</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <SheetFooter className="flex-row gap-3 border-t pt-4">
            <Button
              variant="outline"
              onClick={() => setSheetOpen(false)}
              className="flex-1"
              disabled={saving}
            >
              Cancelar
            </Button>
            <Button
              onClick={handleSave}
              className="flex-1 bg-navy hover:bg-navy-light text-white"
              disabled={saving || !form.name.trim()}
            >
              {saving ? (
                <>
                  <Loader2 className="size-4 mr-2 animate-spin" />
                  Guardando...
                </>
              ) : editingProduct ? (
                "Guardar cambios"
              ) : (
                "Crear producto"
              )}
            </Button>
          </SheetFooter>
        </SheetContent>
      </Sheet>

      {/* Delete Confirmation */}
      <AlertDialog
        open={!!deleteProduct}
        onOpenChange={(open) => !open && setDeleteProduct(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="font-heading text-navy">
              Eliminar producto
            </AlertDialogTitle>
            <AlertDialogDescription>
              ¿Estás seguro de que quieres eliminar{" "}
              <span className="font-semibold text-foreground">
                {deleteProduct?.name}
              </span>
              ? Esta acción no se puede deshacer.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleting}>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={deleting}
              className="bg-destructive text-white hover:bg-destructive/90"
            >
              {deleting ? (
                <>
                  <Loader2 className="size-4 mr-2 animate-spin" />
                  Eliminando...
                </>
              ) : (
                "Eliminar"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
