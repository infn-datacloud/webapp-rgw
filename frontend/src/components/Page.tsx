import { Drawer } from "./Drawer";
import { Title } from "./Title";
import { useOAuth } from "../services/OAuth2";
import { useS3Service } from "../services/S3";
import { Navigate } from "react-router-dom";

type Props = {
  user?: string;
  title: string;
  children: string | React.ReactNode | React.ReactNode[];
};

export const Page = (props: Props) => {
  const oAuth = useOAuth();
  const s3 = useS3Service();

  if (!oAuth.isAuthenticated && !s3.isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  const { children } = props;

  return (
    <>
      <div id="sidebar" className="w-64 left-0 top-0 h-screen fixed z-1 overflow-auto">
        <Drawer />
      </div>
      <div className="ml-64 p-8 w-full">
        <Title>{props.title}</Title>
        <hr className="h-px w-full my-8 bg-gray-200 border-0"></hr>
        {children}
      </div>
    </>
  );
}