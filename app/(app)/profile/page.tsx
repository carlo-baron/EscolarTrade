"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { onAuthStateChanged, type User } from "firebase/auth";
import { doc, getDoc, setDoc, serverTimestamp } from "firebase/firestore";
import { auth, db } from "@/lib/firebase"; // assumed: exports your initialized Firebase auth + Firestore
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

const BIO_MAX = 300;
const LOGIN_PATH = "/login"; // change if your sign-in route is different

const YEAR_LEVELS = ["1st Year", "2nd Year", "3rd Year", "4th Year", "5th Year"];

const MEETUP_SPOTS = [
  "Nursing Canteen",
  "Centennial Bldg",
  "Library Lobby",
  "Gate 1",
  "Student Ctr",
  "Admin Lobby",
  "Science Hall",
  "IT Bldg Lobby",
];

type ProfileForm = {
  fullName: string;
  email: string;
  program: string;
  year: string;
  bio: string;
  meetupSpots: string[];
};

const emptyForm = (user: User): ProfileForm => ({
  fullName: user.displayName ?? "",
  email: user.email ?? "",
  program: "",
  year: YEAR_LEVELS[0],
  bio: "",
  meetupSpots: [],
});

// "Beatriz Ramos" -> "Beatriz R."
const shortName = (full: string) => {
  const parts = full.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "Student";
  if (parts.length === 1) return parts[0];
  return `${parts[0]} ${parts[parts.length - 1][0].toUpperCase()}.`;
};

const initials = (full: string) =>
  full
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0].toUpperCase())
    .join("") || "?";

const card = "rounded-lg border border-border bg-card p-4 sm:p-6";

