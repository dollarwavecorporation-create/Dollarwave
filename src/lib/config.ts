const envBaseAddress = (import.meta.env.VITE_BASE_ADDRESS as string | undefined)?.trim() || "";
const isLocalhostBase =
  /^https?:\/\/(localhost|127\.0\.0\.1|0\.0\.0\.0)(:\d+)?$/i.test(envBaseAddress);

export const BASE_ADDRESS =
  !envBaseAddress || isLocalhostBase ? window.location.origin : envBaseAddress;

export const EMAIL_REDIRECT_URL = `${BASE_ADDRESS}/login`;
