import { getActivities } from './activities';
import { checkAuth } from './authentication';
import { StravaAuthentication } from './types';

class StravaClient {
  private auth: StravaAuthentication;

  constructor(auth: StravaAuthentication) {
    this.auth = auth;
  }

  async initialize(): Promise<StravaAuthentication> {
    this.auth = await checkAuth(this.auth);
    return this.auth;
  }

  async validateAuth() {
    const now = new Date().getTime();
    let auth = this.auth;
    if (this.auth.expires_at < now) {
      auth = await checkAuth(this.auth);
    }
    return auth;
  }

  async getActivities({
    before,
    after,
  }: {
    before?: string | number;
    after?: string | number;
  }) {
    const auth = await this.validateAuth();
    return getActivities({
      auth: auth,
      before,
      after,
    });
  }
}

export { StravaClient };
