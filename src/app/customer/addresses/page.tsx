"use client";

import React, { useState } from "react";
import { MapPin, Plus, Check, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useUIStore } from "@/store/ui-store";

export default function CustomerAddressesPage() {
  const { addToast } = useUIStore();
  const [showAdd, setShowAdd] = useState(false);
  const [addresses, setAddresses] = useState([
    {
      id: "addr_1",
      fullName: "Priya Sharma",
      phone: "+91 91234 56789",
      street: "Flat 402, Oakwood Greens, 100 Feet Rd, Indiranagar",
      city: "Bengaluru",
      state: "Karnataka",
      postalCode: "560038",
      isDefault: true,
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
    },
  ]);

  const [newFull, setNewFull] = useState("");
  const [newPhone, setNewPhone] = useState("");
  const [newStreet, setNewStreet] = useState("");
  const [newCity, setNewCity] = useState("");
  const [newState, setNewState] = useState("");
  const [newPin, setNewPin] = useState("");

  const handleAddAddress = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newFull || !newPhone || !newStreet || !newCity || !newPin) {
      addToast({
        title: "Missing Fields",
        description: "Please fill all required address inputs.",
        type: "error",
      });
      return;
    }

    const newEntry = {
      id: `addr_${Date.now()}`,
      fullName: newFull,
      phone: newPhone,
      street: newStreet,
      city: newCity,
      state: newState || "Karnataka",
      postalCode: newPin,
      isDefault: false,
    };

    setAddresses([...addresses, newEntry]);
    setShowAdd(false);
    setNewFull("");
    setNewPhone("");
    setNewStreet("");
    setNewCity("");
    setNewPin("");

    addToast({
      title: "Address Saved",
      description: "New shipping address added to your address book.",
      type: "success",
    });
  };

  const setDefault = (id: string) => {
    setAddresses(
      addresses.map((a) => ({
        ...a,
        isDefault: a.id === id,
      }))
    );
    addToast({
      title: "Default Updated",
      description: "Default delivery destination updated.",
      type: "default",
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between pb-4 border-b">
        <div>
          <h1 className="text-2xl font-black text-foreground tracking-tight">
            Shipping Address Book
          </h1>
          <p className="text-xs text-muted-foreground mt-0.5">
            Manage multiple delivery destinations for frictionless multi-vendor checkout
          </p>
        </div>

        <Button
          onClick={() => setShowAdd(!showAdd)}
          size="sm"
          className="text-xs gap-1.5 rounded-xl font-semibold"
        >
          <Plus className="h-4 w-4" />
          <span>{showAdd ? "Close" : "Add Address"}</span>
        </Button>
      </div>

      {showAdd && (
        <form
          onSubmit={handleAddAddress}
          className="p-6 rounded-2xl border bg-muted/30 space-y-4"
        >
          <h3 className="text-sm font-bold text-foreground">Add New Address</h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-medium text-foreground block mb-1">
                Full Name
              </label>
              <Input
                value={newFull}
                onChange={(e) => setNewFull(e.target.value)}
                className="text-xs h-9"
                required
              />
            </div>
            <div>
              <label className="text-xs font-medium text-foreground block mb-1">
                Phone Number
              </label>
              <Input
                value={newPhone}
                onChange={(e) => setNewPhone(e.target.value)}
                className="text-xs h-9"
                required
              />
            </div>
            <div className="sm:col-span-2">
              <label className="text-xs font-medium text-foreground block mb-1">
                Street Address
              </label>
              <Input
                value={newStreet}
                onChange={(e) => setNewStreet(e.target.value)}
                className="text-xs h-9"
                required
              />
            </div>
            <div>
              <label className="text-xs font-medium text-foreground block mb-1">
                City
              </label>
              <Input
                value={newCity}
                onChange={(e) => setNewCity(e.target.value)}
                className="text-xs h-9"
                required
              />
            </div>
            <div>
              <label className="text-xs font-medium text-foreground block mb-1">
                Postal Code
              </label>
              <Input
                value={newPin}
                onChange={(e) => setNewPin(e.target.value)}
                className="text-xs h-9"
                required
              />
            </div>
          </div>

          <Button type="submit" size="sm" className="text-xs rounded-xl">
            Save Address
          </Button>
        </form>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {addresses.map((addr) => (
          <div
            key={addr.id}
            className={`p-5 rounded-2xl border bg-card flex flex-col justify-between space-y-4 transition-all ${
              addr.isDefault ? "ring-2 ring-primary border-primary shadow-sm" : ""
            }`}
          >
            <div className="space-y-1 text-xs">
              <div className="flex items-center justify-between">
                <span className="font-bold text-sm text-foreground">
                  {addr.fullName}
                </span>
                {addr.isDefault && (
                  <span className="px-2 py-0.5 rounded-full bg-primary/10 text-primary font-bold text-[10px]">
                    Default
                  </span>
                )}
              </div>
              <p className="text-muted-foreground leading-relaxed pt-1">
                {addr.street}
              </p>
              <p className="text-muted-foreground">
                {addr.city}, {addr.state} - {addr.postalCode}
              </p>
              <p className="text-muted-foreground pt-1">Phone: {addr.phone}</p>
            </div>

            <div className="pt-3 border-t flex items-center justify-between text-xs">
              {!addr.isDefault ? (
                <button
                  onClick={() => setDefault(addr.id)}
                  className="text-xs text-primary hover:underline font-semibold"
                >
                  Set as Default
                </button>
              ) : (
                <span className="text-[11px] text-emerald-600 font-semibold flex items-center gap-1">
                  <Check className="h-3.5 w-3.5" /> Primary Destination
                </span>
              )}

              <button
                onClick={() => setAddresses(addresses.filter((a) => a.id !== addr.id))}
                className="text-muted-foreground hover:text-rose-500 p-1"
                aria-label="Delete address"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
