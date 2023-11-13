// https://openid.net/specs/openid-connect-core-1_0.html#AddressClaim
export interface OidcAddressClaim {
	formatted?: string;
	street_address?: string;
	locality?: string;
	postal_code?: string;
	country?: string;
}

// https://openid.net/specs/openid-connect-core-1_0.html#StandardClaims
export interface OidcStandardClaims {
	sub?: string;
	name?: string;
	given_name?: string;
	family_name?: string;
	middle_name?: string;
	nickname?: string;
	preferred_username?: string;
	profile?: string;
	picture?: string;
	website?: string;
	email?: string;
	email_verified?: boolean;
	gender?: string;
	birthdate?: string;
	zoneinfo?: string;
	phone_number?: string;
	phone_number_verified?: boolean;
	address?: OidcAddressClaim;
	updated_at?: number;
}
