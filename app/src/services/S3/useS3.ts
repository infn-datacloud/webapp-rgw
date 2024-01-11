import { useContext } from "react";
import { S3Context, S3ContextProps } from "./S3Context";

export const useS3 = (): S3ContextProps => {
  const context = useContext(S3Context);
  if (!context) {
    throw new Error(
      "S3Provider context is undefined, " +
        "please verify you are calling useS3 " +
        "as a child of <S3Provider> component."
    );
  }
  return context;
};
