import { parseJwt } from "./utils/JWT";
import Timer from "./utils/Timer";
import { UserProfile } from "./utils/UserProfile";

export interface UserProps {
	access_token: string;
	id_token?: string;
	expires_in?: number;
	refresh_token?: string;
	scope?: string;
	token_type: string;
}

export class User {
	public access_token: string;
	public id_token?: string;
	public expires_at?: number;
	public profile: UserProfile;
	public refresh_token?: string;
	public scope?: string;
	public token_type: string;

	public constructor(props: UserProps) {
		this.access_token = props.access_token;
		this.id_token = props.id_token;
		this.expires_at = props.expires_in ? Date.now() + props.expires_in * 1000
			: undefined; 
		this.profile = parseJwt(props.access_token);
		this.refresh_token = props.refresh_token;
		this.scope = props.scope;
		this.token_type = props.token_type;
	}

	public get expires_in(): number {
		if (this.expires_at) {
			return this.expires_at - Timer.getEpochTime();
		} else {
			return -1;
		}
	}

	public get expired(): boolean {
		if (this.expires_at) {
			return this.expires_in <= 0;
		}
		return false;
	}
}