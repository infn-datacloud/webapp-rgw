import { ChangeEvent, useCallback, useEffect, useState } from "react"
import { Button } from "../../components/Button"
import { TextField } from "../../components/TextField"
import { useOAuth } from "../../services/OAuth";
import { useS3 } from "../../services/S3";
import { Navigate } from "react-router-dom";
import { addKeyHandler } from "../../commons/utils";

export const Login = () => {
  const oAuth = useOAuth();
  const s3 = useS3();
  const [awsAccessKeyId, setAwsAccessKeyId] = useState("");
  const [awsSecretAccessKey, setAwsSecretAccessKey] = useState("");
  const { login } = oAuth;
  const loginEnabled = (awsAccessKeyId.length * awsSecretAccessKey.length) > 0;

  const handleAwsAccessKeyIdChange =
    (element: ChangeEvent<HTMLInputElement>) => {
      setAwsAccessKeyId(element.target.value);
    }

  const handleAwsSecretAccessKeyChange =
    (element: ChangeEvent<HTMLInputElement>) => {
      setAwsSecretAccessKey(element.target.value);
    }

  const handleLogin = useCallback(() => {
    s3.loginWithCredentials({
      accessKeyId: awsAccessKeyId,
      secretAccessKey: awsSecretAccessKey
    })
  }, [awsAccessKeyId, awsSecretAccessKey, s3])

  useEffect(() => {
    const cleanupKeyHandler = addKeyHandler("Enter", function () {
      if (loginEnabled) {
        handleLogin();
      }
    });
    return () => {
      cleanupKeyHandler();
    };
  }, [loginEnabled, handleLogin]);

  if (s3.isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  const oidcDisabled = oAuth.isLoading ||
    (oAuth.isAuthenticated && !s3.isAuthenticated);

  return (
    <div className="bg-slate-100 w-2/3 xl:w-1/2 max-w-3xl m-auto p-8 shadow-lg mt-16 rounded-md">
      <img className="mx-auto bg-gray-100 p-4" alt="" src="/logo530.png" />
      <h1 className="mx-auto text-center text-4xl font-extrabold">Welcome</h1>
      <div className="w-1/3 mx-auto mt-8 flex flex-col space-y-4 ">
        <TextField
          value={awsAccessKeyId}
          placeholder="Access Key Id"
          onChange={handleAwsAccessKeyIdChange}
        />
        <TextField
          value={awsSecretAccessKey}
          placeholder="Access Secret Key"
          type="password"
          onChange={handleAwsSecretAccessKeyChange}
        />
        <Button
          className="mx-auto w-full"
          onClick={handleLogin}
          title="Login"
          disabled={!loginEnabled}
        />
        <Button
          className="mx-auto w-full"
          onClick={login}
          title="Login with OpenID connect"
          disabled={oidcDisabled}
        />
      </div>
    </div>
  )
}
