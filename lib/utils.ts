type ClassValue =
  | string
  | number
  | null
  | undefined
  | boolean
  | ClassDictionary
  | ClassValue[];

type ClassDictionary = Record<string, boolean | undefined | null>;

/**
 * Lightweight className concatenation helper similar to `clsx`.
 * Allows combining strings, arrays, and conditional objects.
 */
export function cn(...inputs: ClassValue[]): string {
  const classes: string[] = [];

  const append = (value: ClassValue): void => {
    if (!value) {
      return;
    }

    if (typeof value === "string" || typeof value === "number") {
      classes.push(String(value));
      return;
    }

    if (Array.isArray(value)) {
      value.forEach(append);
      return;
    }

    if (typeof value === "object") {
      for (const [key, condition] of Object.entries(value)) {
        if (condition) {
          classes.push(key);
        }
      }
    }
  };

  inputs.forEach(append);

  return classes.join(" ");
}
