async function main() {
	const close = document.getElementById("close");
	close.addEventListener("click", () => window.close());

	const thissite = document.getElementById("toggle-thissite");
	const whiltelistView = document.getElementById("whitelist");
	const res = await browser.storage.sync.get("whitelist");
	/**
	 * @type {String[]}
	 */
	let whitelist = res?.whitelist ?? [];
	browser.storage.onChanged.addListener((changes, areaName) => {
		if (areaName == "sync" && changes.whitelist != null && changes.whitelist.newValue != null) {
			whitelist = changes.whitelist.newValue;
			refreshWhitelistView();
		}
	})
	const currentTabs = await browser.tabs.query({active: true});
	console.log(currentTabs);
	if (whitelist.indexOf(new URL(currentTabs[0].url).hostname) != -1) {
		thissite.innerText = "Remove This Site From Whitelist"
	}
	thissite.addEventListener("click", async () => {
		if (whitelist.indexOf(new URL(currentTabs[0].url).hostname) != -1) {
			whitelist.splice(whitelist.indexOf(new URL(currentTabs[0].url).hostname), 1);
			thissite.innerText = "Whitelist This Site"
		} else {
			whitelist.push(new URL(currentTabs[0].url).hostname);
			thissite.innerText = "Remove This Site From Whitelist"
		}
		await browser.storage.sync.set({"whitelist": whitelist});
	})
	function refreshWhitelistView() {
		whiltelistView.innerHTML = "";
		for (const site of whitelist) {
			const el = document.createElement("button")
			el.textContent = site;
			el.addEventListener("click", async () => {
				whitelist.splice(whitelist.indexOf(site), 1);
				if (new URL(currentTabs[0].url).hostname == site) thissite.innerText = "Whitelist This Site";
				await browser.storage.sync.set({"whitelist": whitelist});
				refreshWhitelistView();
			})
			whiltelistView.appendChild(el);
		}
	}
	refreshWhitelistView();
}
void main();