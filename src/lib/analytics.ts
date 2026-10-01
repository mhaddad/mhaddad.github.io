export type GaEventName = 'language_switch' | 'whatsapp_click' | 'share';
export type GaParams = Record<string, string>;

export function gaEventAttrs(name: GaEventName, params: GaParams = {}): Record<string, string> {
  return { 'data-ga-event': name, 'data-ga-params': JSON.stringify(params) };
}

export function parseGaParams(raw: string | undefined): GaParams {
  if (!raw) return {};
  try {
    const parsed: unknown = JSON.parse(raw);
    if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) return {};
    return Object.fromEntries(
      Object.entries(parsed).filter((entry): entry is [string, string] => typeof entry[1] === 'string'),
    );
  } catch {
    return {};
  }
}
