import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import { ProductVariant } from "@/types/product";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function getVariantsAsArray(variants: any): ProductVariant[] {
    if (!variants) return [];
    if (Array.isArray(variants)) {
        return variants;
    }
    if (typeof variants === 'object') {
        return Object.values(variants);
    }
    return [];
}
