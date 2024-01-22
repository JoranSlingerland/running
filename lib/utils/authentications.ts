function isAuthenticated(userInfo: UserInfo | undefined) {
  if (!userInfo) {
    return false;
  }
  if (!userInfo?.clientPrincipal?.userRoles) {
    return false;
  }
  if (userInfo?.clientPrincipal?.userRoles.includes('authenticated')) {
    return true;
  }
  return false;
}

export { isAuthenticated };
