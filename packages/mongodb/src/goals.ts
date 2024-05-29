import { goalSchema } from '@repo/schemas';
import { Goal } from '@repo/types';

import { MongoDBHelper } from './helpers';

async function goalFromMongoDb(_id: string): Promise<Goal | undefined> {
  try {
    const collection = new MongoDBHelper().getCollection<Goal>('goals');

    const goal = await collection.findOne({
      _id,
    });

    if (!goal) {
      return undefined;
    }

    return goal;
  } catch (error) {
    console.error('Error retrieving goal from MongoDB:', error);
    return undefined;
  }
}

async function goalsFromMongoDB(id: string): Promise<Goal[] | undefined> {
  const collection = new MongoDBHelper().getCollection<Goal>('goals');

  const goals = await collection.find({ userId: id }).toArray();
  if (!goals || goals.length === 0) {
    return undefined;
  }

  return goals;
}

async function upsertGoalToMongoDB(
  body: unknown,
): Promise<{ result: string; isError: boolean }> {
  try {
    const collection = new MongoDBHelper().getCollection<Goal>('goals');
    const validated = goalSchema.safeParse(body);
    if (!validated.success) {
      return { result: 'Validation failed', isError: true };
    }

    // eslint-disable-next-line prefer-const
    let { _id, ...dataWithoutId } = validated.data;

    if (!_id) {
      _id = crypto.randomUUID();
    }

    await collection.updateOne(
      { _id: { $eq: _id } },
      { $set: dataWithoutId },
      { upsert: true },
    );

    return { result: 'success', isError: false };
  } catch (error) {
    console.error('Error adding goal to MongoDB:', error);
    return { result: 'Error adding goal to MongoDB', isError: true };
  }
}

async function deleteGoalFromMongoDB({
  _id,
  userId,
}: {
  _id: string;
  userId: string;
}) {
  try {
    const collection = new MongoDBHelper().getCollection<Goal>('goals');

    const goal = await collection.findOne({
      _id,
    });

    if (!goal) {
      return { result: 'Goal not found', isError: true };
    }

    if (goal.userId !== userId) {
      console.error('User does not have permission to delete this goal');
      return {
        result: 'User does not have permission to delete this goal',
        isError: true,
      };
    }

    await collection.deleteOne({
      _id,
    });
    return { result: 'success', isError: false };
  } catch (error) {
    console.error('Error deleting goal from MongoDB:', error);
    return { result: 'Error deleting goal from MongoDB', isError: true };
  }
}

export {
  goalFromMongoDb,
  upsertGoalToMongoDB,
  goalsFromMongoDB,
  deleteGoalFromMongoDB,
};
