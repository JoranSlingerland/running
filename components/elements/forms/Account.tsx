import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import { useProps } from '@hooks/useProps';
import { addUserData } from '@services/user/post';
import { convertPaceToSeconds, convertPaceToSpeed } from '@utils/convert';
import { useDeepCompareEffect } from 'rooks';
import { paceZoneColumns } from '@elements/columns/paceZoneColumns';
import { heartRateZoneColumns } from '@elements/columns/heartRateZoneColumns';
import { DataTable } from '@elements/shadcnTable';
import { Button } from '@ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel } from '@ui/form';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@ui/select';
import { Input } from '@ui/input';
import { Separator } from '@ui/separator';
import { Loader2 } from 'lucide-react';
import { formatPace } from '@utils/formatting';

// Constants
const paceRegex = /^(\d{1,3}):(\d{1,2})$/;

const formSchema = z.object({
  gender: z.union([z.literal('male'), z.literal('female')]),
  hr_max: z.number().min(0).max(300),
  hr_rest: z.number().min(0).max(300),
  hr_threshold: z.number().min(0).max(300),
  pace_threshold: z.string().refine((v) => paceRegex.test(v), {
    message:
      'Pace threshold must be in the format MM:SS, where leading zeros are optional.',
  }),
});

// Helper functions
function calculatePaceZones(threshold: string) {
  const zonePercentages = {
    'Zone 1: Recovery': [0.78, 0],
    'Zone 2: Aerobic': [0.78, 0.88],
    'Zone 3: Tempo': [0.88, 0.94],
    'Zone 4: SubThreshold': [0.94, 1.01],
    'Zone 5A: SuperThreshold': [1.01, 1.03],
    'Zone 5B: Aerobic Capacity': [1.04, 1.11],
    'Zone 5C: Anaerobic Capacity': [1.11, 2],
  };
  console.log(threshold);
  const speed = convertPaceToSpeed(convertPaceToSeconds(threshold), 'm/s');
  console.log(speed);
  const zones = Object.keys(zonePercentages);

  const zonesWithValues = zones.map((name) => {
    const percentage = zonePercentages[name as keyof typeof zonePercentages];
    let min: number = speed * percentage[0];
    let max: number = speed * percentage[1];

    if (name === 'Zone 5C: Anaerobic Capacity') {
      max = 27.5;
    }

    return {
      name,
      min,
      max,
    };
  });
  console.log(zonesWithValues);
  return zonesWithValues;
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

  const zonesWithValues = zones.map((name) => {
    const percentage = zonePercentages[name as keyof typeof zonePercentages];
    let min = threshold * percentage[0];
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

  return zonesWithValues;
}

// Component
export function AccountForm() {
  const { userSettings } = useProps();
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      gender: userSettings?.data?.gender,
      hr_max: userSettings?.data?.heart_rate?.max,
      hr_rest: userSettings?.data?.heart_rate?.resting,
      hr_threshold: userSettings?.data?.heart_rate?.threshold,
      pace_threshold: formatPace({
        metersPerSecond: userSettings?.data?.pace?.threshold,
        units: 'metric',
        addUnit: false,
      }),
    },
  });
  let paceZones = calculatePaceZones(form.watch('pace_threshold'));
  let heartRateZones = calculateHeartRateZones({
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
          units: 'metric',
          addUnit: false,
        }),
      });
    }
  }, [userSettings, form]);

  async function onSubmit(values: z.infer<typeof formSchema>) {
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
        threshold: convertPaceToSpeed(
          convertPaceToSeconds(values.pace_threshold),
          'm/s',
        ),
        zones: paceZones,
      },
    };

    await addUserData({
      body: newSettings,
    }).then(() => {
      userSettings?.refetchData({
        cacheOnly: true,
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
            data={paceZones || []}
          />
        </div>
        <Separator />
        <div className="flex flex-col items-center">
          <Button disabled={userSettings?.isLoading} type="submit">
            Save
            {userSettings?.isLoading && (
              <Loader2 className="animate-spin ml-2" size={16} />
            )}
          </Button>
        </div>
      </form>
    </Form>
  );
}
