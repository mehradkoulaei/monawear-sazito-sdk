/** Server-only environment access. Never import this from a client component. */
export const serverEnv = {
  get domain(): string {
    return (process.env.SAZITO_DOMAIN || "").trim().replace(/^https?:\/\//i, "").replace(/\/+$/, "");
  },
  get apiKey(): string | undefined {
    const k = (process.env.SAZITO_API_KEY || "").trim();
    return k || undefined;
  },
  get isDev(): boolean {
    return process.env.NODE_ENV !== "production";
  },
};
