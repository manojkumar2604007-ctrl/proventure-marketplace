"use client";

import React, { useState, useEffect } from "react";
import { MapPin, Plus, Check, Trash2, Edit2, ShieldCheck, Home, Briefcase } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Modal } from "@/components/ui/modal";
import { Badge } from "@/components/ui/badge";
import { useUIStore } from "@/store/ui-store";

interface AddressItem {
  id: string;
  fullName: string;
  phone: string;
  street: string;
  city: string;
  state: string;
  postalCode: string;
  isDefault: boolean;
  type?: "Home" | "Office" | "Other";
}

export default function CustomerAddressesPage() {
  const { addToast } = useUIStore();
  const [addresses, setAddresses] = useState<AddressItem[]>([
    {
      id: "addr_1",
      fullName: "Priya Sharma",
      phone: "+91 91234 56789",
      street: "Flat 402, Oakwood Greens, 100 Feet Rd, Indiranagar",
      city: "Bengaluru",
      state: "Karnataka",
      postalCode: "560038",
      isDefault: true,
      type: "Home",
    },
    {
      id: "addr_2",
      fullName: "Priya Sharma (Office)",
      phone: "+91 91234 56789",
      street: "EcoWorld Technology Park, Tower 6, Outer Ring Road",
      city: "Bengaluru",
      state: "Karnataka",
      postalCode: "560103",
      isDefault: false,
      type: "Office",
    },
  ]);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingAddressId, setEditingAddressId] = useState<string | null>(null);

  // Sync addresses on mount from API
  useEffect(() => {
    fetch("/api/customer/addresses")
      .then((res) => res.json())
      .then((json) => {
        if (json.success && Array.isArray(json.data) && json.data.length > 0) {
          setAddresses(
            json.data.map((item: any) => ({
              id: item.id,
              fullName: item.fullName,
              phone: item.phone,
              street: item.street,
              city: item.city,
              state: item.state,
              postalCode: item.postalCode,
              isDefault: Boolean(item.isDefault),
              type: item.type === "OFFICE" ? "Office" : "Home",
            }))
          );
        }
      })
      .catch(() => {});
  }, []);

  // Form Fields
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [street, setStreet] = useState("");
  const [city, setCity] = useState("");
  const [state, setState] = useState("Karnataka");
  const [postalCode, setPostalCode] = useState("");
  const [addressType, setAddressType] = useState<"Home" | "Office" | "Other">("Home");

  const openAddModal = () => {
    setEditingAddressId(null);
    setFullName("Priya Sharma");
    setPhone("+91 91234 56789");
    setStreet("");
    setCity("Bengaluru");
    setState("Karnataka");
    setPostalCode("");
    setAddressType("Home");
    setIsModalOpen(true);
  };

  const openEditModal = (addr: AddressItem) => {
    setEditingAddressId(addr.id);
    setFullName(addr.fullName);
    setPhone(addr.phone);
    setStreet(addr.street);
    setCity(addr.city);
    setState(addr.state);
    setPostalCode(addr.postalCode);
    setAddressType(addr.type || "Home");
    setIsModalOpen(true);
  };

  const handleSaveAddress = (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName || !phone || !street || !city || !postalCode) {
      addToast({
        title: "Missing Information",
        description: "Please complete all mandatory address fields.",
        type: "error",
      });
      return;
    }

    if (editingAddressId) {
      // Edit existing
      setAddresses((prev) =>
        prev.map((addr) =>
          addr.id === editingAddressId
            ? {
                ...addr,
                fullName,
                phone,
                street,
                city,
                state,
                postalCode,
                type: addressType,
              }
            : addr
        )
      );

      fetch("/api/customer/addresses", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: editingAddressId,
          fullName,
          phone,
          street,
          city,
          state,
          postalCode,
          type: addressType === "Office" ? "OFFICE" : "SHIPPING",
        }),
      }).catch(() => {});

      addToast({
        title: "Address Updated",
        description: "Your shipping destination has been updated.",
        type: "success",
      });
    } else {
      // Add new
      const tempId = `addr_${Date.now()}`;
      const newAddress: AddressItem = {
        id: tempId,
        fullName,
        phone,
        street,
        city,
        state,
        postalCode,
        isDefault: addresses.length === 0,
        type: addressType,
      };
      setAddresses((prev) => [...prev, newAddress]);

      fetch("/api/customer/addresses", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fullName,
          phone,
          street,
          city,
          state,
          postalCode,
          isDefault: addresses.length === 0,
          type: addressType === "Office" ? "OFFICE" : "SHIPPING",
        }),
      })
        .then((res) => res.json())
        .then((json) => {
          if (json.success && json.data?.id) {
            setAddresses((prev) =>
              prev.map((a) => (a.id === tempId ? { ...a, id: json.data.id } : a))
            );
          }
        })
        .catch(() => {});

      addToast({
        title: "New Address Added",
        description: "Address saved to your address book.",
        type: "success",
      });
    }

    setIsModalOpen(false);
  };

  const handleDeleteAddress = (id: string) => {
    const target = addresses.find((a) => a.id === id);
    if (target?.isDefault && addresses.length > 1) {
      addToast({
        title: "Cannot Delete Default",
        description: "Please select another address as default before deleting this one.",
        type: "error",
      });
      return;
    }

    setAddresses((prev) => prev.filter((a) => a.id !== id));
    fetch(`/api/customer/addresses?id=${encodeURIComponent(id)}`, {
      method: "DELETE",
    }).catch(() => {});

    addToast({
      title: "Address Deleted",
      description: "Address removed from your address book.",
      type: "default",
    });
  };

  const handleSetDefault = (id: string) => {
    setAddresses((prev) =>
      prev.map((a) => ({
        ...a,
        isDefault: a.id === id,
      }))
    );

    fetch("/api/customer/addresses", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, isDefault: true }),
    }).catch(() => {});

    addToast({
      title: "Default Destination Set",
      description: "Future checkouts will auto-select this address.",
      type: "success",
    });
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-border/60">
        <div>
          <h1 className="heading-1">Shipping Address Book</h1>
          <p className="subheading mt-1">
            Manage your verified home, work, and secondary delivery addresses for fast 1-click checkout.
          </p>
        </div>

        <Button
          onClick={openAddModal}
          size="sm"
          className="rounded-xl text-xs font-bold gap-1.5 self-start sm:self-auto"
          leftIcon={<Plus className="h-4 w-4" />}
        >
          Add New Address
        </Button>
      </div>

      {/* Address Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {addresses.map((addr) => (
          <div
            key={addr.id}
            className={`rounded-2xl border p-6 bg-card shadow-subtle hover:shadow-card transition-all flex flex-col justify-between ${
              addr.isDefault
                ? "border-secondary ring-2 ring-secondary/15"
                : "border-border/80"
            }`}
          >
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-base text-primary">
                    {addr.fullName}
                  </span>
                  <Badge variant="subtle" size="sm">
                    {addr.type === "Office" ? (
                      <Briefcase className="h-3 w-3 mr-1 inline" />
                    ) : (
                      <Home className="h-3 w-3 mr-1 inline" />
                    )}
                    {addr.type || "Home"}
                  </Badge>
                </div>
                {addr.isDefault && (
                  <Badge variant="success" size="sm" dot>
                    Default Delivery
                  </Badge>
                )}
              </div>

              <p className="text-xs text-foreground/90 leading-relaxed">
                {addr.street}
                <br />
                {addr.city}, {addr.state} - <strong className="font-mono">{addr.postalCode}</strong>
              </p>

              <p className="text-xs text-muted-foreground">
                Phone: <span className="font-mono text-foreground font-semibold">{addr.phone}</span>
              </p>
            </div>

            {/* Actions */}
            <div className="mt-6 pt-4 border-t border-border/60 flex items-center justify-between text-xs">
              <div>
                {!addr.isDefault ? (
                  <button
                    onClick={() => handleSetDefault(addr.id)}
                    className="text-secondary hover:underline font-semibold"
                  >
                    Set as Default
                  </button>
                ) : (
                  <span className="text-accent font-semibold flex items-center gap-1">
                    <Check className="h-3.5 w-3.5" /> Primary Destination
                  </span>
                )}
              </div>

              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="icon-sm"
                  onClick={() => openEditModal(addr)}
                  aria-label="Edit address"
                >
                  <Edit2 className="h-3.5 w-3.5" />
                </Button>
                <Button
                  variant="outline"
                  size="icon-sm"
                  onClick={() => handleDeleteAddress(addr.id)}
                  className="hover:text-destructive hover:border-destructive/40"
                  aria-label="Delete address"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </Button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Add / Edit Address Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingAddressId ? "Edit Shipping Address" : "Add New Shipping Address"}
        description="Ensure address and pin code match official postal records for prompt delivery."
        footer={
          <>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsModalOpen(false)}
            >
              Cancel
            </Button>
            <Button
              variant="default"
              size="sm"
              onClick={handleSaveAddress}
            >
              {editingAddressId ? "Save Changes" : "Add Address"}
            </Button>
          </>
        }
      >
        <form onSubmit={handleSaveAddress} className="space-y-4 py-2">
          <Input
            label="Recipient Full Name"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            placeholder="e.g. Priya Sharma"
            required
          />

          <Input
            label="Mobile Contact Number"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="+91 98765 43210"
            required
          />

          <Input
            label="Flat / House / Street Address"
            value={street}
            onChange={(e) => setStreet(e.target.value)}
            placeholder="Flat 402, Oakwood Greens, 100 Feet Rd"
            required
          />

          <div className="grid grid-cols-2 gap-3">
            <Input
              label="City"
              value={city}
              onChange={(e) => setCity(e.target.value)}
              placeholder="Bengaluru"
              required
            />
            <Input
              label="PIN Code"
              value={postalCode}
              onChange={(e) => setPostalCode(e.target.value)}
              placeholder="560038"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Input
              label="State"
              value={state}
              onChange={(e) => setState(e.target.value)}
              placeholder="Karnataka"
              required
            />
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold uppercase tracking-wider text-charcoal-700">
                Address Type
              </label>
              <div className="flex gap-2">
                {(["Home", "Office", "Other"] as const).map((t) => (
                  <button
                    key={t}
                    type="button"
                    onClick={() => setAddressType(t)}
                    className={`flex-1 h-10 rounded-lg text-xs font-semibold border transition-all ${
                      addressType === t
                        ? "bg-secondary text-white border-secondary"
                        : "bg-surface border-border text-foreground hover:bg-muted"
                    }`}
                  >
                    {t}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </form>
      </Modal>
    </div>
  );
}
