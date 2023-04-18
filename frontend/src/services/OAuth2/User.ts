import { OidcToken } from "./OidcConfig";


export class User {
  session_state: string | null;
  profile: undefined;
  token?: OidcToken;
  readonly state: unknown;

  constructor(args: {
    session_state: string | null,
    profile: undefined,
    token?: OidcToken
  }) {
    this.session_state = args.session_state ?? null;
    this.profile = args.profile;
    this.token = args.token;
  }

  toStorageString(): string {
    return JSON.stringify({
      session_state: this.session_state,
      profile: this.profile,
      token: this.token
    });
  }

  fromStorageString(storageString: string): User {
    return new User(JSON.parse(storageString));
  }
}
