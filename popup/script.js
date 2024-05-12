const closeButton = document.getElementById("close");
closeButton.addEventListener("click", () => window.close());

async function main() {
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
	});
	const currentTabs = await browser.tabs.query({ active: true });
	if (new URL(currentTabs[0].url).hostname == "") {
		thissite.style.display = "none";
	} else {
		if (whitelist.indexOf(new URL(currentTabs[0].url).hostname) != -1) {
			thissite.innerText = "Remove This Site From Whitelist";
			thissite.classList.remove("primary");
			thissite.classList.add("danger");
		}
		thissite.addEventListener("click", async () => {
			if (whitelist.indexOf(new URL(currentTabs[0].url).hostname) != -1) {
				whitelist.splice(whitelist.indexOf(new URL(currentTabs[0].url).hostname), 1);
				thissite.innerText = "Whitelist This Site";
				thissite.classList.remove("danger");
				thissite.classList.add("primary");
			} else {
				whitelist.push(new URL(currentTabs[0].url).hostname);
				thissite.innerText = "Remove This Site From Whitelist";
				thissite.classList.remove("primary");
				thissite.classList.add("danger");
			}
			await browser.storage.sync.set({ whitelist: whitelist });
		});
	}
	function refreshWhitelistView() {
		whiltelistView.innerHTML = "";
		if (whitelist.length == 0) {
			const text = document.createElement("i");
			text.innerText = "No whitelisted sites";
			text.style.fontSize = "10px";
			whiltelistView.appendChild(text);
		} else {
			for (const site of whitelist) {
				const el = document.createElement("button");
				el.textContent = site;
				el.classList.add("secondary");
				el.addEventListener("click", async () => {
					whitelist.splice(whitelist.indexOf(site), 1);
					if (new URL(currentTabs[0].url).hostname == site) {
						thissite.innerText = "Whitelist This Site";
						thissite.classList.remove("danger");
						thissite.classList.add("primary");
					}
					await browser.storage.sync.set({ whitelist: whitelist });
					refreshWhitelistView();
				});
				whiltelistView.appendChild(el);
			}
		}
	}
	refreshWhitelistView();
}

browser.permissions.contains({ origins: ["<all_urls>"] }).then(async (status) => {
	if (status) {
		await main();
	} else {
		document.getElementById("content").style.display = "none";
		document.getElementById("permissions-needed").style.display = "block";
		document.getElementById("reqperms").addEventListener("click", async () => {
			const result = await browser.permissions.request({ origins: ["<all_urls>"] });
			if (result) {
				document.getElementById("content").style.display = "block";
				document.getElementById("permissions-needed").style.display = "none";
				await browser.action.setBadgeText({ text: "" });
				await browser.action.setBadgeBackgroundColor({ color: "#5b5b66" });
				await main();
			}
		});
	}
});
