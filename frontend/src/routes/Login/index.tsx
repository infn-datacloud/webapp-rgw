import { ChangeEvent, useCallback, useEffect, useState } from "react"
import { Button } from "../../components/Button"
import { TextField } from "../../components/TextField"
import { AwsCredentialIdentity } from "@aws-sdk/types";

interface LoginProps {
  login: (credentials: AwsCredentialIdentity) => void;
  oidcLogin: () => void;
}

export const Login = ({ login, oidcLogin }: LoginProps) => {

  const [awsAccessKeyId, setAwsAccessKeyId] = useState("");
  const [awsSecretAccessKey, setAwsSecretAccessKey] = useState("");
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
    login({
      accessKeyId: awsAccessKeyId,
      secretAccessKey: awsSecretAccessKey
    })
  }, [awsAccessKeyId, awsSecretAccessKey, login])

  useEffect(() => {
    const keyDownHandler = (event: KeyboardEvent) => {
      if (event.key === 'Enter') {
        event.preventDefault();
        if (loginEnabled) {
          handleLogin();
        }
      }
    };

    document.addEventListener('keydown', keyDownHandler);
    return () => {
      document.removeEventListener('keydown', keyDownHandler);
    };
  }, [loginEnabled, handleLogin]);

  return (
    <div className="bg-slate-100 w-2/3 lg:w-1/2 2xl:w-1/3 m-auto p-8 shadow-lg mt-16 rounded-md">
      <img className="mx-auto bg-gray-100 p-4" alt="" src="/logo530.png" />
      <h1 className="mx-auto text-center text-4xl font-extrabold">Welcome</h1>
      <div className="w-1/3 mx-auto mt-8 flex flex-col space-y-4 ">
        <TextField
          value={awsAccessKeyId}
          placeholder="AWS Access Key Id"
          onChange={handleAwsAccessKeyIdChange}
        />
        <TextField
          value={awsSecretAccessKey}
          placeholder="AWS Access Secret Key"
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
          onClick={oidcLogin}
          title="Login with OpenID connect"
        />
      </div>
    </div>
  )
}