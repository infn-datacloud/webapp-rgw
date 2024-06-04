"use client";
import { Button } from "@/components/Button";
import Form from "@/components/Form";
import { TrashIcon } from "@heroicons/react/24/outline";
import { deleteBucket } from "../actions";
import { NotificationType, useNotifications } from "@/services/notifications";


export default function DeleteBucketButton(props: { bucket: string }) {
  const { bucket } = props;
  const { notify } = useNotifications();

  const action = async () => {
    const submit = async () => {
      const error = await deleteBucket(bucket);
      if (!error) {
        notify("Bucket successfully deleted", "", NotificationType.success);
      } else {
        notify(
          "Cannot not delete bucket",
          error.message,
          NotificationType.error
        );
      }
    };
    submit();
  };

  return (
    <Form action={action}>
      <Button
        className="my-auto pr-4"
        icon={<TrashIcon />}
        title="Delete"
        type="submit"
      />
    </Form>
  );
}
