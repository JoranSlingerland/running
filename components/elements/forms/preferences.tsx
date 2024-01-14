import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
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

const formSchema = z.object({
  preferred_tss_type: z.union([z.literal('pace'), z.literal('hr')]),
});

export function PreferencesForm() {
  const { userSettings } = useProps();
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      preferred_tss_type:
        userSettings?.data?.preferences?.preferred_tss_type ?? 'pace',
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    let newSettings = userSettings?.data;
    if (!newSettings) return;
    newSettings.preferences.preferred_tss_type = values.preferred_tss_type;

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
          name="preferred_tss_type"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Preferred TSS type</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger className="w-48">
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
        <div className="flex flex-col items-center">
          <Button type="submit">Save</Button>
        </div>
      </form>
    </Form>
  );
}
