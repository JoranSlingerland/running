import { zodResolver } from '@hookform/resolvers/zod';
import { AccountForm, accountForm } from '@repo/schemas';
import { Loader2 } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { useDeepCompareEffect } from 'rooks';

import { heartRateZoneColumns } from '@elements/columns/heartRateZoneColumns';
import { paceZoneColumns } from '@elements/columns/paceZoneColumns';
import { DataTable } from '@elements/shadcnTable';
import { useProps } from '@hooks/useProps';
import { addUserData } from '@services/user/post';
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
import { Separator } from '@ui/separator';
import {
  convertPaceToMetersPerSecond,
  convertPaceToSeconds,
} from '@utils/convert';
import { formatPace } from '@utils/formatting';

// Helper functions
function calculatePaceZones(threshold: string, units: Units) {
  const zonePercentages = {
    'Zone 1: Recovery': [0.78, 0],
    'Zone 2: Aerobic': [0.78, 0.88],
    'Zone 3: Tempo': [0.88, 0.94],
    'Zone 4: SubThreshold': [0.94, 1.01],
    'Zone 5A: SuperThreshold': [1.01, 1.03],
    'Zone 5B: Aerobic Capacity': [1.04, 1.11],
    'Zone 5C: Anaerobic Capacity': [1.11, 2],
  };
  const speed = convertPaceToMetersPerSecond(
    convertPaceToSeconds(threshold),
    units,
  );
  const zones = Object.keys(zonePercentages);
  const result = {
    speedInMetersPerSeconds: [] as { name: string; min: number; max: number }[],
    pace: [] as { name: string; min: string; max: string }[],
  };
  zones.map((name) => {
    const percentage = zonePercentages[name as keyof typeof zonePercentages];
    const minSpeed: number = speed * percentage[0];
    let maxSpeed: number = speed * percentage[1];

    if (name === 'Zone 5C: Anaerobic Capacity') {
      maxSpeed = 27.5;
    }

    const minPace = formatPace({
      metersPerSecond: minSpeed,
      units: units,
    });
    const maxPace = formatPace({
      metersPerSecond: maxSpeed,
      units: units,
    });

    result.speedInMetersPerSeconds.push({
      name,
      min: minSpeed,
      max: maxSpeed,
    });
    result.pace.push({
      name,
      min: minPace,
      max: maxPace,
    });
  });
  return result;
}

function calculateHeartRateZones({ threshold }: { threshold: number }) {
  const zonePercentages = {
    'Zone 1: Recovery': [0, 0.85],
    'Zone 2: Aerobic': [0.85, 0.89],
    'Zone 3: Tempo': [0.89, 0.94],
    'Zone 4: SubThreshold': [0.94, 0.99],
    'Zone 5A: SuperThreshold': [0.99, 1.02],
    'Zone 5B: Aerobic Capacity': [1.02, 1.06],
    'Zone 5C: Anaerobic Capacity': [1.06, 2],
  };

  const zones = Object.keys(zonePercentages);

  return zones.map((name) => {
    const percentage = zonePercentages[name as keyof typeof zonePercentages];
    const min = threshold * percentage[0];
    let max = threshold * percentage[1];

    if (name === 'Zone 5C: Anaerobic Capacity') {
      max = 255;
    }

    return {
      name,
      min,
      max,
    };
  });
}

