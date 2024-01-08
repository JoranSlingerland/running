import { regularFetch } from '@utils/api';

function addUserData({ body }: { body: UserSettings }) {
  return regularFetch({
    url: '/api/user',
    message: {
      enabled: true,
      success: 'Account settings saved!',
      error: 'Failed to save account settings',
      loading: 'Saving account settings',
    },
    method: 'POST',
    body,
  });
}

export { addUserData };
