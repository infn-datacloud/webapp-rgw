import { Button } from "@/components/Button";
import Form from "@/components/Form";
import { PlusIcon } from "@heroicons/react/24/outline";
import { redirect } from "next/navigation";

export default function CreateBucketButton() {
  return (
    <Form
      action={async () => {
        "use server";
        redirect("?modal=create-bucket");
      }}
    >
      <Button title="Create Button" icon={<PlusIcon />} />
    </Form>
  );
}
