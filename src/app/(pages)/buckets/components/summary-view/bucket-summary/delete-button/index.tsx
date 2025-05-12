"use client";
import { Button } from "@/components/buttons";
import Form from "@/components/form";
import { TrashIcon } from "@heroicons/react/24/outline";
import { deleteBucket } from "./actions";
import { toaster } from "@/components/toaster";

export default function DeleteBucketButton(props: { bucket: string }) {
  const { bucket } = props;

  const action = async () => {
    const submit = async () => {
      const error = await deleteBucket(bucket);
      if (!error) {
        toaster.success("Bucket successfully deleted");
      } else {
        toaster.danger("Cannot delete bucket", error);
      }
    };
    submit();
  };

  return (
    <Form action={action}>
      <Button className="btn-danger-secondary" title="Delete" type="submit">
        <TrashIcon className="size-5" />
        Delete
      </Button>
    </Form>
  );
}
