import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Edit,
  Globe,
  MapPin,
  MessageSquare,
  Phone,
  Plus,
  PlusCircle,
  Send,
  ShoppingBag,
  Store,
  Trash2,
} from "lucide-react";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import { useAuth } from "../hooks/useAuth";
import { useMessages, useSendMessage } from "../hooks/useBackend";
import { type LocalShop, useLocalDb } from "../hooks/useLocalDb";

export function ShopkeeperDashboard() {
  const { user, language } = useAuth();
  const { t } = useTranslation();
  const {
    shops,
    addShop,
    updateShop,
    deleteShop,
    addShopProduct,
    removeShopProduct,
  } = useLocalDb();

  const [selectedShopId, setSelectedShopId] = useState<string | null>(null);
  const [editingShop, setEditingShop] = useState<LocalShop | null>(null);
  const [isAddingShop, setIsAddingShop] = useState(false);

  // Messages / Inbox management
  const { data: messages } = useMessages(user?.id || "");
  const sendMessage = useSendMessage();
  const [selectedThreadSenderId, setSelectedThreadSenderId] = useState<
    string | null
  >(null);
  const [replyText, setReplyText] = useState("");

  // New product form
  const [productName, setProductName] = useState("");
  const [productPrice, setProductPrice] = useState("");

  // New shop form
  const [newShop, setNewShop] = useState({
    name: "",
    description: "",
    address: "",
    phone: "",
    website: "",
  });

  // Filter shops owned by this shopkeeper
  const myShops = shops.filter((s) => s.ownerId === user?.id);
  const selectedShop = shops.find((s) => s.id === selectedShopId) || myShops[0];

  const handleRegisterShop = (e: React.FormEvent) => {
    e.preventDefault();
    addShop({
      name: newShop.name,
      description: newShop.description,
      address: newShop.address,
      phone: newShop.phone,
      website: newShop.website || undefined,
      ownerId: user?.id,
      products: [],
    });
    setNewShop({
      name: "",
      description: "",
      address: "",
      phone: "",
      website: "",
    });
    setIsAddingShop(false);
    toast.success("Shop registered successfully!");
  };

  const handleAddProduct = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedShop) {
      toast.error("Please select a shop first");
      return;
    }
    const price = Number.parseFloat(productPrice);
    if (!productName || isNaN(price)) {
      toast.error("Enter a valid name and price");
      return;
    }
    addShopProduct(selectedShop.id, { name: productName, price });
    setProductName("");
    setProductPrice("");
    toast.success("Product listed in your catalog!");
  };

  const handleRemoveProduct = (index: number) => {
    if (!selectedShop) return;
    removeShopProduct(selectedShop.id, index);
    toast.success("Product removed");
  };

  const handleSaveShopEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingShop) return;
    updateShop(editingShop.id, {
      name: editingShop.name,
      description: editingShop.description,
      address: editingShop.address,
      phone: editingShop.phone,
      website: editingShop.website,
    });
    setEditingShop(null);
    toast.success("Shop information updated");
  };

  const handleSendReply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!replyText.trim() || !selectedThreadSenderId) return;

    // Find the sender's name
    const firstMsg = (messages || []).find(
      (m) => m.senderId === selectedThreadSenderId,
    );
    const senderName = firstMsg ? firstMsg.senderName : "Customer";

    await sendMessage.mutateAsync({
      senderId: user!.id,
      senderName: user!.name,
      receiverId: selectedThreadSenderId,
      text: replyText.trim(),
    });
    setReplyText("");
  };

  // Group messages by thread sender
  const chatThreadsMap = new Map();
  (messages || []).forEach((m) => {
    const threadPartnerId = m.senderId === user?.id ? m.receiverId : m.senderId;
    if (!chatThreadsMap.has(threadPartnerId)) {
      chatThreadsMap.set(threadPartnerId, {
        partnerName: m.senderId === user?.id ? "Customer" : m.senderName,
        messages: [],
      });
    }
    chatThreadsMap.get(threadPartnerId).messages.push(m);
  });

  const chatThreads = Array.from(chatThreadsMap.entries());
  const selectedThreadMessages = selectedThreadSenderId
    ? (messages || []).filter(
        (m) =>
          (m.senderId === user?.id &&
            m.receiverId === selectedThreadSenderId) ||
          (m.senderId === selectedThreadSenderId && m.receiverId === user?.id),
      )
    : [];

  return (
    <div
      className="mx-auto max-w-6xl px-4 py-8 space-y-6"
      data-ocid="shopkeeper.page"
    >
      <div className="border-b border-border pb-4 flex justify-between items-center flex-wrap gap-4">
        <div>
          <h1 className="text-3xl font-display font-bold text-foreground tracking-tight">
            {t("shopkeeperDashboard")}
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Manage your medical product catalogs, prices, and pharmacy details.
          </p>
        </div>
        <Button onClick={() => setIsAddingShop(true)} className="gap-2">
          <Plus className="h-4 w-4" />
          Add Pharmacy / Supply Store
        </Button>
      </div>

      {myShops.length === 0 && !isAddingShop ? (
        <div className="text-center py-16 border border-dashed border-border rounded-xl bg-card">
          <Store className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-bold font-display">
            No registered shops yet
          </h3>
          <p className="text-sm text-muted-foreground max-w-md mx-auto mt-1 mb-6">
            Register your store details to list blood bags, medical equipment,
            kits, and prices for viewer seekers.
          </p>
          <Button onClick={() => setIsAddingShop(true)}>
            Register Your First Shop
          </Button>
        </div>
      ) : (
        <div className="grid gap-6 lg:grid-cols-3">
          {/* Shop Selector and Details */}
          <div className="space-y-6">
            <div className="rounded-xl border border-border bg-card p-5 shadow-sm space-y-4">
              <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
                Your Outlets
              </h2>
              <div className="space-y-2">
                {myShops.map((s) => (
                  <button
                    key={s.id}
                    type="button"
                    onClick={() => setSelectedShopId(s.id)}
                    className={`w-full text-left p-3 rounded-lg border text-sm font-semibold transition-all ${
                      selectedShop?.id === s.id
                        ? "border-primary bg-primary/5 text-primary"
                        : "border-border hover:bg-muted"
                    }`}
                  >
                    {s.name}
                    <div className="text-xs font-normal text-muted-foreground mt-0.5 truncate">
                      {s.address}
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {selectedShop && (
              <div className="rounded-xl border border-border bg-card p-5 shadow-sm space-y-4">
                <div className="flex justify-between items-start">
                  <h3 className="font-bold text-lg font-display">
                    {selectedShop.name}
                  </h3>
                  <button
                    type="button"
                    onClick={() => setEditingShop(selectedShop)}
                    className="text-primary hover:underline text-xs font-semibold flex items-center gap-1"
                  >
                    <Edit className="h-3.5 w-3.5" /> Edit
                  </button>
                </div>
                <p className="text-sm text-muted-foreground">
                  {selectedShop.description}
                </p>

                <div className="space-y-2 text-xs border-t border-border pt-4">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <MapPin className="h-3.5 w-3.5 flex-shrink-0" />
                    <span>{selectedShop.address}</span>
                  </div>
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Phone className="h-3.5 w-3.5 flex-shrink-0" />
                    <span>{selectedShop.phone}</span>
                  </div>
                  {selectedShop.website && (
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Globe className="h-3.5 w-3.5 flex-shrink-0" />
                      <a
                        href={selectedShop.website}
                        target="_blank"
                        rel="noreferrer"
                        className="text-primary hover:underline"
                      >
                        {selectedShop.website}
                      </a>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Catalog & Prices management & Customer Chat Box */}
          {selectedShop && (
            <div className="lg:col-span-2 space-y-6">
              {/* Product Catalog list builder */}
              <div className="rounded-xl border border-border bg-card p-6 shadow-sm space-y-6">
                <div className="flex justify-between items-center border-b border-border pb-3">
                  <h2 className="text-xl font-bold font-display flex items-center gap-2">
                    <ShoppingBag className="h-5 w-5 text-primary" />
                    Catalog & Price Book ({selectedShop.products.length})
                  </h2>
                </div>

                <form
                  onSubmit={handleAddProduct}
                  className="grid sm:grid-cols-3 gap-3 bg-muted/30 p-4 rounded-lg"
                >
                  <div className="sm:col-span-2 space-y-1">
                    <Label htmlFor="p-name" className="text-xs">
                      Product Name
                    </Label>
                    <Input
                      id="p-name"
                      placeholder="Blood bag, Syringe, Test kit..."
                      required
                      value={productName}
                      onChange={(e) => setProductName(e.target.value)}
                    />
                  </div>
                  <div className="space-y-1">
                    <Label htmlFor="p-price" className="text-xs">
                      Price (BDT)
                    </Label>
                    <div className="flex gap-2">
                      <Input
                        id="p-price"
                        placeholder="1200"
                        type="number"
                        required
                        value={productPrice}
                        onChange={(e) => setProductPrice(e.target.value)}
                      />
                      <Button
                        type="submit"
                        size="icon"
                        className="flex-shrink-0"
                      >
                        <PlusCircle className="h-5 w-5" />
                      </Button>
                    </div>
                  </div>
                </form>

                <div className="grid gap-2 sm:grid-cols-2 max-h-[200px] overflow-y-auto pr-1">
                  {selectedShop.products.length === 0 ? (
                    <div className="col-span-2 text-center py-8 text-muted-foreground text-xs italic">
                      No products added yet.
                    </div>
                  ) : (
                    selectedShop.products.map((prod, idx) => (
                      <div
                        key={prod.name + "-" + idx}
                        className="flex items-center justify-between border border-border/60 p-3 rounded-lg bg-card hover:bg-muted/10"
                      >
                        <div>
                          <div className="text-sm font-semibold">
                            {prod.name}
                          </div>
                          <div className="text-xs text-primary font-bold">
                            {prod.price.toLocaleString()} BDT
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleRemoveProduct(idx)}
                          className="text-red-500 hover:bg-red-50 p-1.5 rounded-full"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* Chat Inquiries Inbox */}
              <section className="rounded-xl border border-border bg-card p-6 shadow-sm space-y-4">
                <h2 className="text-lg font-bold font-display flex items-center gap-2 border-b border-border pb-3">
                  <MessageSquare className="h-5 w-5 text-primary" />
                  {t("inbox")}
                </h2>

                {chatThreads.length === 0 ? (
                  <div className="text-center py-10 text-xs text-muted-foreground italic">
                    No customer messages received yet.
                  </div>
                ) : (
                  <div className="grid gap-4 sm:grid-cols-3">
                    <div className="space-y-1 sm:col-span-1 border-r border-border pr-3 h-64 overflow-y-auto">
                      {chatThreads.map(([partnerId, data]: any) => (
                        <button
                          key={partnerId}
                          onClick={() => setSelectedThreadSenderId(partnerId)}
                          className={`w-full text-left p-2 rounded text-xs font-semibold truncate ${
                            selectedThreadSenderId === partnerId
                              ? "bg-primary/10 text-primary"
                              : "hover:bg-muted text-foreground"
                          }`}
                        >
                          {data.partnerName}
                          <span className="block text-[9px] font-normal text-muted-foreground">
                            {data.messages.length} Messages
                          </span>
                        </button>
                      ))}
                    </div>

                    <div className="sm:col-span-2 flex flex-col justify-between h-64">
                      {selectedThreadSenderId ? (
                        <>
                          <div className="flex-1 overflow-y-auto space-y-2 p-2 bg-muted/20 rounded-lg">
                            {selectedThreadMessages.map((msg) => {
                              const isMe = msg.senderId === user?.id;
                              return (
                                <div
                                  key={msg.id}
                                  className={`max-w-[85%] ${isMe ? "ml-auto text-right" : "mr-auto text-left"}`}
                                >
                                  <div
                                    className={`p-2 rounded text-xs inline-block font-medium ${
                                      isMe
                                        ? "bg-primary text-primary-foreground"
                                        : "bg-card text-foreground border border-border"
                                    }`}
                                  >
                                    {msg.text}
                                  </div>
                                </div>
                              );
                            })}
                          </div>

                          <form
                            onSubmit={handleSendReply}
                            className="flex gap-2 pt-2"
                          >
                            <Input
                              placeholder="Type reply..."
                              value={replyText}
                              onChange={(e) => setReplyText(e.target.value)}
                              className="flex-1 text-xs h-8"
                            />
                            <Button
                              type="submit"
                              size="icon"
                              className="h-8 w-8"
                            >
                              <Send className="h-3.5 w-3.5" />
                            </Button>
                          </form>
                        </>
                      ) : (
                        <div className="text-center text-xs text-muted-foreground py-24 italic">
                          Select a customer conversation to read messages.
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </section>
            </div>
          )}
        </div>
      )}

      {/* Register Outlet Modal */}
      {isAddingShop && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <form
            onSubmit={handleRegisterShop}
            className="w-full max-w-md bg-card border border-border p-6 rounded-xl space-y-4"
          >
            <h3 className="text-lg font-bold font-display">Register Outlet</h3>
            <div className="space-y-2">
              <div>
                <Label>Store Outlet Name</Label>
                <Input
                  required
                  placeholder="MediLife Supplies"
                  value={newShop.name}
                  onChange={(e) =>
                    setNewShop({ ...newShop, name: e.target.value })
                  }
                />
              </div>
              <div>
                <Label>Description</Label>
                <Textarea
                  required
                  placeholder="List surgical items..."
                  value={newShop.description}
                  onChange={(e) =>
                    setNewShop({ ...newShop, description: e.target.value })
                  }
                />
              </div>
              <div>
                <Label>Address</Label>
                <Input
                  required
                  placeholder="Banani, Dhaka"
                  value={newShop.address}
                  onChange={(e) =>
                    setNewShop({ ...newShop, address: e.target.value })
                  }
                />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <Label>Phone</Label>
                  <Input
                    required
                    placeholder="+880..."
                    value={newShop.phone}
                    onChange={(e) =>
                      setNewShop({ ...newShop, phone: e.target.value })
                    }
                  />
                </div>
                <div>
                  <Label>Website</Label>
                  <Input
                    placeholder="URL"
                    value={newShop.website}
                    onChange={(e) =>
                      setNewShop({ ...newShop, website: e.target.value })
                    }
                  />
                </div>
              </div>
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <Button
                variant="outline"
                type="button"
                onClick={() => setIsAddingShop(false)}
              >
                Cancel
              </Button>
              <Button type="submit">Register Shop</Button>
            </div>
          </form>
        </div>
      )}

      {/* Editing Shop Modal */}
      {editingShop && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <form
            onSubmit={handleSaveShopEdit}
            className="w-full max-w-md bg-card border border-border p-6 rounded-xl space-y-4"
          >
            <h3 className="text-lg font-bold font-display">Edit Shop Info</h3>
            <div className="space-y-2">
              <div>
                <Label>Outlet Name</Label>
                <Input
                  required
                  value={editingShop.name}
                  onChange={(e) =>
                    setEditingShop({ ...editingShop, name: e.target.value })
                  }
                />
              </div>
              <div>
                <Label>Description</Label>
                <Textarea
                  required
                  value={editingShop.description}
                  onChange={(e) =>
                    setEditingShop({
                      ...editingShop,
                      description: e.target.value,
                    })
                  }
                />
              </div>
              <div>
                <Label>Address</Label>
                <Input
                  required
                  value={editingShop.address}
                  onChange={(e) =>
                    setEditingShop({ ...editingShop, address: e.target.value })
                  }
                />
              </div>
              <div>
                <Label>Phone</Label>
                <Input
                  required
                  value={editingShop.phone}
                  onChange={(e) =>
                    setEditingShop({ ...editingShop, phone: e.target.value })
                  }
                />
              </div>
              <div>
                <Label>Website (optional)</Label>
                <Input
                  value={editingShop.website || ""}
                  onChange={(e) =>
                    setEditingShop({ ...editingShop, website: e.target.value })
                  }
                />
              </div>
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <Button
                variant="outline"
                type="button"
                onClick={() => setEditingShop(null)}
              >
                Cancel
              </Button>
              <Button type="submit">Save Changes</Button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
