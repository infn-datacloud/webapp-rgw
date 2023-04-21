class Timer {
  static getEpochTime(): number {
    return Math.floor(Date.now() / 1000);
  }
}

export interface OidcClientSettings {
  authority: string;
  client_id: string;
  redirect_uri: string;
  client_secret?: string;
  response_type?: string;
  scope?: string;
  state?: string;
  grant_type?: string;
  audience?: string;
}

export interface IOidcToken {
  id_token: string;
  access_token: string;
  refresh_token?: string;
  token_type: string;
  expires_in: number;
  scope?: string;
}

export class OidcToken {
  id_token: string;
  access_token: string;
  refresh_token?: string;
  token_type: string;
  expires_at: number;
  scope?: string;
  audience?: string;

  private constructor(args: IOidcToken) {
    this.id_token = args.id_token;
    this.access_token = args.access_token;
    this.refresh_token = args.refresh_token;
    this.token_type = args.token_type;
    this.expires_at = Timer.getEpochTime() + args.expires_in;
    this.scope = args.scope;
  }

  static createTokenFromResponse(data: any): OidcToken {
    return new OidcToken(data);
  }

  public get expires_in(): number {
    return this.expires_at - Timer.getEpochTime();
  }

  get expired(): boolean | undefined {
    return this.expires_in <= 0;
  }

  get scopes(): string[] {
    return this.scope?.split(" ") ?? [];
  }
}
