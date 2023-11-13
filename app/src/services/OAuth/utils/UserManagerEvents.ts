import { User } from "../User";
import { UserEvent } from "./Events";

export type UserLoadedCallback = (user: User) => Promise<void> | void;
export type UserSignedOutCallback = () => Promise<void> | void;

export class UserManagerEvents {
	private _userLoaded = new UserEvent<[User]>();
	private _userSignedOut = new UserEvent<[]>();

	public load(user: User): void {
		this._userLoaded.raise(user);
	}

	public unload() {
		this._userSignedOut.raise();
	}

	public addUserLoaded(cb: UserLoadedCallback): () => void {
		return this._userLoaded.addObserver(cb);
	}

	public userSignedOut(cb: UserSignedOutCallback): () => void {
		return this._userSignedOut.addObserver(cb);
	}
}
