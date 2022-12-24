import { useFormContext, useIsSubmitting } from "remix-validated-form";
import Button from "~/components/button/Button";

type SubmitButtonProps = {
  submitText: string;
  submittingText: string;
};

export const SubmitButton = ({
  submittingText,
  submitText,
}: SubmitButtonProps) => {
  const isSubmitting = useIsSubmitting();
  const { isValid } = useFormContext();
  const disabled = isSubmitting || !isValid;

  return (
    <Button type="submit" disabled={disabled}>
      {isSubmitting ? submittingText : submitText}
    </Button>
  );
};
