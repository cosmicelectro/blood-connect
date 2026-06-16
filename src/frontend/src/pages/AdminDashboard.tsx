import { useState } from "react";
import { useLocalDb, LocalDonor, LocalShop } from "../hooks/useLocalDb";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Users,
  Store,
  Calendar,
  CheckCircle,
  XCircle,
  Plus,
  Trash2,
  Edit,
  Activity,
  HeartPulse,
} from "lucide-react";
import { toast } from "sonner";

export function AdminDashboard() {
  const { donors, shops, deleteDonor, updateDonor, deleteShop, addShop, updateShop } = useLocalDb();

  const [searchQuery, setSearchQuery] = useState("");
  const [editingDonor, setEditingDonor] = useState<LocalDonor | null>(null);
  const [editingShop, setEditingShop] = useState<LocalShop | null>(null);

  const [newShopForm, setNewShopForm] = useState({
    name: "",
    description: "",
    address: "",
    phone: "",
    website: "",
  });

  const availableDonorsCount = donors.filter((d) => d.isAvailable).length;

  const handleToggleDonorAvailability = (id: string, current: boolean) => {
    updateDonor(id, { isAvailable: !current });
    toast.success("Donor availability updated!");
  };

  const handleDeleteDonor = (id: string) => {
    if (confirm("Are you sure you want to delete this donor?")) {
      deleteDonor(id);
      toast.success("Donor profile deleted.");
    }
  };

  const handleDeleteShop = (id: string) => {
    if (confirm("Are you sure you want to delete this shop?")) {
      deleteShop(id);
      toast.success("Medical shop deleted.");
    }
  };

  const handleSaveDonorEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingDonor) return;
    updateDonor(editingDonor.id, {
      name: editingDonor.name,
      address: editingDonor.address,
      phone: editingDonor.phone,
      bloodType: editingDonor.bloodType,
    });
    setEditingDonor(null);
    toast.success("Donor updated successfully");
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
    toast.success("Shop updated successfully");
  };

  const handleAddShopSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    addShop({
      name: newShopForm.name,
      description: newShopForm.description,
      address: newShopForm.address,
      phone: newShopForm.phone,
      website: newShopForm.website || undefined,
      products: [],
    });
    setNewShopForm({ name: "", description: "", address: "", phone: "", website: "" });
    toast.success("New medical shop registered!");
  };

  const filteredDonors = donors.filter(
    (d) =>
      d.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      d.bloodType.toLowerCase().includes(searchQuery.toLowerCase()) ||
      d.address.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 space-y-8" data-ocid="admin.page">
      <div className="border-b border-border pb-4">
        <h1 className="text-3xl font-display font-bold text-foreground tracking-tight">
          Admin Control Center
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          Monitor and manage users, donors, medical shops, and clinical inventory.
        </p>
      </div>

      {/* ── Stats Grid ── */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-xl border border-border bg-card p-5 shadow-sm flex items-center gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 text-primary">
            <Users className="h-6 w-6" />
          </div>
          <div>
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Total Donors</p>
            <p className="text-2xl font-bold font-display">{donors.length}</p>
          </div>
        </div>

        <div className="rounded-xl border border-border bg-card p-5 shadow-sm flex items-center gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-600">
            <CheckCircle className="h-6 w-6" />
          </div>
          <div>
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Active & Ready</p>
            <p className="text-2xl font-bold font-display">{availableDonorsCount}</p>
          </div>
        </div>

        <div className="rounded-xl border border-border bg-card p-5 shadow-sm flex items-center gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-blue-500/10 text-blue-600">
            <Store className="h-6 w-6" />
          </div>
          <div>
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Medical Shops</p>
            <p className="text-2xl font-bold font-display">{shops.length}</p>
          </div>
        </div>

        <div className="rounded-xl border border-border bg-card p-5 shadow-sm flex items-center gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-red-500/10 text-red-500">
            <Activity className="h-6 w-6" />
          </div>
          <div>
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Liters Registered</p>
            <p className="text-2xl font-bold font-display">{(donors.length * 0.47).toFixed(2)}L</p>
          </div>
        </div>
      </div>

      {/* ── Main Workspaces ── */}
      <div className="grid gap-8 lg:grid-cols-3">
        {/* Left Columns - Donors List & Shop Admin */}
        <div className="lg:col-span-2 space-y-6">
          {/* Donors Manager */}
          <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
            <div className="flex justify-between items-center mb-4 gap-4 flex-wrap">
              <h2 className="text-xl font-bold font-display flex items-center gap-2">
                <HeartPulse className="h-5 w-5 text-primary" />
                Manage Donors
              </h2>
              <Input
                placeholder="Search by name, type, location..."
                className="max-w-xs"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm border-collapse">
                <thead>
                  <tr className="border-b border-border text-muted-foreground font-semibold">
                    <th className="py-2">Name</th>
                    <th className="py-2 text-center">Type</th>
                    <th className="py-2">Contact</th>
                    <th className="py-2">Status</th>
                    <th className="py-2 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredDonors.map((donor) => (
                    <tr key={donor.id} className="border-b border-border/60 hover:bg-muted/15">
                      <td className="py-3 font-semibold">
                        {donor.name}
                        <div className="text-xs font-normal text-muted-foreground">{donor.address}</div>
                      </td>
                      <td className="py-3 text-center">
                        <span className="bg-primary/10 text-primary font-mono font-bold px-2 py-0.5 rounded text-xs">
                          {donor.bloodType}
                        </span>
                      </td>
                      <td className="py-3 text-xs">{donor.phone}</td>
                      <td className="py-3">
                        <button
                          type="button"
                          onClick={() => handleToggleDonorAvailability(donor.id, donor.isAvailable)}
                          className={`text-xs font-semibold px-2.5 py-0.5 rounded-full ${
                            donor.isAvailable
                              ? "bg-emerald-500/10 text-emerald-600"
                              : "bg-red-500/10 text-red-500"
                          }`}
                        >
                          {donor.isAvailable ? "Available" : "Unavailable"}
                        </button>
                      </td>
                      <td className="py-3 text-right space-x-2">
                        <button
                          type="button"
                          onClick={() => setEditingDonor(donor)}
                          className="text-blue-500 hover:text-blue-600"
                        >
                          <Edit className="h-4 w-4 inline" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeleteDonor(donor.id)}
                          className="text-red-500 hover:text-red-600"
                        >
                          <Trash2 className="h-4 w-4 inline" />
                        </button>
                      </td>
                    </tr>
                  ))}
                  {filteredDonors.length === 0 && (
                    <tr>
                      <td colSpan={5} className="text-center py-6 text-muted-foreground">
                        No donors found matching criteria.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Medical Shops Manager */}
          <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
            <h2 className="text-xl font-bold font-display flex items-center gap-2 mb-4">
              <Store className="h-5 w-5 text-blue-600" />
              Manage Medical Shops
            </h2>
            <div className="grid gap-4 sm:grid-cols-2">
              {shops.map((shop) => (
                <div key={shop.id} className="border border-border p-4 rounded-lg flex flex-col justify-between hover:shadow-sm">
                  <div>
                    <h3 className="font-bold text-base">{shop.name}</h3>
                    <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{shop.description}</p>
                    <p className="text-xs mt-2 font-mono text-muted-foreground">{shop.address} | {shop.phone}</p>
                    {shop.products.length > 0 && (
                      <div className="mt-2 text-xs">
                        <span className="font-semibold">Products: </span>
                        {shop.products.slice(0, 3).map((p) => p.name).join(", ")}
                        {shop.products.length > 3 && " ..."}
                      </div>
                    )}
                  </div>
                  <div className="flex gap-2 justify-end mt-4">
                    <Button variant="outline" size="sm" onClick={() => setEditingShop(shop)}>
                      <Edit className="h-3.5 w-3.5 mr-1" /> Edit
                    </Button>
                    <Button variant="destructive" size="sm" onClick={() => handleDeleteShop(shop.id)}>
                      <Trash2 className="h-3.5 w-3.5 mr-1" /> Delete
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Columns - Create Shop & Modals */}
        <div className="space-y-6">
          {/* Add Shop Form */}
          <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
            <h2 className="text-lg font-bold font-display mb-4 flex items-center gap-2">
              <Plus className="h-5 w-5 text-emerald-600" />
              Add Medical Shop
            </h2>
            <form onSubmit={handleAddShopSubmit} className="space-y-3">
              <div className="space-y-1">
                <Label htmlFor="s-name">Shop Name</Label>
                <Input
                  id="s-name"
                  placeholder="Medical Supply Store Name"
                  required
                  value={newShopForm.name}
                  onChange={(e) => setNewShopForm({ ...newShopForm, name: e.target.value })}
                />
              </div>
              <div className="space-y-1">
                <Label htmlFor="s-desc">Description</Label>
                <Textarea
                  id="s-desc"
                  placeholder="Items sold, special offers, details..."
                  required
                  rows={2}
                  value={newShopForm.description}
                  onChange={(e) => setNewShopForm({ ...newShopForm, description: e.target.value })}
                />
              </div>
              <div className="space-y-1">
                <Label htmlFor="s-addr">Address</Label>
                <Input
                  id="s-addr"
                  placeholder="Dhanmondi, Dhaka"
                  required
                  value={newShopForm.address}
                  onChange={(e) => setNewShopForm({ ...newShopForm, address: e.target.value })}
                />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-1">
                  <Label htmlFor="s-phone">Phone</Label>
                  <Input
                    id="s-phone"
                    placeholder="Phone number"
                    required
                    value={newShopForm.phone}
                    onChange={(e) => setNewShopForm({ ...newShopForm, phone: e.target.value })}
                  />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="s-web">Website (opt)</Label>
                  <Input
                    id="s-web"
                    placeholder="URL"
                    value={newShopForm.website}
                    onChange={(e) => setNewShopForm({ ...newShopForm, website: e.target.value })}
                  />
                </div>
              </div>
              <Button type="submit" className="w-full mt-2">Create Shop</Button>
            </form>
          </div>
        </div>
      </div>

      {/* Editing Donor Modal */}
      {editingDonor && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <form onSubmit={handleSaveDonorEdit} className="w-full max-w-md bg-card border border-border p-6 rounded-xl space-y-4">
            <h3 className="text-lg font-bold font-display">Edit Donor Profile</h3>
            <div className="space-y-2">
              <div>
                <Label>Full Name</Label>
                <Input
                  required
                  value={editingDonor.name}
                  onChange={(e) => setEditingDonor({ ...editingDonor, name: e.target.value })}
                />
              </div>
              <div>
                <Label>Blood Type</Label>
                <select
                  className="w-full border border-border bg-card p-2 rounded-md"
                  value={editingDonor.bloodType}
                  onChange={(e) => setEditingDonor({ ...editingDonor, bloodType: e.target.value })}
                >
                  {["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"].map((t) => (
                    <option key={t} value={t}>{t}</option>
                  ))}
                </select>
              </div>
              <div>
                <Label>Address</Label>
                <Input
                  required
                  value={editingDonor.address}
                  onChange={(e) => setEditingDonor({ ...editingDonor, address: e.target.value })}
                />
              </div>
              <div>
                <Label>Phone</Label>
                <Input
                  required
                  value={editingDonor.phone}
                  onChange={(e) => setEditingDonor({ ...editingDonor, phone: e.target.value })}
                />
              </div>
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <Button variant="outline" type="button" onClick={() => setEditingDonor(null)}>Cancel</Button>
              <Button type="submit">Save Changes</Button>
            </div>
          </form>
        </div>
      )}

      {/* Editing Shop Modal */}
      {editingShop && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <form onSubmit={handleSaveShopEdit} className="w-full max-w-md bg-card border border-border p-6 rounded-xl space-y-4">
            <h3 className="text-lg font-bold font-display">Edit Medical Shop</h3>
            <div className="space-y-2">
              <div>
                <Label>Shop Name</Label>
                <Input
                  required
                  value={editingShop.name}
                  onChange={(e) => setEditingShop({ ...editingShop, name: e.target.value })}
                />
              </div>
              <div>
                <Label>Description</Label>
                <Textarea
                  required
                  value={editingShop.description}
                  onChange={(e) => setEditingShop({ ...editingShop, description: e.target.value })}
                />
              </div>
              <div>
                <Label>Address</Label>
                <Input
                  required
                  value={editingShop.address}
                  onChange={(e) => setEditingShop({ ...editingShop, address: e.target.value })}
                />
              </div>
              <div>
                <Label>Phone</Label>
                <Input
                  required
                  value={editingShop.phone}
                  onChange={(e) => setEditingShop({ ...editingShop, phone: e.target.value })}
                />
              </div>
              <div>
                <Label>Website (optional)</Label>
                <Input
                  value={editingShop.website || ""}
                  onChange={(e) => setEditingShop({ ...editingShop, website: e.target.value })}
                />
              </div>
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <Button variant="outline" type="button" onClick={() => setEditingShop(null)}>Cancel</Button>
              <Button type="submit">Save Changes</Button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
