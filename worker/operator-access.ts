export function hasOperatorAccess(request: Request, operatorEmail?: string) {
  const email = request.headers.get("oai-authenticated-user-email")?.trim().toLowerCase();
  return Boolean(email && request.headers.get("oai-authenticated-user-id")
    && email === operatorEmail?.trim().toLowerCase());
}
