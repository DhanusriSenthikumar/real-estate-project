"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { isAuthenticated, subscribeToAuthChanges } from "@/src/lib/api";

export default function PublicOnly({
  children,
  redirectTo = "/dashboard",
}: {
  children: React.ReactNode;
  redirectTo?: string;
}) {
  const router = useRouter();
  const [ready, setReady] = useState(false);
  const [isAuth, setIsAuth] = useState(false);

  useEffect(() => {
    const sync = () => {
      setIsAuth(isAuthenticated());
      setReady(true);
    };

    sync();
    const unsubscribe = subscribeToAuthChanges(sync);

    return unsubscribe;
  }, []);

  useEffect(() => {
    if (!ready) return;

    if (isAuth) {
      router.replace(redirectTo);
    }
  }, [ready, isAuth, redirectTo, router]);

  if (!ready) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center text-sm font-medium text-slate-500">
        Loading...
      </div>
    );
  }

  if (isAuth) {
    return null;
  }

  return <>{children}</>;
}
