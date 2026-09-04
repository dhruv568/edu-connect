"use client";

import React, { createContext, useContext, useEffect, useState } from "react";

interface AuthContextType {
  user: any | null;
  features: string[];
  permissions: string[];
  isSuperAdmin: boolean;
  roleName: string;
  loading: boolean;
  refresh: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  features: [],
  permissions: [],
  isSuperAdmin: false,
  roleName: "",
  loading: true,
  refresh: async () => {},
});

export function PermissionProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<any | null>(null);
  const [features, setFeatures] = useState<string[]>([]);
  const [permissions, setPermissions] = useState<string[]>([]);
  const [isSuperAdmin, setIsSuperAdmin] = useState(false);
  const [roleName, setRoleName] = useState("");
  const [loading, setLoading] = useState(true);

  const fetchAuth = async () => {
    try {
      const res = await fetch("/api/admin/permissions/me");
      if (res.ok) {
        const json = await res.json();
        if (json.data) {
          const d = json.data;
          setUser(d);
          setFeatures(d.features || []);
          setPermissions(d.permissions || []);
          setIsSuperAdmin(Boolean(d.isSuperAdmin));
          setRoleName(d.roleName || "");
        }
      }
    } catch {
      // Offline / error
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAuth();
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        features,
        permissions,
        isSuperAdmin,
        roleName,
        loading,
        refresh: fetchAuth,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuthPermissions() {
  return useContext(AuthContext);
}

export function usePermission(permissionKey: string): boolean {
  const { isSuperAdmin, permissions } = useContext(AuthContext);
  if (isSuperAdmin) return true;
  return permissions.includes(permissionKey);
}

export function useFeature(featureKey: string): boolean {
  const { isSuperAdmin, features } = useContext(AuthContext);
  if (isSuperAdmin) return true;
  return features.includes(featureKey);
}

export interface PermissionGuardProps {
  permission?: string;
  feature?: string;
  fallback?: React.ReactNode;
  children: React.ReactNode;
}

export function PermissionGuard({
  permission,
  feature,
  fallback = null,
  children,
}: PermissionGuardProps) {
  const { isSuperAdmin, permissions, features, loading } = useContext(AuthContext);

  if (loading) return null;
  if (isSuperAdmin) return <>{children}</>;

  if (feature && !features.includes(feature)) {
    return <>{fallback}</>;
  }

  if (permission && !permissions.includes(permission)) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
}
