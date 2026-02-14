const STORAGE_KEY = "dtx_user_designs";

export type RepeatType = "full_drop" | "half_drop" | "centre" | "mirror";

export interface UserDesign {
  id: string;
  userId: string;
  name: string;
  imageDataUrl: string;
  createdAt: string;
  /** Pattern Studio: how the tile repeats */
  repeatType?: RepeatType;
  /** Pattern Studio: fabric option id (e.g. cotton, linen) */
  fabricChoice?: string;
  fabricCutChoice?: string;
  widthCm?: string;
  heightCm?: string;
  tileSize?: number;
}

function loadAll(): Record<string, UserDesign[]> {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return {};
    return JSON.parse(raw);
  } catch {
    return {};
  }
}

function saveAll(data: Record<string, UserDesign[]>) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

export const userDesignsApi = {
  getDesignsByUserId(userId: string): UserDesign[] {
    const data = loadAll();
    return (data[userId] ?? []).sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  },

  getDesignById(userId: string, designId: string): UserDesign | undefined {
    return this.getDesignsByUserId(userId).find((d) => d.id === designId);
  },

  saveDesign(userId: string, params: {
    name: string;
    imageDataUrl: string;
    repeatType?: RepeatType;
    fabricChoice?: string;
    fabricCutChoice?: string;
    widthCm?: string;
    heightCm?: string;
    tileSize?: number;
  }): UserDesign {
    const data = loadAll();
    const list = data[userId] ?? [];
    const design: UserDesign = {
      id: `ud-${Date.now()}`,
      userId,
      name: params.name.trim() || "My pattern",
      imageDataUrl: params.imageDataUrl,
      createdAt: new Date().toISOString(),
      ...(params.repeatType && { repeatType: params.repeatType }),
      ...(params.fabricChoice && { fabricChoice: params.fabricChoice }),
      ...(params.fabricCutChoice && { fabricCutChoice: params.fabricCutChoice }),
      ...(params.widthCm != null && params.widthCm !== "" && { widthCm: params.widthCm }),
      ...(params.heightCm != null && params.heightCm !== "" && { heightCm: params.heightCm }),
      ...(params.tileSize != null && { tileSize: params.tileSize }),
    };
    list.push(design);
    data[userId] = list;
    saveAll(data);
    return design;
  },

  deleteDesign(userId: string, designId: string): boolean {
    const data = loadAll();
    const list = (data[userId] ?? []).filter((d) => d.id !== designId);
    if (list.length === (data[userId] ?? []).length) return false;
    data[userId] = list;
    saveAll(data);
    return true;
  },
};
