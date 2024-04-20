import { userSettingsSchema } from '@repo/schemas';
import { UserSettings } from '@repo/types';

import { connectToCollection } from './helpers';

async function userSettingsFromMongoDB(
  _id: string,
): Promise<UserSettings | undefined> {
  try {
    const collection = await connectToCollection<UserSettings>('users');

    const userSettings = await collection.findOne({
      _id,
    });

    if (!userSettings) {
      return undefined;
    }

    return userSettings;
  } catch (error) {
    console.error('Error retrieving user settings from MongoDB:', error);
    return undefined;
  }
}

async function upsertUserSettingsToMongoDB(
  body: unknown,
): Promise<{ result: string; isError: boolean }> {
  try {
    const collection = await connectToCollection<UserSettings>('users');

    const validated = userSettingsSchema.safeParse(body);
    if (!validated.success) {
      return { result: 'Validation failed', isError: true };
    }

    const { _id, ...dataWithoutId } = body as UserSettings;

    await collection.updateOne(
      { _id },
      { $set: dataWithoutId },
      { upsert: true },
    );

    return { result: 'success', isError: false };
  } catch (error) {
    console.error('Error adding user settings to MongoDB:', error);
    return { result: 'Error adding user settings to MongoDB', isError: true };
  }
}

export { userSettingsFromMongoDB, upsertUserSettingsToMongoDB };
