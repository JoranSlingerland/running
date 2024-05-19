import { zodResolver } from '@hookform/resolvers/zod';
import { preferencesForm } from '@repo/schemas';
import type { PreferencesForm } from '@repo/schemas';
import { Loader2 } from 'lucide-react';
import { useTheme } from 'next-themes';
import { useForm } from 'react-hook-form';
import { useGeolocation } from 'rooks';
import { useDeepCompareEffect } from 'rooks';
import { toast } from 'sonner';

import { useProps } from '@hooks/useProps';
import { addUserData } from '@services/user/post';
import { Button } from '@ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel } from '@ui/form';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@ui/select';
import { Switch } from '@ui/switch';

export function PreferencesForm() {
  const { userSettings } = useProps();
  const { setTheme } = useTheme();
  const form = useForm<PreferencesForm>({
    resolver: zodResolver(preferencesForm),
    defaultValues: {
      dark_mode: undefined,
      preferred_tss_type:
        userSettings?.data?.preferences?.preferred_tss_type ?? 'pace',
      units: userSettings?.data?.preferences?.units ?? 'metric',
      enable_weather: userSettings?.data?.preferences?.enable_weather ?? false,
    },
  });
  const geoLocation = useGeolocation({
    when: form.watch('enable_weather'),
  });

  useDeepCompareEffect(() => {
    if (userSettings?.data) {
      form.reset({
        dark_mode: userSettings.data.preferences.dark_mode,
        preferred_tss_type: userSettings.data.preferences.preferred_tss_type,
        units: userSettings.data.preferences.units,
        enable_weather: userSettings.data.preferences.enable_weather,
      });
    }
  }, [userSettings?.data, form]);

  useDeepCompareEffect(() => {
    if (!geoLocation) return;
    if (!form.watch('enable_weather')) return;
    if (geoLocation.isError) {
      form.setValue('enable_weather', false);
      toast.error(
        'Failed to get your location, Please allow location access to enable weather forecasts.',
      );
    }
  }, [geoLocation, form.watch('enable_weather')]);

  setTheme(form.watch('dark_mode'));

  async function onSubmit(values: PreferencesForm) {
    if (!userSettings?.data) return;

    const newSettings: UserSettings = {
      ...userSettings.data,
      preferences: {
        ...userSettings.data.preferences,
        preferred_tss_type: values.preferred_tss_type,
        units: values.units,
        dark_mode: values.dark_mode,
        enable_weather: values.enable_weather,
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
          name="dark_mode"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Theme</FormLabel>
              <Select onValueChange={field.onChange} value={field.value}>
                <FormControl>
                  <SelectTrigger
                    disabled={userSettings?.isLoading}
                    className="w-36"
                  >
                    <SelectValue placeholder="Theme" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="system">System</SelectItem>
                  <SelectItem value="dark">Dark</SelectItem>
                  <SelectItem value="light">Light</SelectItem>
                </SelectContent>
              </Select>
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="preferred_tss_type"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Preferred TSS type</FormLabel>
              <Select onValueChange={field.onChange} value={field.value}>
                <FormControl>
                  <SelectTrigger
                    disabled={userSettings?.isLoading}
                    className="w-36"
                  >
                    <SelectValue placeholder="TSS Type" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="pace">Pace</SelectItem>
                  <SelectItem value="hr">Heart Rate</SelectItem>
                </SelectContent>
              </Select>
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="units"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Units</FormLabel>
              <Select onValueChange={field.onChange} value={field.value}>
                <FormControl>
                  <SelectTrigger
                    disabled={userSettings?.isLoading}
                    className="w-36"
                  >
                    <SelectValue placeholder="Units" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="metric">Metric</SelectItem>
                  <SelectItem value="imperial">Imperial</SelectItem>
                </SelectContent>
              </Select>
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="enable_weather"
          render={({ field }) => (
            <FormItem className="flex flex-col">
              <FormLabel>Enable weather forecasts</FormLabel>
              <FormControl>
                <Switch
                  checked={field.value}
                  onCheckedChange={field.onChange}
                  disabled={userSettings?.isLoading}
                />
              </FormControl>
            </FormItem>
          )}
        />
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
