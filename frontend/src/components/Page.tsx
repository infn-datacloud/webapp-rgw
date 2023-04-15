import { Drawer } from "./Drawer";
import { Title } from "./Title";

type Props = {
  user?: string,
  title: string,
  [children: string]: any
};

export const Page = (props: Props) => {
  return (
    <>
      <div id="sidebar" className="w-64 left-0 top-0 h-screen fixed z-1 overflow-auto">
        <Drawer />
      </div>
      <div className="ml-64 p-8 w-full">
        <Title>{props.title}</Title>
        <hr className="h-px w-full my-8 bg-gray-200 border-0 dark:bg-gray-700"></hr>
        {props.children}
      </div>
    </>
  );
}