// Component
export function AccountForm() {
  const { userSettings } = useProps();
  const form = useForm<AccountForm>({
    resolver: zodResolver(accountForm),
    defaultValues: {
      gender: userSettings?.data?.gender,
      hr_max: userSettings?.data?.heart_rate?.max,
      hr_rest: userSettings?.data?.heart_rate?.resting,
      hr_threshold: userSettings?.data?.heart_rate?.threshold,
      pace_threshold: formatPace({
        metersPerSecond: userSettings?.data?.pace?.threshold,
        units: userSettings?.data?.preferences.units || 'metric',
        addUnit: false,
      }),
    },
  });
  const paceZones = calculatePaceZones(
    form.watch('pace_threshold'),
    userSettings?.data?.preferences.units || 'metric',
  );
  const heartRateZones = calculateHeartRateZones({
    threshold: form.watch('hr_threshold'),
  });

  useDeepCompareEffect(() => {
    if (userSettings?.data) {
      form.reset({
        gender: userSettings.data.gender,
        hr_max: userSettings.data.heart_rate?.max,
        hr_rest: userSettings.data.heart_rate?.resting,
        hr_threshold: userSettings.data.heart_rate?.threshold,
        pace_threshold: formatPace({
          metersPerSecond: userSettings?.data?.pace?.threshold,
          units: userSettings?.data?.preferences.units || 'metric',
          addUnit: false,
        }),
      });
    }
  }, [userSettings, form]);

  async function onSubmit(values: AccountForm) {
    if (!userSettings?.data) return;
    const newSettings = {
      ...userSettings?.data,
      gender: values.gender,
      heart_rate: {
        max: values.hr_max,
        resting: values.hr_rest,
        threshold: values.hr_threshold,
        zones: heartRateZones,
      },
      pace: {
        threshold: convertPaceToMetersPerSecond(
          convertPaceToSeconds(values.pace_threshold),
          userSettings?.data?.preferences.units || 'metric',
        ),
        zones: paceZones.speedInMetersPerSeconds,
      },
    };

    await addUserData({
      body: newSettings,
    }).then(() => {
      userSettings?.refetchData({
        overwrite: true,
      });
    });
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="gender"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Gender</FormLabel>
              <Select onValueChange={field.onChange} value={field.value}>
                <FormControl>
                  <SelectTrigger
                    disabled={userSettings?.isLoading}
                    className="w-24"
                  >
                    <SelectValue placeholder="Gender" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="male">Male</SelectItem>
                  <SelectItem value="female">Female</SelectItem>
                </SelectContent>
              </Select>
            </FormItem>
          )}
        />
        <div>
          <div className="grid grid-cols-3">
            <FormField
              control={form.control}
              name="hr_max"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Max Heart Rate</FormLabel>
                  <FormControl>
                    <div className="flex items-center">
                      <Input
                        disabled={userSettings?.isLoading}
                        className="w-32"
                        type="number"
                        placeholder="Max"
                        {...field}
                      />
                      <span className="ml-2">BPM</span>
                    </div>
                  </FormControl>
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="hr_rest"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Resting Heart Rate</FormLabel>
                  <FormControl>
                    <div className="flex items-center">
                      <Input
                        disabled={userSettings?.isLoading}
                        className="w-24"
                        type="number"
                        placeholder="Resting"
                        {...field}
                      />
                      <span className="ml-2">BPM</span>
                    </div>
                  </FormControl>
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="hr_threshold"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Heart Rate Threshold</FormLabel>
                  <FormControl>
                    <div className="flex items-center">
                      <Input
                        disabled={userSettings?.isLoading}
                        className="w-24"
                        type="number"
                        placeholder="Threshold"
                        {...field}
                      />
                      <span className="ml-2">BPM</span>
                    </div>
                  </FormControl>
                </FormItem>
              )}
            />
          </div>
          <DataTable
            isLoading={userSettings?.isLoading || false}
            columns={heartRateZoneColumns}
            data={heartRateZones || []}
          />
        </div>
        <Separator />
        <div>
          <FormField
            control={form.control}
            name="pace_threshold"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Threshold Pace</FormLabel>
                <FormControl>
                  <Input
                    disabled={userSettings?.isLoading}
                    className="w-32"
                    placeholder="Threshold"
                    {...field}
                  />
                </FormControl>
              </FormItem>
            )}
          />
          <DataTable
            isLoading={userSettings?.isLoading || false}
            columns={paceZoneColumns}
            data={paceZones.pace || []}
          />
        </div>
        <Separator />
        <div className="flex flex-col items-center">
          <Button disabled={userSettings?.isLoading} type="submit">
            Save
            {userSettings?.isLoading && (
              <Loader2 className="ml-2 animate-spin" size={16} />
            )}
          </Button>
        </div>
      </form>
    </Form>
  );
}
