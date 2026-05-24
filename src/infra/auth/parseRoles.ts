export function parseRoles(jwt: Record<string, unknown>): string[] {
  try {
    const resourceAccess = jwt['resource_access'] as Record<string, { roles: string[] }> | undefined
    if (!resourceAccess) return []

    return Object.values(resourceAccess).flatMap(client => client.roles ?? [])
  } catch {
    return []
  }
}
