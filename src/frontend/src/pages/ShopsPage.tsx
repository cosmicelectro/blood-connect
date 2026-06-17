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
import {
  ExternalLink,
  MapPin,
  MessageSquare,
  Phone,
  Plus,
  Search,
  ShoppingBag,
  Tag,
} from "lucide-react";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import { ChatDialog } from "../components/ChatDialog";
import { ErrorMessage } from "../components/ErrorMessage";
import { LoadingSpinner } from "../components/LoadingSpinner";
import { useAuth } from "../hooks/useAuth";
import { useAddShop, useShops } from "../hooks/useBackend";

function ShopCard({
  shop,
  index,
  onChat,
  isLoggedIn,
  currentUserId,
}: {
  shop: any;
  index: number;
  onChat: (id: string, name: string) => void;
  isLoggedIn: boolean;
  currentUserId?: string;
}) {
  const { t, i18n } = useTranslation();

  return (
    <article
      className="rounded-lg border border-border bg-card p-5 transition-smooth hover:shadow-md flex flex-col justify-between"
      data-ocid={`shop.item.${index + 1}`}
    >
      <div>
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
        <p className="body-sm mb-3 line-clamp-2 text-muted-foreground">
          {shop.description}
        </p>

        {/* Product Catalog Display */}
        <div className="my-4 border-t border-b border-border/50 py-3">
          <div className="flex items-center gap-1 text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
            <Tag className="h-3 w-3 text-primary" /> {t("productList")}
          </div>
          {shop.products && shop.products.length > 0 ? (
            <div className="space-y-1.5 max-h-[140px] overflow-y-auto scrollbar-thin">
              {shop.products.map((p: any, idx: number) => (
                <div
                  key={p.name + "-" + idx}
                  className="flex justify-between items-center text-xs border-b border-border/30 pb-1 last:border-0 last:pb-0"
                >
                  <span className="font-medium truncate max-w-[170px]">
                    {p.name}
                  </span>
                  <span className="font-bold text-primary font-mono">
                    {p.price.toLocaleString()} BDT
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-xs text-muted-foreground italic text-center py-2">
              {t("noProducts")}
            </div>
          )}
        </div>
      </div>

      <div className="space-y-3 border-t border-border/40 pt-3">
        <div className="space-y-1.5 text-sm text-muted-foreground">
          <div className="flex items-center gap-2">
            <MapPin className="h-3.5 w-3.5 flex-shrink-0" aria-hidden="true" />
            <span className="truncate">{shop.address}</span>
          </div>
          <div className="flex items-center gap-2">
            <Phone className="h-3.5 w-3.5 flex-shrink-0" aria-hidden="true" />
            <a
              href={`tel:${shop.phone}`}
              className="transition-smooth hover:text-primary font-mono"
            >
              {shop.phone}
            </a>
          </div>
        </div>

        {/* Messaging button */}
        {isLoggedIn && currentUserId !== shop.ownerId && (
          <Button
            onClick={() => onChat(shop.ownerId || "shopkeeper-1", shop.name)}
            variant="outline"
            size="sm"
            className="w-full gap-1.5 text-xs font-semibold"
          >
            <MessageSquare className="h-3.5 w-3.5" />
            {i18n.language === "bn" ? "যোগাযোগ করুন" : "Contact Shop"}
          </Button>
        )}
      </div>
    </article>
  );
}

function AddShopDialog({
  open,
  onClose,
}: { open: boolean; onClose: () => void }) {
  const { i18n } = useTranslation();
  const isBn = i18n.language === "bn";
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
      toast.error("Operation failed");
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
          <DialogTitle>{isBn ? "মেডিকেল শপ যুক্ত করুন" : "Add Medical Shop"}</DialogTitle>
          <DialogDescription>
            {isBn ? "একটি মেডিকেল সরঞ্জাম বা সরবরাহকারী দোকান তালিকাভুক্ত করুন।" : "List a medical equipment or supplies shop."}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="shop-name">{isBn ? "দোকানের নাম *" : "Shop Name *"}</Label>
            <Input
              id="shop-name"
              required
              placeholder={isBn ? "মেডিকেয়ার সাপ্লাইস" : "MediCare Supplies"}
              {...field("name")}
              data-ocid="add_shop.name_input"
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="shop-description">{isBn ? "বিবরণ *" : "Description *"}</Label>
            <Textarea
              id="shop-description"
              required
              placeholder={isBn ? "চিকিৎসা সরঞ্জাম, রক্তের ব্যাগ..." : "Medical equipment, blood bags…"}
              {...field("description")}
              data-ocid="add_shop.description_input"
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="shop-address">{isBn ? "ঠিকানা *" : "Address *"}</Label>
            <Input
              id="shop-address"
              required
              placeholder={isBn ? "১২৩ হেলথ স্ট্রিট, শহর" : "123 Health Street, City"}
              {...field("address")}
              data-ocid="add_shop.address_input"
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="shop-phone">{isBn ? "ফোন নম্বর *" : "Phone *"}</Label>
            <Input
              id="shop-phone"
              required
              type="tel"
              placeholder="+৮৮০-XXXX-XXXXXX"
              {...field("phone")}
              data-ocid="add_shop.phone_input"
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="shop-website">{isBn ? "ওয়েবসাইট (ঐচ্ছিক)" : "Website (optional)"}</Label>
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
              {isBn ? "বাতিল করুন" : "Cancel"}
            </Button>
            <Button
              type="submit"
              disabled={addShop.isPending}
              data-ocid="add_shop.submit_button"
            >
              {addShop.isPending ? (isBn ? "যুক্ত করা হচ্ছে..." : "Adding…") : (isBn ? "দোকান যুক্ত করুন" : "Add Shop")}
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
  const [searchQuery, setSearchQuery] = useState("");

  // Messaging state
  const [chatTarget, setChatTarget] = useState<{
    id: string;
    name: string;
  } | null>(null);

  const { role, isLoggedIn, user } = useAuth();
  const { t } = useTranslation();

  const isShopkeeperOrAdmin =
    isLoggedIn && (role === "admin" || role === "shopkeeper");

  const filteredShops = (shops || []).filter(
    (s) =>
      s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.address.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.products.some((p: any) =>
        p.name.toLowerCase().includes(searchQuery.toLowerCase()),
      ),
  );

  return (
    <div className="mx-auto max-w-6xl px-4 py-8" data-ocid="shops.page">
      <div className="mb-8 flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="heading-xl mb-2">{t("medicalShopsTitle")}</h1>
          <p className="body-sm text-muted-foreground">
            {t("medicalShopsSub")}
          </p>
        </div>
        {isShopkeeperOrAdmin && (
          <Button
            onClick={() => setDialogOpen(true)}
            className="flex-shrink-0 gap-2"
            data-ocid="shops.add_shop_button"
          >
            <Plus className="h-4 w-4" aria-hidden="true" />
            {t("addShop")}
          </Button>
        )}
      </div>

      {/* Search Bar */}
      <div className="mb-6 flex gap-2 max-w-md">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder={t("searchShopsPlaceholder")}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>
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

      {!isLoading && !error && filteredShops.length === 0 && (
        <div
          className="flex flex-col items-center gap-3 rounded-xl border border-dashed border-border bg-muted/30 py-16 text-center"
          data-ocid="shops.empty_state"
        >
          <ShoppingBag
            className="h-10 w-10 text-muted-foreground"
            aria-hidden="true"
          />
          <p className="heading-md">{t("noShops")}</p>
          <p className="body-sm max-w-sm">{t("noShopsDesc")}</p>
        </div>
      )}

      {!isLoading && !error && filteredShops.length > 0 && (
        <div
          className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3"
          data-ocid="shops.list"
        >
          {filteredShops.map((shop, i) => (
            <ShopCard
              key={shop.id.toString()}
              shop={shop}
              index={i}
              onChat={(id, name) => setChatTarget({ id, name })}
              isLoggedIn={isLoggedIn}
              currentUserId={user?.id}
            />
          ))}
        </div>
      )}

      <AddShopDialog open={dialogOpen} onClose={() => setDialogOpen(false)} />

      {/* Chat Dialog for Shopkeepers */}
      {chatTarget && (
        <ChatDialog
          isOpen={!!chatTarget}
          onClose={() => setChatTarget(null)}
          receiverId={chatTarget.id}
          receiverName={chatTarget.name}
        />
      )}
    </div>
  );
}
