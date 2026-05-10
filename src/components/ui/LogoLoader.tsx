"use client";

import Image from "next/image";
import { SHARKDESK_LOGO_URL } from "@/lib/branding";
import { cn } from "@/lib/utils";

const SIZES = { page: 100, sidebar: 40, button: 22 } as const;

type LogoLoaderSize = keyof typeof SIZES;

type Props = {
  /** `page` — route/content; `sidebar` — org strip; `button` — inline pending submit. */
  size?: LogoLoaderSize;
  className?: string;
};

export function LogoLoader({ size = "page", className }: Props) {
  const px = SIZES[size];

  return (
    <div
      className={cn(
        "flex items-center justify-center",
        size === "page" && "min-h-0 w-full flex-1",
        size === "sidebar" && "w-full py-1",
        size === "button" && "inline-flex min-h-0 min-w-0 py-0",
        className,
      )}
      role={size === "button" ? undefined : "status"}
      aria-hidden={size === "button" ? true : undefined}
      aria-label={size === "button" ? undefined : "Loading"}
    >
      <div
        className="animate-sharkdesk-logo-pulse relative shrink-0"
        style={{ width: px, height: px }}
      >
        <Image
          src={SHARKDESK_LOGO_URL}
          alt=""
          fill
          className="object-contain object-center"
          sizes={`${px}px`}
          priority={size === "page"}
        />
      </div>
    </div>
  );
}
