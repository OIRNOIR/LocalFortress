/**
 * @type {String[]}
 */
let whitelist = [];

/**
 * @type {Map<number, number>}
 */
const requestCounts = new Map();

let permissions = false;

async function asyncActions() {
	const resultOne = await browser.storage.sync.get("whitelist");
	whitelist = resultOne.whitelist;
	if (whitelist == null) {
		whitelist = [];
		await browser.storage.sync.set({ whitelist: whitelist });
	}
}

/**
 * @param {browser.webRequest._OnBeforeRequestDetails} details
 */
function determineOriginPermission(details) {
	if (details.documentUrl == null) return true; // This is the top-level document
	for (const origin of [details.documentUrl, ...details.frameAncestors.map((a) => a.url)]) {
		if (
			["0.0.0.0", "localhost", "::1"].indexOf(new URL(origin).hostname) == -1 &&
			!(new URL(origin).hostname.match(/127\.\d{1,3}\.\d{1,3}\.\d{1,3}/g)?.length > 0) &&
			whitelist.indexOf(new URL(origin).hostname) == -1
		)
			return false;
	}
	return true;
}

browser.webRequest.onBeforeRequest.addListener(
	(details) => {
		if (
			["0.0.0.0", "localhost", "::1"].indexOf(new URL(details.url).hostname) != -1 ||
			new URL(details.url).hostname.match(/127\.\d{1,3}\.\d{1,3}\.\d{1,3}/g)?.length > 0
		) {
			if (determineOriginPermission(details) == false) {
				if (details.tabId != -1) {
					if (requestCounts.has(details.tabId)) {
						requestCounts.set(details.tabId, requestCounts.get(details.tabId) + 1);
					} else {
						requestCounts.set(details.tabId, 1);
					}
				}
				browser.action.setBadgeText({
					text: requestCounts.has(details.tabId) ? String(requestCounts.get(details.tabId)) : null,
					tabId: details.tabId,
				});
				browser.action.setBadgeBackgroundColor({ color: "#5b5b66" });
				return {
					cancel: true,
				};
			}
		}
		return {
			cancel: false,
		};
	},
	{
		urls: ["<all_urls>", "ws://*/*", "wss://*/*"],
		types: [
			"beacon",
			"csp_report",
			"font",
			"image",
			"imageset",
			"media",
			"object",
			"script",
			"speculative",
			"stylesheet",
			"sub_frame",
			"web_manifest",
			"websocket",
			"xml_dtd",
			"xmlhttprequest",
			"xslt",
			"other",
		],
	},
	["blocking"],
);

browser.tabs.onUpdated.addListener(async (tabId, changeInfo, tab) => {
	if (!permissions) return;
	if (changeInfo.status == "loading") requestCounts.delete(tabId);
	await browser.action.setBadgeText({ text: "" });
	await browser.action.setBadgeBackgroundColor({ color: "#5b5b66" });
});

browser.storage.onChanged.addListener((changes, areaName) => {
	if (areaName == "sync" && changes.whitelist != null && changes.whitelist.newValue != null) {
		whitelist = changes.whitelist.newValue;
	}
});

void asyncActions();

browser.permissions.contains({ origins: ["<all_urls>"] }).then(async (status) => {
	if (status) {
		permissions = true;
	} else {
		await browser.action.setBadgeText({ text: "!" });
		await browser.action.setBadgeBackgroundColor({ color: "#ffee00" });
	}
});

browser.permissions.onAdded.addListener((perms) => {
	if (perms.origins.includes("<all_urls>")) {
		permissions = true;
	}
});
