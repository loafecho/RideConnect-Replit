import { useQuery } from "@tanstack/react-query";
import { useState } from "react";

export function useAuth() {
  const adminKey = localStorage.getItem('adminKey');
  
  const { data: user, isLoading } = useQuery({
    queryKey: ["/api/auth/user"],
    queryFn: () => {
      if (!adminKey) throw new Error('No admin key');
      return fetch('/api/auth/user?adminKey=' + adminKey).then(res => {
        if (!res.ok) throw new Error('Unauthorized');
        return res.json();
      });
    },
    retry: false,
    enabled: !!adminKey,
  });

  const login = (key: string) => {
    localStorage.setItem('adminKey', key);
    window.location.reload();
  };

  const logout = () => {
    localStorage.removeItem('adminKey');
    window.location.reload();
  };

  return {
    user,
    isLoading,
    isAuthenticated: !!user,
    login,
    logout,
  };
}