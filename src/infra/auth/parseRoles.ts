export function parseRoles(jwt: Record<string, unknown>): string[] {
  try {
    const realmAccess = jwt['realm_access'] as { roles?: string[] } | undefined
    return realmAccess?.roles ?? []
  } catch {
    return []
  }
}
