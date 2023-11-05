import { ApiWithMessage } from '../../utils/api';

async function addUserData({ body }: { body: UserSettings }) {
  return await ApiWithMessage({
    url: '/api/user',
    runningMessage: 'Saving account settings',
    successMessage: 'Account settings saved!',
    method: 'POST',
    body,
  });
}

export { addUserData };
