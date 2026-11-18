"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { onAuthStateChanged, type User } from "firebase/auth";
import {
  deleteField,
  doc,
  getDoc,
  serverTimestamp,
  setDoc,
} from "firebase/firestore";

import { auth, db } from "@/lib/firebase";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupText,
  InputGroupTextarea,
} from "@/components/ui/input-group";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { PROGRAMS, YEAR_LEVELS } from "@/types/school.types";
import { locations } from "@/types/market.types";

const DISPLAY_NAME_MAX = 60;
const BIO_MAX = 300;
const MAX_MEETUP_LOCATIONS = 3;

type ProfileForm = {
  displayName: string;
  program: string;
  yearLevel: string;
  bio: string;
  meetupLocations: string[];
};

type StatusMessage = {
  type: "success" | "error";
  text: string;
};

const cardClassName = "rounded-lg border border-border bg-card p-4 sm:p-6";

function createEmptyProfile(user: User): ProfileForm {
  return {
    displayName: user.displayName ?? "",
    program: "",
    yearLevel: YEAR_LEVELS[0]?.value ?? "",
    bio: "",
    meetupLocations: [],
  };
}

function shortName(name: string) {
  const parts = name.trim().split(/\s+/).filter(Boolean);

  if (parts.length === 0) return "Student";
  if (parts.length === 1) return parts[0];

  return `${parts[0]} ${parts.at(-1)?.[0].toUpperCase()}.`;
}

function initials(name: string) {
  return (
    name
      .trim()
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part[0].toUpperCase())
      .join("") || "?"
  );
}

function isProgram(value: unknown): value is string {
  return (
    typeof value === "string" &&
    PROGRAMS.some((program) => program.value === value)
  );
}

function isYearLevel(value: unknown): value is string {
  return (
    typeof value === "string" &&
    YEAR_LEVELS.some((yearLevel) => yearLevel.value === value)
  );
}

