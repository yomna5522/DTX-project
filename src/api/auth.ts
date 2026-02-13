import type { User, Session } from "@/types/auth";

const STORAGE_KEY = "dtx_session";
const USERS_STORAGE_KEY = "dtx_users";

const SEED_USER: User = {
  id: "existing-1",
  email: "existing@dtx.example",
  name: "Existing Customer",
  username: "existing_customer",
  customerType: "EXISTING",
};

function loadUsers(): User[] {
  try {
    const raw = localStorage.getItem(USERS_STORAGE_KEY);
    if (!raw) return [SEED_USER];
    const list = JSON.parse(raw) as User[];
    const hasSeed = list.some((u) => u.id === SEED_USER.id);
    return hasSeed ? list : [SEED_USER, ...list];
  } catch {
    return [SEED_USER];
  }
}

function saveUsers(list: User[]) {
  localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(list));
}

let users: User[] = loadUsers();

// Temporary passwords for existing customers (mock: in real app these are issued by factory)
const existingPasswords: Record<string, string> = {
  existing_customer: "temp123",
  "existing@dtx.example": "temp123",
};

function getStoredSession(): Session | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as Session;
  } catch {
    return null;
  }
}

function setStoredSession(session: Session | null): void {
  if (session) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(session));
  } else {
    localStorage.removeItem(STORAGE_KEY);
  }
}

export const authApi = {
  getSession(): Session | null {
    return getStoredSession();
  },

  login(identifier: string, password: string): { success: true; session: Session } | { success: false; error: string } {
    const normalized = identifier.trim().toLowerCase();
    const byEmail = users.find((u) => u.email.toLowerCase() === normalized);
    const byUsername = users.find((u) => u.username.toLowerCase() === normalized);
    const user = byEmail ?? byUsername;
    if (!user) {
      return { success: false, error: "Invalid email/username or password." };
    }
    const expectedPassword =
      user.customerType === "EXISTING"
        ? existingPasswords[user.username] ?? existingPasswords[user.email] ?? "temp123"
        : (user as User & { password?: string }).password;
    if (expectedPassword !== password) {
      return { success: false, error: "Invalid email/username or password." };
    }
    const session: Session = {
      user,
      token: `mock-token-${user.id}-${Date.now()}`,
    };
    setStoredSession(session);
    return { success: true, session };
  },

  register(data: { name: string; email: string; password: string }): { success: true; session: Session } | { success: false; error: string } {
    const email = data.email.trim().toLowerCase();
    if (users.some((u) => u.email.toLowerCase() === email)) {
      return { success: false, error: "An account with this email already exists." };
    }
    const username = email.split("@")[0].replace(/\W/g, "_") + "_" + Date.now().toString(36);
    const user: User & { password?: string } = {
      id: `user-${Date.now()}`,
      email: data.email.trim(),
      name: data.name.trim(),
      username,
      customerType: "NEW",
      password: data.password,
    };
    users.push(user);
    saveUsers(users);
    const session: Session = { user, token: `mock-token-${user.id}-${Date.now()}` };
    setStoredSession(session);
    return { success: true, session };
  },

  getUserById(id: string): User | undefined {
    users = loadUsers();
    return users.find((u) => u.id === id);
  },

  getAllUsers(): User[] {
    users = loadUsers();
    return [...users];
  },

  logout(): void {
    setStoredSession(null);
  },

  changePassword(userId: string, currentPassword: string, newPassword: string): { success: true } | { success: false; error: string } {
    const user = users.find((u) => u.id === userId) as (User & { password?: string }) | undefined;
    if (!user) return { success: false, error: "User not found." };
    const expected = user.customerType === "EXISTING" ? existingPasswords[user.username] ?? existingPasswords[user.email] ?? "temp123" : user.password;
    if (expected !== currentPassword) return { success: false, error: "Current password is incorrect." };
    if (user.customerType === "NEW") {
      user.password = newPassword;
    }
    return { success: true };
  },
};
