import { OAuthProvider } from "./OAuthProvider";

type Props = {
	Comp?: React.ComponentType;
}

export function withOAuth(WrappedComponent: React.FunctionComponent<Props>) {
	return function (props: Props) {
		return (
			<OAuthProvider>
				<WrappedComponent {...props} />
			</OAuthProvider>
		)
	}
}
