import type { UserProfile } from "@/types/profile";

const STORAGE_PREFIX = "dtx_profile_";

function getKey(userId: string) {
  return `${STORAGE_PREFIX}${userId}`;
}

export const profileApi = {
  getProfile(userId: string): UserProfile | null {
    try {
      const raw = localStorage.getItem(getKey(userId));
      if (!raw) return null;
      return JSON.parse(raw) as UserProfile;
    } catch {
      return null;
    }
  },

  getOrCreateProfile(userId: string, defaults: { name: string; email: string }): UserProfile {
    const existing = this.getProfile(userId);
    if (existing) return existing;
    const profile: UserProfile = {
      userId,
      name: defaults.name,
      email: defaults.email,
      phone: "",
      shippingAddress: "",
    };
    localStorage.setItem(getKey(userId), JSON.stringify(profile));
    return profile;
  },

  updateProfile(userId: string, data: Partial<Omit<UserProfile, "userId">>): UserProfile {
    const current = this.getProfile(userId);
    const updated: UserProfile = current
      ? { ...current, ...data }
      : { userId, name: "", email: "", phone: "", shippingAddress: "", ...data };
    localStorage.setItem(getKey(userId), JSON.stringify(updated));
    return updated;
  },
};
