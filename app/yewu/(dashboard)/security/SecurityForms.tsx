"use client";

import { useActionState } from "react";
import { changeAdminPasswordAction } from "@/lib/actions/admin";
import { suspendUserAction, reactivateUserAction } from "@/lib/actions/users";
import { TextField } from "@/components/ui/Field";
import { Button } from "@/components/ui/Button";

const initialState = {};

export function ChangePasswordForm() {
  const [state, formAction, pending] = useActionState(changeAdminPasswordAction, initialState as any);

  return (
    <form action={formAction} className="flex flex-col gap-4 max-w-sm">
      <TextField
        label="Current Password"
        name="currentPassword"
        type="password"
        required
      />
      <TextField
        label="New Password"
        name="newPassword"
        type="password"
        required
      />
      <TextField
        label="Confirm New Password"
        name="confirmPassword"
        type="password"
        required
      />

      {state.error && <p className="text-sm text-red">{state.error}</p>}
      {state.success && <p className="text-sm text-green">{state.success}</p>}

      <Button type="submit" disabled={pending} variant="secondary">
        {pending ? "Changing Password…" : "Change Password"}
      </Button>
    </form>
  );
}

export function SuspendUserButton({ userId, status }: { userId: string; status: "ACTIVE" | "SUSPENDED" }) {
  const isSuspended = status === "SUSPENDED";
  const [state, formAction, pending] = useActionState(
    async (_prevState: any, _formData: FormData) => {
      const data = new FormData();
      data.append("userId", userId);
      if (isSuspended) {
        await reactivateUserAction(data);
      } else {
        await suspendUserAction(data);
      }
      return {};
    },
    {}
  );

  return (
    <form action={formAction} className="inline">
      <button
        type="submit"
        disabled={pending}
        className={`text-xs font-semibold px-2.5 py-1 rounded border transition disabled:opacity-50 ${
          isSuspended
            ? "border-green/30 text-green bg-green/10 hover:bg-green/20 hover:text-white"
            : "border-red/30 text-red bg-red/10 hover:bg-red/20 hover:text-white"
        }`}
      >
        {pending ? "Updating…" : isSuspended ? "Reactivate" : "Suspend / Ban"}
      </button>
    </form>
  );
}

import { useEffect, useState } from "react";

export function ChangeNicknameForm() {
  const [profileName, setProfileName] = useState("");
  const [nicknameInput, setNicknameInput] = useState("");
  const [updating, setUpdating] = useState(false);
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");

  const fetchProfile = async () => {
    try {
      const res = await fetch("/api/users/me");
      const resData = await res.json();
      if (res.ok && resData.success) {
        setProfileName(resData.data.name || "");
        setNicknameInput(resData.data.name || "");
      }
    } catch (err) {
      console.error("Failed to load profile:", err);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nicknameInput.trim()) return;
    setUpdating(true);
    setSuccess("");
    setError("");
    try {
      const res = await fetch("/api/users/me", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ displayName: nicknameInput }),
      });
      const resData = await res.json();
      if (res.ok && resData.success) {
        setProfileName(resData.data.displayName);
        setSuccess("Nickname updated successfully! Please refresh the page to see it in the header.");
        setTimeout(() => setSuccess(""), 5000);
      } else {
        setError(resData.message || "Failed to update nickname");
      }
    } catch (err: any) {
      setError(err.message || "Failed to update nickname");
    } finally {
      setUpdating(false);
    }
  };

  return (
    <form onSubmit={handleUpdate} className="flex flex-col gap-4 max-w-sm">
      <div className="flex flex-col gap-1.5">
        <label className="text-xs text-muted font-medium">Current Nickname</label>
        <div className="text-sm font-semibold text-foreground bg-surface-2 border border-border/50 px-3.5 py-2.5 rounded-lg leading-[18px]">
          {profileName || "Loading..."}
        </div>
      </div>

      <div className="flex flex-col gap-1.5">
        <label className="text-xs text-muted font-medium">New Nickname</label>
        <input
          type="text"
          value={nicknameInput}
          onChange={(e) => setNicknameInput(e.target.value)}
          className="rounded-lg bg-surface border border-border px-3.5 py-2 text-sm text-foreground outline-none focus:border-gold/60 w-full"
          required
        />
      </div>

      {error && <p className="text-sm text-red">{error}</p>}
      {success && <p className="text-sm text-green">{success}</p>}

      <Button type="submit" disabled={updating} variant="secondary">
        {updating ? "Saving Nickname…" : "Save Nickname"}
      </Button>
    </form>
  );
}
