"use client";

import React, { useState } from "react";
import Image from "next/image";
import { User, Phone, Mail, Camera, ShieldCheck, CheckCircle2, Lock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useUIStore } from "@/store/ui-store";

export default function CustomerProfilePage() {
  const { addToast } = useUIStore();
  const [name, setName] = useState("Priya Sharma");
  const [email] = useState("customer@example.com");
  const [phone, setPhone] = useState("+91 91234 56789");
  const [avatar, setAvatar] = useState(
    "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=300&auto=format&fit=crop&q=80"
  );
  const [isSaving, setIsSaving] = useState(false);

  const handleAvatarChange = () => {
    // Demo avatar rotation
    const avatars = [
      "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=300&auto=format&fit=crop&q=80",
      "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300&auto=format&fit=crop&q=80",
      "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=300&auto=format&fit=crop&q=80",
    ];
    const nextIdx = (avatars.indexOf(avatar) + 1) % avatars.length;
    setAvatar(avatars[nextIdx]);
    addToast({
      title: "Avatar Preview Updated",
      description: "Click 'Save Changes' to commit your new profile picture.",
      type: "default",
    });
  };

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setTimeout(() => {
      setIsSaving(false);
      addToast({
        title: "Profile Saved",
        description: "Your customer profile information has been successfully updated.",
        type: "success",
      });
    }, 600);
  };

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div className="pb-4 border-b border-border/60">
        <h1 className="heading-1">My Customer Profile</h1>
        <p className="subheading mt-1">
          Manage your personal identity, contact details, and account preferences.
        </p>
      </div>

      <form onSubmit={handleSaveProfile} className="space-y-6 max-w-2xl">
        {/* Avatar Section */}
        <div className="p-6 rounded-2xl border border-border/80 bg-card shadow-subtle flex flex-col sm:flex-row items-center gap-6">
          <div className="relative">
            <div className="relative h-24 w-24 rounded-full overflow-hidden border-4 border-background shadow-card">
              <Image
                src={avatar}
                alt="Profile Avatar"
                fill
                sizes="96px"
                className="object-cover"
              />
            </div>
            <button
              type="button"
              onClick={handleAvatarChange}
              className="absolute bottom-0 right-0 p-2 rounded-full bg-secondary text-white shadow-md hover:bg-secondary/90 transition-transform active:scale-95"
              aria-label="Change profile photo"
            >
              <Camera className="h-4 w-4" />
            </button>
          </div>

          <div className="space-y-1 text-center sm:text-left">
            <h3 className="font-bold text-sm text-primary">Profile Photo</h3>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Upload a clear JPEG, PNG or WebP image. Maximum file size 5MB.
            </p>
            <div className="pt-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleAvatarChange}
                className="text-xs"
              >
                Choose New Picture
              </Button>
            </div>
          </div>
        </div>

        {/* Personal Details */}
        <div className="p-6 rounded-2xl border border-border/80 bg-card shadow-subtle space-y-4">
          <h3 className="font-bold text-sm text-primary border-b border-border/60 pb-3">
            Contact Information
          </h3>

          <div className="space-y-4">
            <Input
              label="Full Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Your full name"
              leftIcon={<User className="h-4 w-4" />}
              required
            />

            <div className="space-y-1.5">
              <Input
                label="Registered Email Address"
                value={email}
                disabled
                leftIcon={<Mail className="h-4 w-4" />}
                helperText="Primary email used for order confirmations and secure OTP logins."
              />
            </div>

            <Input
              label="Mobile Phone Number"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="+91 98765 43210"
              leftIcon={<Phone className="h-4 w-4" />}
              helperText="Used for automated courier delivery dispatch alerts via SMS."
              required
            />
          </div>
        </div>

        {/* Security & Verification Status */}
        <div className="p-6 rounded-2xl border border-border/80 bg-surface/50 shadow-subtle space-y-3">
          <h3 className="font-bold text-sm text-primary">Security &amp; Account Status</h3>
          <div className="flex items-center justify-between text-xs py-2 border-b border-border/60">
            <div className="flex items-center gap-2">
              <ShieldCheck className="h-4 w-4 text-accent" />
              <span>Identity Verification</span>
            </div>
            <Badge variant="success" size="sm" dot>
              Verified via Email
            </Badge>
          </div>
          <div className="flex items-center justify-between text-xs py-2">
            <div className="flex items-center gap-2">
              <Lock className="h-4 w-4 text-secondary" />
              <span>Two-Factor Authentication</span>
            </div>
            <span className="text-muted-foreground font-medium">Configured via SMS</span>
          </div>
        </div>

        {/* Submit Button */}
        <div className="flex items-center gap-3">
          <Button
            type="submit"
            size="lg"
            variant="default"
            isLoading={isSaving}
            className="rounded-xl font-bold shadow-card"
          >
            Save Profile Changes
          </Button>
          <Button
            type="button"
            variant="outline"
            size="lg"
            onClick={() => window.history.back()}
            className="rounded-xl"
          >
            Cancel
          </Button>
        </div>
      </form>
    </div>
  );
}
