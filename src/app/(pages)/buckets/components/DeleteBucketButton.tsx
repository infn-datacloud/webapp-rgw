"use client";
import { Button } from "@/components/Button";
import Form from "@/components/Form";
import { TrashIcon } from "@heroicons/react/24/outline";
import { deleteBucket } from "../actions";
import { toaster } from "@/components/toaster";

export default function DeleteBucketButton(props: { bucket: string }) {
  const { bucket } = props;

  const action = async () => {
    const submit = async () => {
      const error = await deleteBucket(bucket);
      if (!error) {
        toaster.success("Bucket successfully deleted");
      } else {
        toaster.danger("Cannot not delete bucket", error.message);
      }
    };
    submit();
  };

  return (
    <Form action={action}>
      <Button
        className="pr-4"
        icon={<TrashIcon />}
        title="Delete"
        type="submit"
        color="danger"
      />
    </Form>
  );
}
