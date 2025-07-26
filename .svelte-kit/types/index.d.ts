type DynamicRoutes = {
	
};

type Layouts = {
	"/": undefined;
	"/history": undefined;
	"/privacy-policy": undefined
};

export type RouteId = "/" | "/history" | "/privacy-policy";

export type RouteParams<T extends RouteId> = T extends keyof DynamicRoutes ? DynamicRoutes[T] : Record<string, never>;

export type LayoutParams<T extends RouteId> = Layouts[T] | Record<string, never>;

export type Pathname = "/" | "/history" | "/privacy-policy";

export type ResolvedPathname = `${"" | `/${string}`}${Pathname}`;

export type Asset = "/favicon.png" | "/placeholder.svg";