import { Button } from "../../components/Button"

interface LoginProps {
  onClick: () => void
}

export const Login = ({ onClick }: LoginProps) => {
  return (
    <div className="bg-slate-100 w-1/3 m-auto p-8 shadow-lg mt-16 rounded-md">
      <img className="mx-auto bg-gray-100 p-4" alt="" src="/logo530.png" />
      <h1 className="mx-auto text-center text-4xl font-extrabold">Welcome</h1>
      <div className="flex justify-center mt-8">
        <Button onClick={onClick} title="Login with OpenID connect" />
      </div>
    </div>
  )
}