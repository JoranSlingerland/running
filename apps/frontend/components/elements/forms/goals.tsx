import { zodResolver } from '@hookform/resolvers/zod';
import { goalForm } from '@repo/schemas';
import type { GoalForm } from '@repo/schemas';
import { Goal } from '@repo/types';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';

import { useProps } from '@hooks/useProps';
import { UseGoals, addGoal, deleteGoal } from '@services/goals';
import { Button } from '@ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel } from '@ui/form';
import { Input } from '@ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@ui/select';

export function GoalsFormElement({
  goal,
  useGoals,
}: {
  goal: Goal | undefined;
  useGoals: UseGoals;
}) {
  const { userSettings } = useProps();
  const form = useForm<GoalForm>({
    resolver: zodResolver(goalForm),
    defaultValues: {
      value: goal?.value || undefined,
      timeFrame: goal?.timeFrame || undefined,
      type: goal?.type || undefined,
      sport: goal?.sport || undefined,
    },
  });

  async function onSubmit(values: GoalForm) {
    if (!userSettings?.data?._id) {
      toast.error('User not found, please try again later');
      return;
    }
    await addGoal({
      body: {
        ...values,
        value: values.type === 'time' ? values.value * 60 : values.value * 1000,
        userId: userSettings.data._id,
        _id: goal?._id || null,
        version: goal?.version || 0.1,
      },
    }).then(() => {
      useGoals?.refetchData({
        overwrite: true,
      });
    });
  }

  async function onDelete() {
    if (!goal?._id) {
      toast.error('Failed to delete goal');
      return;
    }
    await deleteGoal({
      query: {
        id: goal?._id || '',
      },
    }).then(() => {
      useGoals?.refetchData({
        overwrite: true,
      });
    });
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)}>
        <div className="flex flex-col space-y-2">
          <FormField
            control={form.control}
            name="sport"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Sport</FormLabel>
                <Select onValueChange={field.onChange} value={field.value}>
                  <FormControl>
                    <SelectTrigger className="w-36">
                      <SelectValue placeholder="Sport" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="run">Run</SelectItem>
                    <SelectItem value="ride">Ride</SelectItem>
                  </SelectContent>
                </Select>
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="type"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Goal type</FormLabel>
                <Select onValueChange={field.onChange} value={field.value}>
                  <FormControl>
                    <SelectTrigger className="w-36">
                      <SelectValue placeholder="Goal Type" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="distance">Distance</SelectItem>
                    <SelectItem value="time">Time</SelectItem>
                  </SelectContent>
                </Select>
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="timeFrame"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Time frame</FormLabel>
                <Select onValueChange={field.onChange} value={field.value}>
                  <FormControl>
                    <SelectTrigger className="w-36">
                      <SelectValue placeholder="Time Frame" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="week">Week</SelectItem>
                    <SelectItem value="month">Month</SelectItem>
                    <SelectItem value="year">Year</SelectItem>
                  </SelectContent>
                </Select>
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="value"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Goal Value</FormLabel>
                <FormControl>
                  <div className="flex items-center">
                    <Input
                      className="w-36"
                      type="number"
                      {...field}
                      onChange={(e) => field.onChange(Number(e.target.value))}
                    />
                    <span className="ml-2">
                      {form.watch('type') === 'time'
                        ? 'minutes'
                        : userSettings?.data?.preferences.units === 'imperial'
                          ? 'Miles'
                          : 'Kilometers'}
                    </span>
                  </div>
                </FormControl>
              </FormItem>
            )}
          />
        </div>
        <div className="mt-4 flex flex-row items-center justify-center space-x-4">
          {goal?._id && (
            <Button
              disabled={userSettings?.isLoading}
              onClick={onDelete}
              variant="destructive"
              type="button"
            >
              Delete
            </Button>
          )}
          <Button disabled={userSettings?.isLoading} type="submit">
            Save
          </Button>
        </div>
      </form>
    </Form>
  );
}
