/**
 * Token provider for the shared API client. Set by AuthContext so the client
 * can inject tokens and handle refresh/expiry without depending on auth module.
 */

export interface TokenProvider {
  getAccessToken(): string | null;
  getRefreshToken(): string | null;
  setAccessToken(access: string): void;
  onUnauthorized(): void;
}

let provider: TokenProvider | null = null;

export function setTokenProvider(p: TokenProvider | null): void {
  provider = p;
}

export function getTokenProvider(): TokenProvider | null {
  return provider;
}
