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

  if (bearerToken) {
    wretchInstance = wretchInstance.auth(`Bearer ${bearerToken}`);
  }

  switch (method) {
    case 'GET':
      wretchInstance = wretchInstance.get();
      break;
    case 'POST':
      wretchInstance = wretchInstance.json(body || {}).post();
      break;
    case 'DELETE':
      wretchInstance = wretchInstance.json(body || {}).delete();
      break;
    default:
      throw new Error('Invalid method');
  }
  return wretchInstance;
}

export { createWretchInstance };
