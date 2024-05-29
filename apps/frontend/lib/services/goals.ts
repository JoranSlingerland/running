import { Goal } from '@repo/types';

import { useFetch } from '@hooks/useFetch';
import { UseFetchResult } from '@hooks/useFetch';
import { regularFetch } from '@utils/api';

export type UseGoals = UseFetchResult<Goal[]> | undefined;

function useGoals({ enabled = true }: { enabled?: boolean }) {
  return useFetch<undefined, undefined, Goal[]>({
    url: '/api/goals/',
    method: 'GET',
    enabled,
  });
}

function addGoal({ body }: { body: Goal }) {
  return regularFetch({
    url: '/api/goals/',
    message: {
      enabled: true,
      success: 'Goal Saved!',
      error: 'Failed to save goal',
      loading: 'Saving goal',
    },
    method: 'POST',
    body,
  });
}

function deleteGoal({ query }: { query: { id: string } }) {
  return regularFetch({
    url: '/api/goals/',
    message: {
      enabled: true,
      success: 'Goal Deleted',
      error: 'Failed to delete goal',
      loading: 'Deleting goal',
    },
    method: 'DELETE',
    query,
  });
}

export { addGoal, deleteGoal, useGoals };
