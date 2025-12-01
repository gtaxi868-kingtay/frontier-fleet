import React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";

const weaponStatusSchema = z.object({
  condition_issue: z.string().min(1, "Condition is required"),
  serviceable: z.boolean().default(true),
});

type WeaponStatusFormData = z.infer<typeof weaponStatusSchema>;

interface WeaponStatusEditDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  weapon: any | null;
  onSave: (updates: { condition_issue: string; serviceable: boolean }) => void;
}

export function WeaponStatusEditDialog({
  open,
  onOpenChange,
  weapon,
  onSave,
}: WeaponStatusEditDialogProps) {
  const form = useForm<WeaponStatusFormData>({
    resolver: zodResolver(weaponStatusSchema),
    defaultValues: {
      condition_issue: weapon?.condition_issue || "SERVICEABLE",
      serviceable: weapon?.serviceable ?? true,
    },
  });

  // Reset form when weapon changes
  React.useEffect(() => {
    if (weapon) {
      form.reset({
        condition_issue: weapon.condition_issue || "SERVICEABLE",
        serviceable: weapon.serviceable ?? true,
      });
    }
  }, [weapon, form]);

  const onSubmit = (data: WeaponStatusFormData) => {
    onSave({
      condition_issue: data.condition_issue,
      serviceable: data.serviceable,
    });
  };

  if (!weapon) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Edit Weapon Status</DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="condition_issue"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Condition</FormLabel>
                  <FormControl>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value || "SERVICEABLE"}
                      value={field.value}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select condition" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="SERVICEABLE">Serviceable</SelectItem>
                        <SelectItem value="UNSERVICEABLE">Unserviceable</SelectItem>
                        <SelectItem value="UNDER_REPAIR">Under Repair</SelectItem>
                      </SelectContent>
                    </Select>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="serviceable"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                  <div className="space-y-0.5">
                    <FormLabel className="text-base">Serviceable</FormLabel>
                    <div className="text-sm text-muted-foreground">
                      Mark this weapon as serviceable or unserviceable
                    </div>
                  </div>
                  <FormControl>
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                </FormItem>
              )}
            />

            <div className="flex gap-2 justify-end">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
              >
                Cancel
              </Button>
              <Button type="submit">
                Save Changes
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}

