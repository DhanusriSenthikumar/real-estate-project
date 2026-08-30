import type { ReactNode } from "react";
import { Button } from "./Button";
import { Card } from "./Card";

export function LoadingState({ label = "Loading..." }: { label?: string }) {
  return (
    <div
      className="flex min-h-32 items-center justify-center gap-3 text-sm font-medium text-slate-500"
      role="status"
    >
      <span
        className="h-5 w-5 animate-spin rounded-full border-2 border-emerald-500 border-t-transparent"
        aria-hidden="true"
      />
      {label}
    </div>
  );
}

export function ErrorState({
  message,
  onRetry,
}: {
  message: string;
  onRetry?: () => void;
}) {
  return (
    <Card className="p-6 text-center">
      <p role="alert" className="text-sm text-red-700">
        {message}
      </p>
      {onRetry && (
        <Button
          type="button"
          variant="secondary"
          onClick={onRetry}
          className="mt-4"
        >
          Try again
        </Button>
      )}
    </Card>
  );
}

export function EmptyState({
  title,
  message,
  action,
}: {
  title: string;
  message: string;
  action?: ReactNode;
}) {
  return (
    <Card className="p-8 text-center sm:p-10">
      <h2 className="text-xl font-bold text-slate-900">{title}</h2>
      <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500">
        {message}
      </p>
      {action && <div className="mt-5">{action}</div>}
    </Card>
  );
}
