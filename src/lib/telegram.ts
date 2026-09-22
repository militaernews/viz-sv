// Telegram Mini App integration: applies the host client's theme (light/dark,
// accent colors, native font stack) on top of the ledger design system, and
// adapts chrome (back button, main button, haptics, viewport) when running
// inside Telegram. A no-op everywhere else - the app works the same as a
// normal website when not embedded.

interface TelegramThemeParams {
	bg_color?: string;
	secondary_bg_color?: string;
	section_bg_color?: string;
	text_color?: string;
	hint_color?: string;
	link_color?: string;
	button_color?: string;
	button_text_color?: string;
	accent_text_color?: string;
	destructive_text_color?: string;
	subtitle_text_color?: string;
}

interface TelegramMainButton {
	text: string;
	isVisible: boolean;
	isActive: boolean;
	setText(text: string): void;
	show(): void;
	hide(): void;
	enable(): void;
	disable(): void;
	showProgress(leaveActive?: boolean): void;
	hideProgress(): void;
	onClick(cb: () => void): void;
	offClick(cb: () => void): void;
}

interface TelegramHapticFeedback {
	impactOccurred(style: 'light' | 'medium' | 'heavy' | 'rigid' | 'soft'): void;
	notificationOccurred(type: 'error' | 'success' | 'warning'): void;
	selectionChanged(): void;
}

interface TelegramWebApp {
	initData: string;
	themeParams: TelegramThemeParams;
	colorScheme: 'light' | 'dark';
	viewportStableHeight: number;
	BackButton: {
		show(): void;
		hide(): void;
		onClick(cb: () => void): void;
		offClick(cb: () => void): void;
	};
	MainButton: TelegramMainButton;
	HapticFeedback: TelegramHapticFeedback;
	ready(): void;
	expand(): void;
	disableVerticalSwipes?: () => void;
	setHeaderColor?: (color: string) => void;
	setBackgroundColor?: (color: string) => void;
	onEvent(event: 'themeChanged' | 'viewportChanged', cb: () => void): void;
}

declare global {
	interface Window {
		Telegram?: { WebApp?: TelegramWebApp };
	}
}

export function getTelegramWebApp(): TelegramWebApp | undefined {
	const webApp = window.Telegram?.WebApp;
	// A bare page visit (not opened from Telegram) still has window.Telegram.WebApp
	// defined by the SDK script, but with empty initData.
	return webApp?.initData ? webApp : undefined;
}

function applyTheme(webApp: TelegramWebApp): void {
	const theme = webApp.themeParams;
	const root = document.documentElement.style;

	// Maps Telegram's theme params onto daisyUI's own --color-* tokens, which
	// every component (via Tailwind utilities like bg-base-100, or the
	// color-mix()-based @utility classes in app.css) reads from - so this one
	// mapping reaches the whole app, not just a hardcoded subset of surfaces.
	// base-100 intentionally has no bg_color fallback: it's the color panels
	// (the search header, bottom sheets) use to stand out from the page body,
	// which is itself bg_color - falling back to the same value would make
	// every panel blend invisibly into the page whenever a Telegram client
	// doesn't supply a distinct secondary_bg_color.
	const map: Record<string, string | undefined> = {
		'--color-base-100': theme.secondary_bg_color,
		'--color-base-200': theme.section_bg_color ?? theme.secondary_bg_color,
		'--color-base-300': theme.hint_color,
		'--color-neutral': theme.bg_color,
		'--color-neutral-content': theme.subtitle_text_color ?? theme.hint_color,
		'--color-base-content': theme.text_color,
		'--color-primary': theme.button_color,
		'--color-primary-content': theme.button_text_color,
		'--color-secondary': theme.link_color,
		'--color-error': theme.destructive_text_color
	};

	for (const [property, value] of Object.entries(map)) {
		if (value) root.setProperty(property, value);
	}

	// Keeps native form-control chrome (date picker, scrollbar, checkboxes)
	// in sync with light/dark rather than always rendering as dark widgets.
	root.setProperty('color-scheme', webApp.colorScheme);

	if (theme.bg_color) document.body.style.backgroundColor = theme.bg_color;
	webApp.setHeaderColor?.(theme.bg_color ?? '#000000');
	webApp.setBackgroundColor?.(theme.bg_color ?? '#000000');
}

/** Call once from the root layout. */
export function initTelegramWebApp(): void {
	const webApp = getTelegramWebApp();
	if (!webApp) return;

	webApp.ready();
	webApp.expand();
	webApp.disableVerticalSwipes?.();

	// Telegram's own chrome already uses the platform's native font; keeping
	// our branded serif/sans pairing on top of it reads as a website, not part
	// of the client, so fall back to the system stack when embedded.
	document.documentElement.style.setProperty(
		'--font-sans',
		'-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
	);
	document.documentElement.style.setProperty('--font-editorial', 'inherit');

	applyTheme(webApp);
	webApp.onEvent('themeChanged', () => applyTheme(webApp));
}

export function haptic(kind: 'light' | 'medium' | 'success' | 'error' = 'light'): void {
	const webApp = getTelegramWebApp();
	if (!webApp) return;

	if (kind === 'success' || kind === 'error') {
		webApp.HapticFeedback.notificationOccurred(kind);
	} else {
		webApp.HapticFeedback.impactOccurred(kind);
	}
}

/**
 * Drives Telegram's native MainButton as a stand-in for an in-page primary
 * action button. Returns a cleanup function - call it when the calling
 * component unmounts or the action no longer applies (e.g. leaving the page).
 */
export function useMainButton(opts: {
	text: string;
	enabled: boolean;
	loading: boolean;
	onClick: () => void;
}): () => void {
	const webApp = getTelegramWebApp();
	if (!webApp) return () => {};

	const { MainButton } = webApp;
	MainButton.setText(opts.text);
	opts.enabled ? MainButton.enable() : MainButton.disable();
	if (opts.loading) MainButton.showProgress(true);
	else MainButton.hideProgress();
	MainButton.show();
	MainButton.onClick(opts.onClick);

	return () => {
		MainButton.offClick(opts.onClick);
		MainButton.hide();
	};
}
