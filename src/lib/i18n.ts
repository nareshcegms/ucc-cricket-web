import type { Lang } from '@/types';
import en from './locales/en.json';
import ta from './locales/ta.json';

const dictionaries = { en, ta } as const;

export function getDictionary(lang: Lang) {
  return dictionaries[lang];
}

export function t(
  lang: Lang,
  key: string,
  vars: Record<string, string | number> = {}
): string {
  const value = key.split('.').reduce<unknown>((obj, part) => {
    if (obj && typeof obj === 'object' && part in obj) {
      return (obj as Record<string, unknown>)[part];
    }
    return undefined;
  }, dictionaries[lang]);

  if (typeof value !== 'string') return key;
  return value.replace(/\{(\w+)\}/g, (_, name) => String(vars[name] ?? `{${name}}`));
}

export function storyField(story: object, field: string, lang: Lang) {
  const s = story as Record<string, unknown>;
  if (lang === 'ta' && typeof s[`${field}_ta`] === 'string') {
    return s[`${field}_ta`] as string;
  }
  return s[field] as string;
}

export function roleLabel(lang: Lang, role: string) {
  const label = t(lang, `roles.${role}`);
  return label === `roles.${role}` ? role : label;
}
