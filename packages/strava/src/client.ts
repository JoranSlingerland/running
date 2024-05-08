import { getActivities } from './activities';
import { getActivity } from './activity';
import { checkAuth } from './authentication';
import { getStream } from './streams';
import { StravaAuthentication, StreamType } from './types';

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
    page = 1,
    per_page = 200,
  }: {
    before?: string | number;
    after?: string | number;
    page?: number;
    per_page?: number;
  }) {
    const auth = await this.validateAuth();
    return getActivities({
      auth: auth,
      before,
      after,
      page,
      per_page,
    });
  }

  async getActivity({ id }: { id: number | string }) {
    const auth = await this.validateAuth();
    return getActivity({
      auth: auth,
      id,
    });
  }

  async getStream({ id, keys }: { id: number | string; keys: StreamType[] }) {
    const auth = await this.validateAuth();
    return getStream({
      auth: auth,
      id,
      keys,
    });
  }
}

export { StravaClient };
