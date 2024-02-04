import { cosmosContainer } from '@utils/database/helpers';
import { containerFunctionWithBackOff } from '@utils/database/helpers';
import { userSettingsSchema } from '@utils/zodSchema';

async function userSettingsFromCosmos(id: string) {
  const container = cosmosContainer('users');
  const response = await container.items
    .query({
      query: 'SELECT * FROM c WHERE c.id = @id',
      parameters: [{ name: '@id', value: id }],
    })
    .fetchAll();

  if (!response.resources || response.resources.length === 0) {
    return undefined;
  }

  return response.resources[0] as UserSettings;
}

async function upsertUserSettingsToCosmos(id: string, body: unknown) {
  const container = cosmosContainer('users');
  const validated = userSettingsSchema.safeParse(body);
  if (!validated.success) {
    return { result: undefined, isError: true };
  }

  const result = await containerFunctionWithBackOff(async () => {
    return await container.items.upsert({
      id,
      ...validated.data,
    });
  });

  return result;
}

export { userSettingsFromCosmos, upsertUserSettingsToCosmos };
