import React, { useState } from "react";
import { useAuth } from "../hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Eye, EyeOff } from "lucide-react";
import { toast } from "sonner";

export function ProfilePage() {
  const { user, updatePassword, logout } = useAuth();
  const [oldPwd, setOldPwd] = useState("");
  const [newPwd, setNewPwd] = useState("");
  const [confirmPwd, setConfirmPwd] = useState("");
  const [showPwd, setShowPwd] = useState(false);

  if (!user) {
    return <div className="p-8 text-center">Loading...</div>;
  }

  const handleChange = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPwd !== confirmPwd) {
      toast.error("New passwords do not match");
      return;
    }
    try {
      updatePassword(oldPwd, newPwd);
      toast.success("Password updated successfully");
      setOldPwd("");
      setNewPwd("");
      setConfirmPwd("");
    } catch (err: any) {
      toast.error(err.message || "Failed to update password");
    }
  };

  return (
    <div className="mx-auto max-w-md p-8 space-y-6">
      <h2 className="text-2xl font-bold">Change Password</h2>
      <form onSubmit={handleChange} className="space-y-4">
        <div className="space-y-1">
          <Label htmlFor="oldPwd">Current Password</Label>
          <div className="relative">
            <Input
              id="oldPwd"
              type={showPwd ? "text" : "password"}
              value={oldPwd}
              onChange={e => setOldPwd(e.target.value)}
              required
            />
            <button
              type="button"
              className="absolute right-3 top-2.5 text-muted-foreground"
              onClick={() => setShowPwd(!showPwd)}
            >
              {showPwd ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
        </div>
        <div className="space-y-1">
          <Label htmlFor="newPwd">New Password</Label>
          <div className="relative">
            <Input
              id="newPwd"
              type={showPwd ? "text" : "password"}
              value={newPwd}
              onChange={e => setNewPwd(e.target.value)}
              required
            />
            <button
              type="button"
              className="absolute right-3 top-2.5 text-muted-foreground"
              onClick={() => setShowPwd(!showPwd)}
            >
              {showPwd ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
        </div>
        <div className="space-y-1">
          <Label htmlFor="confirmPwd">Confirm New Password</Label>
          <div className="relative">
            <Input
              id="confirmPwd"
              type={showPwd ? "text" : "password"}
              value={confirmPwd}
              onChange={e => setConfirmPwd(e.target.value)}
              required
            />
            <button
              type="button"
              className="absolute right-3 top-2.5 text-muted-foreground"
              onClick={() => setShowPwd(!showPwd)}
            >
              {showPwd ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
        </div>
        <div className="flex space-x-2 pt-2">
          <Button type="submit">Change Password</Button>
          <Button variant="outline" onClick={logout}>Logout</Button>
        </div>
      </form>
    </div>
  );
}
