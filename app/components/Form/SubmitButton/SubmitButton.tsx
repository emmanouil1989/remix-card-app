import { useFormContext, useIsSubmitting } from "remix-validated-form";
import Button from "~/components/button/Button";
import type { ButtonHTMLAttributes } from "react";

type SubmitButtonProps = {
  submitText: string;
  submittingText: string;
};

type Props = SubmitButtonProps & ButtonHTMLAttributes<HTMLButtonElement>;

export const SubmitButton = ({
  submittingText,
  submitText,
  ...props
}: Props) => {
  const isSubmitting = useIsSubmitting();
  const { isValid } = useFormContext();
  const disabled = isSubmitting || !isValid;
  return (
    <Button {...props} type="submit" disabled={disabled}>
      {isSubmitting ? submittingText : submitText}
    </Button>
  );
};
