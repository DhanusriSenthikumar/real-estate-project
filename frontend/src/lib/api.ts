import type { ListingType, PropertyType } from "@/src/types/property";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:5000";
export const AUTH_TOKEN_KEY = "rivierarealty_token";
export const AUTH_USER_KEY = "rivierarealty_user";

type PropertyQueryParams = {
  search?: string;
  location?: string;
  propertyType?: string;
  listingType?: string;
  bedrooms?: number;
  minPrice?: number;
  maxPrice?: number;
  sortBy?: "price" | "bedrooms" | "area" | "createdAt";
  order?: "asc" | "desc";
  page?: number;
  limit?: number;
};

export function getToken() {
  if (typeof window === "undefined") {
    return null;
  }

  return localStorage.getItem(AUTH_TOKEN_KEY);
}

export function isAuthenticated() {
  return Boolean(getToken());
}

export function setAuthSession(token: string, user?: Record<string, unknown>) {
  if (typeof window === "undefined") {
    return;
  }

  localStorage.setItem(AUTH_TOKEN_KEY, token);

  if (user) {
    localStorage.setItem(AUTH_USER_KEY, JSON.stringify(user));
  } else {
    localStorage.removeItem(AUTH_USER_KEY);
  }

  window.dispatchEvent(new Event("rivierarealty-auth-change"));
}

export function clearAuthSession() {
  if (typeof window === "undefined") {
    return;
  }

  localStorage.removeItem(AUTH_TOKEN_KEY);
  localStorage.removeItem(AUTH_USER_KEY);
  window.dispatchEvent(new Event("rivierarealty-auth-change"));
}

export function getStoredUser() {
  if (typeof window === "undefined") {
    return null;
  }

  const stored = localStorage.getItem(AUTH_USER_KEY);
  if (!stored) return null;

  try {
    return JSON.parse(stored);
  } catch {
    localStorage.removeItem(AUTH_USER_KEY);
    return null;
  }
}

export function subscribeToAuthChanges(listener: () => void) {
  if (typeof window === "undefined") {
    return () => {};
  }

  window.addEventListener("rivierarealty-auth-change", listener);
  return () => {
    window.removeEventListener("rivierarealty-auth-change", listener);
  };
}

export async function getProperties(params: PropertyQueryParams = {}) {
  const searchParams = new URLSearchParams();

  Object.entries(params).forEach(([key, value]) => {
    if (
      value === undefined ||
      value === null ||
      value === "" ||
      (typeof value === "number" && Number.isNaN(value))
    ) {
      return;
    }

    searchParams.set(key, String(value));
  });

  const queryString = searchParams.toString();
  const response = await fetch(
    `${API_URL}/properties${queryString ? `?${queryString}` : ""}`,
    {
      cache: "no-store",
    },
  );

  if (!response.ok) {
    throw new Error("Failed to fetch properties");
  }

  return response.json();
}

export async function getPropertyById(id: number) {
  const response = await fetch(`${API_URL}/properties/${id}`);

  if (!response.ok) {
    throw new Error("Property not found");
  }

  return response.json();
}

export async function registerUser(data: {
  name: string;
  email: string;
  password: string;
}) {
  const response = await fetch(`${API_URL}/auth/users`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });

  const result = await response.json();

  if (!response.ok) {
    throw new Error(result.message || "Registration failed");
  }

  return result;
}

export async function loginUser(data: { email: string; password: string }) {
  const response = await fetch(`${API_URL}/auth/login`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });

  const result = await response.json();

  if (!response.ok) {
    throw new Error(result.message || "Login failed");
  }

  return result;
}

export async function getMyProperties() {
  const token = getToken();

  if (!token) {
    throw new Error("Please login first");
  }

  const response = await fetch(`${API_URL}/properties/my`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  const result = await response.json();

  if (!response.ok) {
    if (response.status === 401) clearAuthSession();
    throw new Error(result.message || "Failed to fetch your properties");
  }

  return result;
}

export async function getCurrentUser() {
  const token = getToken();

  if (!token) {
    throw new Error("Please login first");
  }

  const response = await fetch(`${API_URL}/auth/me`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  const result = await response.json();

  if (!response.ok) {
    clearAuthSession();
    throw new Error(result.message || "Failed to load profile");
  }

  const user = result.user ?? result;

  if (user) {
    localStorage.setItem(AUTH_USER_KEY, JSON.stringify(user));
  }

  return result;
}

export async function updateProfile(data: { name: string; email: string }) {
  const token = getToken();

  if (!token) {
    throw new Error("Please login first");
  }

  const response = await fetch(`${API_URL}/auth/me`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(data),
  });
  const result = await response.json();

  if (!response.ok) {
    if (response.status === 401) clearAuthSession();
    throw new Error(result.message || "Failed to update profile");
  }

  return result;
}

export async function createProperty(formData: FormData) {
  const token = getToken();

  if (!token) {
    throw new Error("Please login first");
  }

  const response = await fetch(`${API_URL}/properties`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
    },
    body: formData,
  });
  const result = await response.json();

  if (!response.ok) {
    if (response.status === 401) clearAuthSession();
    const validationMessage = result.errors?.[0]?.message;
    throw new Error(
      validationMessage || result.message || "Failed to publish property",
    );
  }

  return result;
}

export type UpdatePropertyInput = {
  title: string;
  description: string;
  price: number;
  location: string;
  propertyType: PropertyType;
  listingType: ListingType;
  bedrooms: number;
  bathrooms: number;
  area: number;
  image?: File;
  removeImage?: boolean;
};

export async function updateProperty(id: number, data: UpdatePropertyInput) {
  const token = getToken();

  if (!token) throw new Error("Please login first");

  const formData = new FormData();
  formData.set("title", data.title);
  formData.set("description", data.description);
  formData.set("price", String(data.price));
  formData.set("location", data.location);
  formData.set("propertyType", data.propertyType);
  formData.set("listingType", data.listingType);
  formData.set("bedrooms", String(data.bedrooms));
  formData.set("bathrooms", String(data.bathrooms));
  formData.set("area", String(data.area));
  if (data.image) formData.set("image", data.image);
  if (data.removeImage) formData.set("imageAction", "remove");

  const response = await fetch(`${API_URL}/properties/${id}`, {
    method: "PUT",
    headers: {
      Authorization: `Bearer ${token}`,
    },
    body: formData,
  });
  const result = await response.json();

  if (!response.ok) {
    if (response.status === 401) {
      clearAuthSession();
      throw new Error("Your session has expired. Please sign in again.");
    }
    if (response.status === 403) {
      throw new Error("You can only edit your own properties.");
    }
    if (response.status === 404) {
      throw new Error("This property no longer exists.");
    }
    throw new Error(
      result.errors?.[0]?.message ||
        result.message ||
        "Failed to update property",
    );
  }

  return result;
}

export async function deleteProperty(id: number) {
  const token = getToken();

  if (!token) throw new Error("Please login first");

  const response = await fetch(`${API_URL}/properties/${id}`, {
    method: "DELETE",
    headers: { Authorization: `Bearer ${token}` },
  });
  const result = await response.json();

  if (!response.ok) {
    if (response.status === 401) {
      clearAuthSession();
      throw new Error("Your session has expired. Please sign in again.");
    }
    if (response.status === 403) {
      throw new Error("You can only delete your own properties.");
    }
    if (response.status === 404) {
      throw new Error("This property no longer exists.");
    }
    throw new Error(result.message || "Unable to delete property right now.");
  }
  return result;
}

export async function logoutUser() {
  clearAuthSession();
  return true;
}
