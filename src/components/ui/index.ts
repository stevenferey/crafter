/**
 * Barrel export pour tous les composants UI
 * Permet d'importer facilement : import { Input, Button, Select } from '@/components/ui'
 */

export { Button } from './Button';
export type { ButtonProps } from './Button';

export { Input } from './Input';
export type { InputProps } from './Input';

export { Textarea } from './Textarea';
export type { TextareaProps } from './Textarea';

export { Select } from './Select';
export type { SelectProps, SelectOption } from './Select';

export { DatePicker } from './DatePicker';
export type { DatePickerProps } from './DatePicker';

export {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from './Card';
export type { CardProps } from './Card';

export { StatusBadge } from './StatusBadge';
export type { StatusBadgeProps } from './StatusBadge';

export { Spinner } from './Spinner';
export type { SpinnerProps } from './Spinner';

export { FormField, FormGroup, FormSection } from './FormField';
export type {
  FormFieldProps,
  FormGroupProps,
  FormSectionProps,
} from './FormField';
