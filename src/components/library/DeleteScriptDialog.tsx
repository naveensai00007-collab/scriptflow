import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "../ui/Dialog";
import { Button } from "../ui/Button";

interface DeleteScriptDialogProps {
  open: boolean;
  scriptTitle: string;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => Promise<void>;
}

export function DeleteScriptDialog({
  open,
  scriptTitle,
  onOpenChange,
  onConfirm,
}: DeleteScriptDialogProps) {
  const [loading, setLoading] = useState(false);

  const handleConfirm = async () => {
    setLoading(true);
    try {
      await onConfirm();
      onOpenChange(false);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Delete script?</DialogTitle>
          <DialogDescription>
            "{scriptTitle || "Untitled script"}" will be permanently removed from this device.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button
            variant="secondary"
            disabled={loading}
            onClick={() => onOpenChange(false)}
          >
            Cancel
          </Button>
          <Button
            variant="danger"
            loading={loading}
            onClick={handleConfirm}
          >
            Delete script
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}