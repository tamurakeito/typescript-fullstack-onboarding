import { Dialog, DialogContent } from "@/components/ui/dialog";
import type { Root } from "@radix-ui/react-dialog";
import type { ComponentProps } from "react";

export const DialogForm = ({
  ...props
}: ComponentProps<typeof Root> & {
  formProps?: ComponentProps<"form">;
}) => {
  return (
    <Dialog {...props}>
      <DialogContent>
        <form
          {...props.formProps}
          className="bg-background data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 fixed top-[50%] left-[50%] z-50 grid w-full max-w-[calc(100%-2rem)] translate-x-[-50%] translate-y-[-50%] gap-4 rounded-lg border p-6 shadow-lg duration-200 sm:max-w-lg"
        >
          {props.children}
        </form>
      </DialogContent>
    </Dialog>
  );
};