export default function ProfilePage() {
  const router = useRouter();

  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);
  const [saved, setSaved] = useState<ProfileForm | null>(null);
  const [form, setForm] = useState<ProfileForm | null>(null);
  const [saving, setSaving] = useState(false);
  const [status, setStatus] = useState<StatusMessage | null>(null);

  useEffect(() => {
    let active = true;

    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (!currentUser) {
        router.replace("/auth");
        return;
      }

      setUser(currentUser);
      setLoading(true);
      setLoadError(false);

      try {
        const snapshot = await getDoc(doc(db, "users", currentUser.uid));
        const data = snapshot.exists() ? snapshot.data() : {};
        const defaults = createEmptyProfile(currentUser);

        const meetupLocations = Array.isArray(data.meetupLocations)
          ? locations
              .filter((location) => data.meetupLocations.includes(location))
              .slice(0, MAX_MEETUP_LOCATIONS)
          : [];

        const profile: ProfileForm = {
          displayName:
            typeof data.displayName === "string"
              ? data.displayName
              : defaults.displayName,
          program: isProgram(data.program) ? data.program : "",
          yearLevel: isYearLevel(data.yearLevel)
            ? data.yearLevel
            : defaults.yearLevel,
          bio: typeof data.bio === "string" ? data.bio.slice(0, BIO_MAX) : "",
          meetupLocations,
        };

        if (!active) return;

        setSaved(profile);
        setForm(profile);
      } catch {
        if (active) setLoadError(true);
      } finally {
        if (active) setLoading(false);
      }
    });

    return () => {
      active = false;
      unsubscribe();
    };
  }, [router]);

  function update<K extends keyof ProfileForm>(
    key: K,
    value: ProfileForm[K]
  ) {
    setStatus(null);
    setForm((current) => (current ? { ...current, [key]: value } : current));
  }

  function toggleMeetupLocation(location: string, checked: boolean) {
    if (!form) return;

    const nextLocations = checked
      ? [...form.meetupLocations, location]
      : form.meetupLocations.filter((item) => item !== location);

    update(
      "meetupLocations",
      [...new Set(nextLocations)].slice(0, MAX_MEETUP_LOCATIONS)
    );
  }

  function handleCancel() {
    setForm(saved);
    setStatus(null);
  }

  async function handleSave() {
    if (!user || !form) return;

    const displayName = form.displayName.trim();
    const bio = form.bio.trim();

    if (
      displayName.length < 2 ||
      displayName.length > DISPLAY_NAME_MAX
    ) {
      setStatus({
        type: "error",
        text: `Display name must be between 2 and ${DISPLAY_NAME_MAX} characters.`,
      });
      return;
    }

    if (bio.length > BIO_MAX) {
      setStatus({
        type: "error",
        text: `Bio must not exceed ${BIO_MAX} characters.`,
      });
      return;
    }

    const updatedProfile: ProfileForm = {
      ...form,
      displayName,
      bio,
      meetupLocations: [...new Set(form.meetupLocations)].slice(
        0,
        MAX_MEETUP_LOCATIONS
      ),
    };

    setSaving(true);
    setStatus(null);

    try {
      await setDoc(
        doc(db, "users", user.uid),
        {
          displayName: updatedProfile.displayName,
          program: updatedProfile.program || deleteField(),
          yearLevel: updatedProfile.yearLevel,
          bio: updatedProfile.bio,
          meetupLocations: updatedProfile.meetupLocations,
          updatedAt: serverTimestamp(),
        },
        { merge: true }
      );

      setSaved(updatedProfile);
      setForm(updatedProfile);
      setStatus({ type: "success", text: "Changes saved." });
    } catch {
      setStatus({
        type: "error",
        text: "Could not save your changes. Please try again.",
      });
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <main
        className="mx-auto w-full max-w-2xl px-4 py-6 sm:py-10"
        aria-busy="true"
        role="status"
      >
        <p className="text-sm text-muted-foreground">Loading profile…</p>
      </main>
    );
  }

  if (loadError || !user || !form || !saved) {
    return (
      <main className="mx-auto w-full max-w-2xl space-y-4 px-4 py-6 sm:py-10">
        <h1 className="text-2xl font-bold tracking-tight">
          Profile &amp; Preferences
        </h1>
        <p className="text-sm text-destructive">
          Could not load your saved profile. Your changes have not been enabled.
        </p>
        <Button
          type="button"
          variant="secondary"
          onClick={() => window.location.reload()}
        >
          Try again
        </Button>
      </main>
    );
  }

  const hasChanges = JSON.stringify(form) !== JSON.stringify(saved);

  const programLabel = PROGRAMS.find(
    (program) => program.value === saved.program
  )?.label;

  const yearLabel = YEAR_LEVELS.find(
    (yearLevel) => yearLevel.value === saved.yearLevel
  )?.label;

  const profileSubtitle = [programLabel, yearLabel]
    .filter(Boolean)
    .join(" · ");

  return (
    <main className="mx-auto w-full max-w-2xl space-y-5 px-4 py-6 sm:py-10">
      <header className="border-b border-border pb-3">
        <h1 className="text-2xl font-bold tracking-tight">
          Profile &amp; Preferences
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Manage your profile information and preferred campus meetup locations.
        </p>
      </header>

      <section className={`${cardClassName} flex items-start gap-4`}>
        <Avatar className="size-16 shrink-0 rounded-lg sm:size-20">
          {user.photoURL && (
            <AvatarImage
              src={user.photoURL}
              alt={shortName(saved.displayName)}
            />
          )}
          <AvatarFallback>{initials(saved.displayName)}</AvatarFallback>
        </Avatar>

        <div className="min-w-0">
          <h2 className="text-xl font-bold">
            {shortName(saved.displayName)}
          </h2>

          {profileSubtitle && (
            <p className="text-xs text-muted-foreground">{profileSubtitle}</p>
          )}

          <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">
            {saved.bio || "Add a short bio so other students know what you sell."}
          </p>
        </div>
      </section>

      <section className={cardClassName}>
        <h2 className="text-base font-semibold">Profile Information</h2>
        <p className="mt-0.5 border-b border-border pb-3 text-sm text-muted-foreground">
          These details can appear on your listings and in chat.
        </p>

        <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="space-y-1.5">
            <Label htmlFor="displayName">Display Name</Label>
            <Input
              id="displayName"
              value={form.displayName}
              maxLength={DISPLAY_NAME_MAX}
              onChange={(event) =>
                update("displayName", event.target.value)
              }
            />
            <p className="text-right text-xs text-muted-foreground">
              {form.displayName.length} / {DISPLAY_NAME_MAX}
            </p>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="email">Email Address</Label>
            <Input
              id="email"
              type="email"
              value={user.email ?? ""}
              disabled
              readOnly
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="program">Degree Program</Label>
            <Select
              id="program"
              name="program"
              items={PROGRAMS}
              value={form.program || null}
              onValueChange={(value) => update("program", value ?? "")}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select a program" />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  {PROGRAMS.map((program) => (
                    <SelectItem key={program.value} value={program.value}>
                      {program.label}
                    </SelectItem>
                  ))}
                </SelectGroup>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="yearLevel">Year Level</Label>
            <Select
              id="yearLevel"
              name="yearLevel"
              items={YEAR_LEVELS}
              value={form.yearLevel || null}
              onValueChange={(value) => update("yearLevel", value ?? "")}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select year level" />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  {YEAR_LEVELS.map((yearLevel) => (
                    <SelectItem key={yearLevel.value} value={yearLevel.value}>
                      {yearLevel.label}
                    </SelectItem>
                  ))}
                </SelectGroup>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1.5 sm:col-span-2">
            <Label htmlFor="bio">Bio</Label>
            <InputGroup>
              <InputGroupTextarea
                id="bio"
                rows={4}
                maxLength={BIO_MAX}
                placeholder="What do you sell, and when can you meet?"
                value={form.bio}
                onChange={(event) => update("bio", event.target.value)}
                className="min-h-24 resize-none"
              />
              <InputGroupAddon align="block-end">
                <InputGroupText>
                  {form.bio.length} / {BIO_MAX}
                </InputGroupText>
              </InputGroupAddon>
            </InputGroup>
          </div>
        </div>
      </section>

      <section className={cardClassName}>
        <h2 className="text-base font-semibold">Meetup Preferences</h2>
        <p className="mt-0.5 border-b border-border pb-3 text-sm text-muted-foreground">
          Choose up to three preferred meetup locations. Confirm the final place
          and time in chat.
        </p>

        <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
          {locations.map((location) => {
            const id = `location-${location
              .replace(/\s+/g, "-")
              .toLowerCase()}`;
            const checked = form.meetupLocations.includes(location);
            const limitReached =
              !checked &&
              form.meetupLocations.length >= MAX_MEETUP_LOCATIONS;

            return (
              <Label
                key={location}
                htmlFor={id}
                className="flex items-center gap-2.5 rounded-md border border-border px-3 py-3 text-sm font-normal"
              >
                <Checkbox
                  id={id}
                  checked={checked}
                  disabled={limitReached}
                  onCheckedChange={(value) =>
                    toggleMeetupLocation(location, value === true)
                  }
                />
                {location}
              </Label>
            );
          })}
        </div>

        <div className="mt-5 flex flex-wrap items-center justify-end gap-3 border-t border-border pt-4">
          {status && (
            <p
              role={status.type === "error" ? "alert" : "status"}
              className={`mr-auto text-sm ${
                status.type === "error"
                  ? "text-destructive"
                  : "text-muted-foreground"
              }`}
            >
              {status.text}
            </p>
          )}

          <Button
            type="button"
            variant="secondary"
            onClick={handleCancel}
            disabled={!hasChanges || saving}
          >
            Cancel
          </Button>

          <Button
            type="button"
            onClick={handleSave}
            disabled={!hasChanges || saving}
          >
            {saving ? "Saving…" : "Save Changes"}
          </Button>
        </div>
      </section>
    </main>
  );
}
