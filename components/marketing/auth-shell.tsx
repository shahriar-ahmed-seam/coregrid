import Image from "next/image";
import Link from "next/link";
import { LayoutGrid, Quote } from "lucide-react";
import { img, PHOTOS } from "@/lib/images";

/**
 * Two-column authentication shell: an editorial brand panel with cinematic
 * photography on the left, and the form on the right. Collapses to a single
 * column on small screens.
 */
export function AuthShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="grid min-h-screen lg:grid-cols-2">
      {/* Brand / image panel */}
      <div className="relative hidden overflow-hidden lg:block">
        <Image
          src={img("people", { w: 1600, q: 80 })}
          alt={PHOTOS.people.alt}
          fill
          sizes="50vw"
          className="object-cover"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#07080c] via-[#07080c]/55 to-[#07080c]/20" />
        <div className="relative flex h-full flex-col justify-between p-12 text-white">
          <Link href="/" className="flex items-center gap-2">
            <span className="grid size-9 place-items-center rounded-lg bg-gradient-to-br from-indigo-500 to-sky-400 shadow-lg shadow-indigo-500/30">
              <LayoutGrid className="size-5" />
            </span>
            <span className="text-xl font-semibold tracking-tight">CoreGrid</span>
          </Link>

          <div className="max-w-md">
            <Quote className="size-8 text-indigo-300/70" />
            <p className="mt-4 text-2xl font-medium leading-snug">
              CoreGrid replaced five disconnected tools with one calm, intelligent
              workspace. Our team finally sees the whole business at once.
            </p>
            <p className="mt-5 text-sm text-zinc-300">
              Operations lead · sample enterprise
            </p>
          </div>
        </div>
      </div>

      {/* Form panel */}
      <div className="flex min-h-screen items-center justify-center bg-[#07080c] p-6 sm:p-10">
        <div className="w-full max-w-md">{children}</div>
      </div>
    </div>
  );
}
