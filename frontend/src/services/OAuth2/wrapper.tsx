import { OAuthProvider } from "./OAuthProvider"
import { OAuthProviderProps } from "./OidcConfig"

type Props = {
  Comp?: React.ComponentType
}

export function withOAuth2(WrappedComponent: React.FunctionComponent<Props>,
  config: OAuthProviderProps) {
  return function (props: Props) {
    return (
      <OAuthProvider {...config}>
        <WrappedComponent {...props} />
      </OAuthProvider>
    )
  }
}
