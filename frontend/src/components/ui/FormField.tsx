import type {
  InputHTMLAttributes,
  ReactNode,
  SelectHTMLAttributes,
  TextareaHTMLAttributes,
} from "react";

const control =
  "w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-emerald-500 focus:bg-white focus-visible:ring-2 focus-visible:ring-emerald-500/20 disabled:cursor-not-allowed disabled:opacity-60";

export function FieldLabel({
  children,
  required = false,
}: {
  children: ReactNode;
  required?: boolean;
}) {
  return (
    <span className="mb-2 block text-sm font-semibold text-slate-700">
      {children}
      {required && (
        <span className="ml-1 text-emerald-600" aria-hidden="true">
          *
        </span>
      )}
    </span>
  );
}

export function FieldMessage({
  error,
  help,
}: {
  error?: string;
  help?: string;
}) {
  if (error)
    return (
      <p role="alert" className="mt-1 text-sm text-red-600">
        {error}
      </p>
    );
  return help ? <p className="mt-1 text-xs text-slate-500">{help}</p> : null;
}

export function TextInput(props: InputHTMLAttributes<HTMLInputElement>) {
  return <input className={`${control} ${props.className ?? ""}`} {...props} />;
}
export function Textarea(props: TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <textarea className={`${control} ${props.className ?? ""}`} {...props} />
  );
}
export function Select(props: SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <select className={`${control} ${props.className ?? ""}`} {...props} />
  );
}
