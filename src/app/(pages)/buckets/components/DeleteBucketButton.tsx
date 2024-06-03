"use client";
import { Button } from "@/components/Button";
import Form from "@/components/Form";
import { TrashIcon } from "@heroicons/react/24/outline";
import { deleteBucket } from "../actions";
import { NotificationType, useNotifications } from "@/services/notifications";
import { camelToWords } from "@/commons/utils";

export default function DeleteBucketButton(props: { bucket: string }) {
  const { bucket } = props;
  const { notify } = useNotifications();

  const action = async () => {
    const submit = async () => {
      await deleteBucket(bucket);
    };
    submit()
      .then(() =>
        notify("Bucket successfully deleted", "", NotificationType.success)
      )
      .catch(error => {
        console.log(error);
        if (error instanceof Error) {
          notify(
            "Could not delete bucket",
            camelToWords(error.message),
            NotificationType.error
          );
        }
      });
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
