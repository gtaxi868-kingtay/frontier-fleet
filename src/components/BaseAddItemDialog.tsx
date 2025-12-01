import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useDebouncedDuplicateCheck } from "@/hooks/useDuplicateCheck";
import { getFieldsForModule, getDefaultValuesForModule, type FieldConfig } from "@/lib/addItemFields";
import { getSchemaForModule } from "@/lib/addItemSchemas";
import { parseSupabaseError } from "@/lib/errorHandler";
import { AlertCircle, Loader2, CheckCircle2, AlertTriangle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface BaseAddItemDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
  module: string;
  moduleName: string;
  tableName: string;
}

export function BaseAddItemDialog({
  open,
  onOpenChange,
  onSuccess,
  module,
  moduleName,
  tableName,
}: BaseAddItemDialogProps) {
  const { profile } = useAuth();
  const [loading, setLoading] = useState(false);
  const fields = getFieldsForModule(module);
  const defaultValues = getDefaultValuesForModule(module);
  const schema = getSchemaForModule(module, profile?.unit_id || null);

  const form = useForm({
    resolver: zodResolver(schema),
    defaultValues,
    mode: 'onChange',
  });

  // Watch the ID field for duplicate checking
  const idFieldName = fields.find((f) => f.name.includes('_id'))?.name || '';
  const idValue = form.watch(idFieldName);

  // Duplicate check with debounce
  const { exists: idExists, suggestedId, isLoading: checkingDuplicate } = useDebouncedDuplicateCheck(
    module,
    idValue || '',
    open && !!idValue,
    profile?.unit_id || null,
    500
  );

  // Reset form when dialog opens/closes (only when open changes, not on defaultValues change)
  useEffect(() => {
    if (open) {
      form.reset(defaultValues);
    } else {
      form.reset();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  // Show duplicate warning
  useEffect(() => {
    if (idExists && idValue && idValue.trim().length > 0) {
      form.setError(idFieldName, {
        type: 'manual',
        message: `This ID already exists. ${suggestedId ? `Suggested: ${suggestedId}` : ''}`,
      });
    } else if (!idExists && idValue) {
      form.clearErrors(idFieldName);
    }
  }, [idExists, suggestedId, idValue, idFieldName]);

  const onSubmit = async (data: any) => {
    setLoading(true);

    try {
      // Prepare data for insert
      const insertData: any = {
        ...data,
      };

      // Set unit field - ALL modules use squadron_id (including works_materials)
      // Only clothing_equipment_issues uses unit_id if it exists as a separate module
      if (module === 'clothing_equipment_issues') {
        insertData.unit_id = profile?.unit_id;
      } else {
        insertData.squadron_id = profile?.unit_id;
      }

      // Clean up data: convert empty strings and special values to null for optional fields, remove undefined
      Object.keys(insertData).forEach((key) => {
        const value = insertData[key];
        
        // Skip unit fields
        if (key === 'squadron_id' || key === 'unit_id') {
          return;
        }
        
        // Convert empty strings or "__none__" to null for optional fields (better for database)
        if (value === '' || value === '__none__') {
          insertData[key] = null;
        }
        
        // Remove undefined values
        if (value === undefined) {
          delete insertData[key];
        }
      });

      const { error } = await supabase.from(tableName).insert(insertData);

      if (error) throw error;

      toast.success(`${moduleName} added successfully`);
      form.reset();
      onSuccess();
      onOpenChange(false);
    } catch (error: any) {
      const errorMessage = parseSupabaseError(error);
      toast.error(errorMessage);
      console.error('Add item error:', error);
    } finally {
      setLoading(false);
    }
  };

  const renderField = (field: FieldConfig) => {
    const fieldValue = form.watch(field.name);

    return (
      <FormField
        key={field.name}
        control={form.control}
        name={field.name}
        render={({ field: formField }) => (
          <FormItem className={field.gridCols === 2 ? 'col-span-2' : ''}>
            {field.type === 'boolean' ? (
              // Boolean fields need special handling - label and control side by side
              <>
                <div className="flex items-center space-x-2">
                  <FormControl>
                    <Checkbox
                      checked={fieldValue || false}
                      onCheckedChange={formField.onChange}
                      disabled={field.disabled || loading}
                    />
                  </FormControl>
                  <FormLabel className="font-normal">
                    {field.label}
                    {field.required && <span className="text-destructive ml-1">*</span>}
                  </FormLabel>
                </div>
                {field.helpText && (
                  <FormDescription>{field.helpText}</FormDescription>
                )}
                <FormMessage />
              </>
            ) : (
              // All other field types - standard layout
              <>
                <FormLabel>
                  {field.label}
                  {field.required && <span className="text-destructive ml-1">*</span>}
                </FormLabel>
                <FormControl>
                  {(() => {
                    if (field.type === 'text') {
                      return (
                        <div className="relative">
                          <Input
                            {...formField}
                            placeholder={field.placeholder}
                            disabled={field.disabled || loading}
                            className={field.name === idFieldName && idValue ? "pr-10" : ""}
                          />
                          {field.name === idFieldName && idValue && idValue.trim().length > 0 && (
                            <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
                              {checkingDuplicate ? (
                                <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                              ) : idExists ? (
                                <AlertTriangle className="h-4 w-4 text-destructive" />
                              ) : (
                                <CheckCircle2 className="h-4 w-4 text-green-600" />
                              )}
                            </div>
                          )}
                        </div>
                      );
                    }
                    if (field.type === 'number') {
                      return (
                        <Input
                          {...formField}
                          type="number"
                          placeholder={field.placeholder}
                          min={field.min}
                          max={field.max}
                          step={field.step}
                          disabled={field.disabled || loading}
                          onChange={(e) => {
                            const value = e.target.value === '' ? null : Number(e.target.value);
                            formField.onChange(value);
                          }}
                          value={fieldValue ?? ''}
                        />
                      );
                    }
                    if (field.type === 'select' && field.options) {
                      return (
                        <Select
                          value={fieldValue || undefined}
                          onValueChange={(value) => {
                            // Convert empty string or special "none" value to null for optional fields
                            if (!field.required && (value === '' || value === '__none__')) {
                              formField.onChange(null);
                            } else {
                              formField.onChange(value);
                            }
                          }}
                          disabled={field.disabled || loading}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder={field.placeholder || 'Select...'} />
                          </SelectTrigger>
                          <SelectContent>
                            {!field.required && (
                              <SelectItem value="__none__">None</SelectItem>
                            )}
                            {field.options.map((option) => (
                              <SelectItem key={option.value} value={option.value}>
                                {option.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      );
                    }
                    if (field.type === 'textarea') {
                      return (
                        <Textarea
                          {...formField}
                          placeholder={field.placeholder}
                          rows={field.rows || 3}
                          disabled={field.disabled || loading}
                        />
                      );
                    }
                    if (field.type === 'date') {
                      return (
                        <Input
                          {...formField}
                          type="date"
                          disabled={field.disabled || loading}
                          value={fieldValue ? (fieldValue as string).split('T')[0] : ''}
                        />
                      );
                    }
                    return null;
                  })()}
                </FormControl>
                {field.helpText && (
                  <FormDescription>{field.helpText}</FormDescription>
                )}
                <FormMessage />
              </>
            )}
          </FormItem>
        )}
      />
    );
  };

  // Show duplicate warning alert
  const showDuplicateWarning = idExists && idValue && idValue.trim().length > 0 && !checkingDuplicate;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Add {moduleName}</DialogTitle>
          <DialogDescription>
            Fill in the details below to add a new {moduleName.toLowerCase()} item.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            {showDuplicateWarning && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  This ID already exists. {suggestedId && (
                    <span className="font-medium">Suggested: {suggestedId}</span>
                  )}
                </AlertDescription>
              </Alert>
            )}

            <div className="grid grid-cols-2 gap-4">
              {fields.map((field) => renderField(field))}
            </div>

            <div className="flex justify-end gap-2 pt-4 border-t">
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  form.reset();
                  onOpenChange(false);
                }}
                disabled={loading}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={loading || idExists}>
                {loading ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Adding...
                  </>
                ) : (
                  `Add ${moduleName}`
                )}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}

