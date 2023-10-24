import { useContext } from "react";
import { BucketStoreContext, BucketStoreContextProps } from "./BucketStoreContext";

export const useBucketStore = (): BucketStoreContextProps => {
	const context = useContext(BucketStoreContext);
	if (!context) {
		throw new Error(
			"BucketStoreProvider's context is undefined, " +
			"please verify your are calling useBucketStore " +
			"as a child of <BucketStoreProvider> component."
		);
	}
	return context;
}
