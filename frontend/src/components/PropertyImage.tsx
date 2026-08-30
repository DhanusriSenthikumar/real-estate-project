"use client";

import Image from "next/image";
import { useState } from "react";

interface PropertyImageProps {
  src: string | null;
  alt: string;
  className?: string;
  sizes?: string;
  priority?: boolean;
}

export default function PropertyImage({
  src,
  alt,
  className = "",
  sizes = "(max-width: 768px) 100vw, 50vw",
  priority = false,
}: PropertyImageProps) {
  const [failed, setFailed] = useState(false);
  const canRender =
    Boolean(src?.startsWith("https://res.cloudinary.com/")) && !failed;

  if (!canRender) {
    return (
      <div
        className={`flex h-full w-full flex-col items-center justify-center gap-2 bg-slate-100 text-slate-400 ${className}`}
      >
        <span className="text-4xl" aria-hidden="true">
          ⌂
        </span>
        <span>{src ? "Image unavailable" : "No image available"}</span>
      </div>
    );
  }

  return (
    <Image
      src={src!}
      alt={alt}
      fill
      priority={priority}
      sizes={sizes}
      className={`object-cover ${className}`}
      onError={() => setFailed(true)}
    />
  );
}
