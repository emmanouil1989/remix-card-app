import { useEffect } from "react";
import { toast } from "react-toastify";
import { useSearchParams } from "@remix-run/react";

export type NotificationType = "Success" | "Error";

export const useSendNotification = (
  type: NotificationType,
  message: string | null | undefined,
) => {
  const [_, setSearchParams] = useSearchParams();
  useEffect(() => {
    setSearchParams({});
    if (type === "Success") {
      toast.success(message);
    } else {
      toast.error(message);
    }
  }, [message, type, setSearchParams]);
};
