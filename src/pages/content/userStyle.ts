import { loadFull } from "tsparticles";
import { tsParticles, ISourceOptions } from "tsparticles-engine";
import fireflies from "@assets/userstyle/fireflies.json";
import sparkles from "@assets/userstyle/sparkles.json";

const createCanvas = () => {
	const particlesDiv = document.createElement("div");
	particlesDiv.id = "tsparticles";
	document.body.appendChild(particlesDiv);

	const style = document.createElement("style");
	style.innerHTML = `
		#tsparticles { 
			position: relative;
			z-index: -1; 
		}

		body {
			position: relative;
			z-index: 0;
		}
		
		body.dark main {
    background-color: transparent !important;
}`;
	style.id = "particles";
	document.head.appendChild(style);
};

const setUserStyle = () => {
	try {
		chrome.storage.local.get(["user-style-key"], (result) => {
			const data = result["user-style-key"];
			if (!data) return;
			const { customCss, bgEnabled, selectedBgImage } = data;

			if (customCss) {
				const styleElement = document.createElement("style");
				styleElement.textContent = customCss;
				styleElement.id = "user-style";
				document.head.append(styleElement);
			}
			if (bgEnabled && selectedBgImage) {
				document.body.style.backgroundImage = `url("${selectedBgImage}")`;
				document.body.style.backgroundSize = "cover";
			}
		});
	} catch (err) {
		console.warn(err);
	}
};

const userStyle = () => {
	createCanvas();

	(async () => {
		const data = await chrome.storage.local.get("user-style-key");
		if (Object.keys(data).length === 0) return;

		const { particlesEnabled, selectedPresetParticles, particlesSettings } = data["user-style-key"];
		if (!particlesEnabled) return;

		await loadFull(tsParticles);

		const presets = {
			fireflies: fireflies as ISourceOptions,
			sparkles: sparkles as ISourceOptions,
		};

		let options: ISourceOptions;
		if (data["user-style-key"]?.customParticles) {
			options = JSON.parse(data["user-style-key"].customParticles) as ISourceOptions;
		} else {
			options = presets[selectedPresetParticles];
		}

		// Set the fps limit
		options.fpsLimit = particlesSettings.fpsLimit;

		await tsParticles.load("tsparticles", options);
	})();

	setUserStyle();
};

export default userStyle;
