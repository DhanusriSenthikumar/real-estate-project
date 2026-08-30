"use client";

import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { isAuthenticated, subscribeToAuthChanges } from "@/src/lib/api";

export default function AuthGuard({
  children,
  redirectTo = "/login",
}: {
  children: React.ReactNode;
  redirectTo?: string;
}) {
  const router = useRouter();
  const pathname = usePathname();
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

    if (!isAuth) {
      const next = `${redirectTo}?redirect=${encodeURIComponent(pathname)}`;
      router.replace(next);
      return;
    }
  }, [ready, isAuth, pathname, redirectTo, router]);

  if (!ready) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center text-sm font-medium text-slate-500">
        Checking session...
      </div>
    );
  }

  if (!isAuth) {
    return null;
  }

  return <>{children}</>;
}