export default function ProfilePage() {
const router = useRouter();

const [user, setUser] = useState<User | null>(null);
const [loading, setLoading] = useState(true);
const [saved, setSaved] = useState<ProfileForm | null>(null); // last saved version
const [form, setForm] = useState<ProfileForm | null>(null);
const [saving, setSaving] = useState(false);
const [status, setStatus] = useState<{ type: "ok" | "error"; text: string } | null>(null);

  
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (!currentUser) {
        router.replace(LOGIN_PATH);
        return;
      }
      setUser(currentUser);

      try {
        const snap = await getDoc(doc(db, "users", currentUser.uid));
        const base = emptyForm(currentUser);
        const data = snap.exists() ? (snap.data() as Partial<ProfileForm>) : {};
        const profile: ProfileForm = {
          ...base,
          ...data,
          email: currentUser.email ?? data.email ?? "", // email always comes from the login
          meetupSpots: data.meetupSpots ?? [],
        };
        setSaved(profile);
        setForm(profile);
      } catch {
        const base = emptyForm(currentUser);
        setSaved(base);
        setForm(base);
        setStatus({ type: "error", text: "Couldn't load your saved profile. Try refreshing." });
      } finally {
        setLoading(false);
      }
    });
    return unsubscribe;
  }, [router]);

  const update = <K extends keyof ProfileForm>(key: K, value: ProfileForm[K]) => {
    setStatus(null);
    setForm((prev) => (prev ? { ...prev, [key]: value } : prev));
  };

  const toggleSpot = (spot: string, checked: boolean) => {
    if (!form) return;
    update(
      "meetupSpots",
      checked ? [...form.meetupSpots, spot] : form.meetupSpots.filter((s) => s !== spot)
    );
  };

  const handleCancel = () => {
    setForm(saved);
    setStatus(null);
  };

  const handleSave = async () => {
    if (!user || !form) return;
    setSaving(true);
    setStatus(null);
    try {
      await setDoc(
        doc(db, "users", user.uid),
        {
          fullName: form.fullName.trim(),
          email: user.email,
          program: form.program.trim(),
          year: form.year,
          bio: form.bio.trim(),
          meetupSpots: form.meetupSpots,
          updatedAt: serverTimestamp(),
        },
        { merge: true }
      );
      setSaved(form);
      setStatus({ type: "ok", text: "Changes saved." });
    } catch {
      setStatus({ type: "error", text: "Couldn't save your changes. Try again." });
    } finally {
      setSaving(false);
    }
  };

  // Loading / redirecting state
  if (loading || !user || !form || !saved) {
    return (
    <main className="mx-auto w-full max-w-2xl space-y-5 px-4 py-6 sm:py-10" aria-busy="true">
      <div className="h-16 animate-pulse rounded-lg bg-muted" />
      <div className="h-28 animate-pulse rounded-lg bg-muted" />
      <div className="h-80 animate-pulse rounded-lg bg-muted" />
      <div className="h-64 animate-pulse rounded-lg bg-muted" />
    </main>
    );
  }

  const hasChanges = JSON.stringify(form) !== JSON.stringify(saved);

  return (
    <main className="mx-auto w-full max-w-2xl space-y-5 px-4 py-6 sm:py-10">
      {/* Page title */}
      <div className="border-b border-border pb-3">
        <h1 className="text-2xl font-bold tracking-tight">Profile &amp; Preferences</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Manage your student profile information and meetup preferences on campus.
        </p>
      </div>

      {/* Profile summary (reflects the saved profile of the logged-in user) */}
      <section className={`${card} flex items-start gap-4`}>
        <Avatar className="size-16 shrink-0 rounded-lg sm:size-20">
          {user.photoURL && <AvatarImage src={user.photoURL} alt={shortName(saved.fullName)} />}
          <AvatarFallback className="rounded-lg bg-muted text-lg font-semibold">
            {initials(saved.fullName)}
          </AvatarFallback>
        </Avatar>
        <div className="min-w-0">
          <div className="flex flex-wrap items-baseline gap-x-2">
            <h2 className="text-xl font-bold">{shortName(saved.fullName)}</h2>
            {(saved.program || saved.year) && (
              <span className="text-xs text-muted-foreground">
                {[saved.program, saved.year.replace(" Year", " Yr")].filter(Boolean).join(" · ")}
              </span>
            )}
          </div>
          <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">
            {saved.bio || "Add a short bio so other students know what you sell."}
          </p>
        </div>
      </section>

      {/* Profile information */}
      <section className={card}>
        <h2 className="text-base font-semibold">Profile Information</h2>
        <p className="mt-0.5 border-b border-border pb-3 text-sm text-muted-foreground">
          Basic details displayed on your listings and chat conversations.
        </p>

        <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="space-y-1.5">
            <Label htmlFor="fullName">Full Name</Label>
            <Input
              id="fullName"
              value={form.fullName}
              onChange={(e) => update("fullName", e.target.value)}
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="email">Email Address</Label>
            <Input id="email" type="email" value={form.email} disabled readOnly />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="program">College Program</Label>
            <Input
              id="program"
              placeholder="e.g. BS Nursing"
              value={form.program}
              onChange={(e) => update("program", e.target.value)}
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="year">Year Level</Label>
            <select
              id="year"
              value={form.year}
              onChange={(e) => update("year", e.target.value)}
              className="h-9 w-full rounded-md border border-input bg-transparent px-3 text-sm shadow-xs outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50"
            >
              {YEAR_LEVELS.map((y) => (
                <option key={y} value={y}>
                  {y}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-1.5 sm:col-span-2">
            <Label htmlFor="bio">Bio</Label>
            <Textarea
              id="bio"
              rows={4}
              maxLength={BIO_MAX}
              placeholder="What do you sell, and when can you meet?"
              value={form.bio}
              onChange={(e) => update("bio", e.target.value)}
              className="resize-none"
            />
            <p className="text-right text-xs text-muted-foreground">
              {form.bio.length} / {BIO_MAX} characters
            </p>
          </div>
        </div>
      </section>

      {/* Meetup preferences */}
      <section className={card}>
        <h2 className="text-base font-semibold">Meetup Preferences</h2>
        <p className="mt-0.5 border-b border-border pb-3 text-sm text-muted-foreground">
          Choose convenient meetup spots. Confirm the location and time with the other person in chat.
        </p>

        <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
          {MEETUP_SPOTS.map((spot) => {
            const id = `spot-${spot.replace(/\s+/g, "-").toLowerCase()}`;
            return (
              <Label
                key={spot}
                htmlFor={id}
                className="flex cursor-pointer items-center gap-2.5 rounded-md border border-border px-3 py-3 text-sm font-normal hover:bg-muted/50"
              >
                <Checkbox
                  id={id}
                  checked={form.meetupSpots.includes(spot)}
                  onCheckedChange={(checked) => toggleSpot(spot, checked === true)}
                />
                {spot}
              </Label>
            );
          })}
        </div>

        <div className="mt-5 flex flex-wrap items-center justify-end gap-3 border-t border-border pt-4">
          {status && (
            <p
              role="status"
              className={`mr-auto text-sm ${
                status.type === "ok" ? "text-green-600" : "text-destructive"
              }`}
            >
              {status.text}
            </p>
          )}
          <Button type="button" variant="secondary" onClick={handleCancel} disabled={!hasChanges || saving}>
            Cancel
          </Button>
          <Button type="button" onClick={handleSave} disabled={!hasChanges || saving}>
            {saving ? "Saving..." : "Save Changes"}
          </Button>
        </div>
      </section>
    </main>
  );
}