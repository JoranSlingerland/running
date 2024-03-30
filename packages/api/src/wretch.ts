import wretch, { Wretch, WretchResponseChain } from 'wretch';
import AbortAddon, { AbortResolver, AbortWretch } from 'wretch/addons/abort';
import QueryStringAddon, {
  QueryStringAddon as QueryStringAddonType,
} from 'wretch/addons/queryString';

type WretchInstance = QueryStringAddonType &
  AbortWretch &
  Wretch<AbortWretch & QueryStringAddonType, AbortResolver, undefined>;
type WretchResponse = AbortResolver &
  WretchResponseChain<
    AbortWretch & QueryStringAddonType,
    AbortResolver,
    undefined
  >;

function createWretchInstance<Query, Body>({
  url,
  method,
  query,
  body,
  controller,
  bearerToken,
}: {
  url: string;
  method: 'GET' | 'POST' | 'DELETE' | string;
  controller: AbortController;
  query?: Query;
  body?: Body;
  bearerToken?: string;
}) {
  let wretchInstance: WretchInstance | WretchResponse = wretch()
    .url(url)
    .addon(AbortAddon())
    .addon(QueryStringAddon)
    .signal(controller)
    .query(query || {});

  wretchInstance = addBearerTokenToWretchInstance(bearerToken, wretchInstance);

  switch (method) {
    case 'GET':
      return wretchInstance.get();
    case 'POST':
      return wretchInstance.json(body || {}).post();
    case 'DELETE':
      return wretchInstance.json(body || {}).delete();
    default:
      throw new Error('Invalid method');
  }
}

function addBearerTokenToWretchInstance(
  bearerToken: string | undefined,
  wretchInstance: WretchInstance
) {
  if (bearerToken) {
    return wretchInstance.auth(`Bearer ${bearerToken}`);
  }
  return wretchInstance;
}

function createBasicWretchInstance({
  url,
  controller,
  bearerToken,
}: {
  url: string;
  controller: AbortController;
  bearerToken?: string;
}) {
  const wretchInstance = wretch()
    .url(url)
    .addon(AbortAddon())
    .addon(QueryStringAddon)
    .signal(controller);

  return addBearerTokenToWretchInstance(bearerToken, wretchInstance);
}

export { createWretchInstance, createBasicWretchInstance };
