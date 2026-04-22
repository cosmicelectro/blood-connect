import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ExternalLink, MapPin, Phone, Plus, ShoppingBag } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { ErrorMessage } from "../components/ErrorMessage";
import { LoadingSpinner } from "../components/LoadingSpinner";
import { useAddShop, useShops } from "../hooks/useBackend";
import type { MedicalShop } from "../types";

function ShopCard({ shop, index }: { shop: MedicalShop; index: number }) {
  return (
    <article
      className="rounded-lg border border-border bg-card p-5 transition-smooth hover:shadow-md"
      data-ocid={`shop.item.${index + 1}`}
    >
      <div className="mb-3 flex items-start justify-between gap-2">
        <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg bg-primary/10">
          <ShoppingBag className="h-5 w-5 text-primary" aria-hidden="true" />
        </div>
        {shop.website && (
          <a
            href={shop.website}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1 text-xs text-primary transition-smooth hover:underline"
            aria-label={`Visit ${shop.name} website`}
          >
            <ExternalLink className="h-3.5 w-3.5" aria-hidden="true" />
            Website
          </a>
        )}
      </div>
      <h3 className="heading-md mb-1">{shop.name}</h3>
      <p className="body-sm mb-3 line-clamp-2">{shop.description}</p>
      <div className="space-y-1.5 text-sm text-muted-foreground">
        <div className="flex items-center gap-2">
          <MapPin className="h-3.5 w-3.5 flex-shrink-0" aria-hidden="true" />
          <span className="truncate">{shop.address}</span>
        </div>
        <div className="flex items-center gap-2">
          <Phone className="h-3.5 w-3.5 flex-shrink-0" aria-hidden="true" />
          <a
            href={`tel:${shop.phone}`}
            className="transition-smooth hover:text-primary"
          >
            {shop.phone}
          </a>
        </div>
      </div>
    </article>
  );
}

function AddShopDialog({
  open,
  onClose,
}: { open: boolean; onClose: () => void }) {
  const [form, setForm] = useState({
    name: "",
    address: "",
    phone: "",
    website: "",
    description: "",
  });
  const addShop = useAddShop();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const result = await addShop.mutateAsync({
      name: form.name,
      address: form.address,
      phone: form.phone,
      website: form.website || null,
      description: form.description,
    });
    if (result.__kind__ === "ok") {
      toast.success("Shop added successfully!");
      onClose();
      setForm({
        name: "",
        address: "",
        phone: "",
        website: "",
        description: "",
      });
    } else {
      toast.error(result.err);
    }
  };

  const field = (id: keyof typeof form) => ({
    value: form[id],
    onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
      setForm((f) => ({ ...f, [id]: e.target.value })),
  });

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent data-ocid="add_shop.dialog">
        <DialogHeader>
          <DialogTitle>Add Medical Shop</DialogTitle>
          <DialogDescription>
            List a medical equipment or supplies shop.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="shop-name">Shop Name *</Label>
            <Input
              id="shop-name"
              required
              placeholder="MediCare Supplies"
              {...field("name")}
              data-ocid="add_shop.name_input"
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="shop-description">Description *</Label>
            <Textarea
              id="shop-description"
              required
              placeholder="Medical equipment, blood bags…"
              {...field("description")}
              data-ocid="add_shop.description_input"
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="shop-address">Address *</Label>
            <Input
              id="shop-address"
              required
              placeholder="123 Health Street, City"
              {...field("address")}
              data-ocid="add_shop.address_input"
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="shop-phone">Phone *</Label>
            <Input
              id="shop-phone"
              required
              type="tel"
              placeholder="+1 (555) 000-0000"
              {...field("phone")}
              data-ocid="add_shop.phone_input"
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="shop-website">Website (optional)</Label>
            <Input
              id="shop-website"
              type="url"
              placeholder="https://example.com"
              {...field("website")}
              data-ocid="add_shop.website_input"
            />
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              data-ocid="add_shop.cancel_button"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={addShop.isPending}
              data-ocid="add_shop.submit_button"
            >
              {addShop.isPending ? "Adding…" : "Add Shop"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export function ShopsPage() {
  const { data: shops, isLoading, error, refetch } = useShops();
  const [dialogOpen, setDialogOpen] = useState(false);

  return (
    <div className="mx-auto max-w-6xl px-4 py-8" data-ocid="shops.page">
      <div className="mb-8 flex items-start justify-between gap-4">
        <div>
          <h1 className="heading-xl mb-2">Medical Instrument Shops</h1>
          <p className="body-sm">
            Partner medical equipment and supply stores near you.
          </p>
        </div>
        <Button
          onClick={() => setDialogOpen(true)}
          className="flex-shrink-0 gap-2"
          data-ocid="shops.add_shop_button"
        >
          <Plus className="h-4 w-4" aria-hidden="true" />
          Add Shop
        </Button>
      </div>

      {isLoading && (
        <div className="py-16" data-ocid="shops.loading_state">
          <LoadingSpinner label="Loading shops…" />
        </div>
      )}

      {error && !isLoading && (
        <ErrorMessage
          message="Failed to load shops. Please try again."
          onRetry={() => refetch()}
        />
      )}

      {!isLoading && !error && (!shops || shops.length === 0) && (
        <div
          className="flex flex-col items-center gap-3 rounded-xl border border-dashed border-border bg-muted/30 py-16 text-center"
          data-ocid="shops.empty_state"
        >
          <ShoppingBag
            className="h-10 w-10 text-muted-foreground"
            aria-hidden="true"
          />
          <p className="heading-md">No shops listed yet</p>
          <p className="body-sm max-w-sm">
            Medical equipment and supply stores will appear here. Use the button
            above to add a shop.
          </p>
        </div>
      )}

      {!isLoading && !error && shops && shops.length > 0 && (
        <div
          className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3"
          data-ocid="shops.list"
        >
          {shops.map((shop, i) => (
            <ShopCard key={shop.id.toString()} shop={shop} index={i} />
          ))}
        </div>
      )}

      <AddShopDialog open={dialogOpen} onClose={() => setDialogOpen(false)} />
    </div>
  );
}
