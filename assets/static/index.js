document.getElementById("currentYear").innerHTML = new Date().getFullYear();

class ListSorter {
	constructor() {
		this.input = document.getElementById("input");
		this.customSeparator = document.getElementById("toggleSeparators");
		this.sortedList = document.getElementById("sortedList");
		this.selectAllBtn = document.getElementById("selectAll");
		this.copySelectedBtn = document.getElementById("copySelected");
		this.deleteSelectedBtn = document.getElementById("deleteSelected");
		this.shareBtn = document.getElementById("shareBtn");
		this.clearUrlBtn = document.getElementById("clearUrlBtn");
		this.toast = document.getElementById("toast");
		this.showIndices = document.getElementById('showIndices');
		this.resetListBtn = document.getElementById("resetList");

		this.items = [];
		this.setupEventListeners();
		this.loadStateFromURL();
	}

	setupEventListeners() {
		this.resetListBtn.addEventListener("click", () => this.resetList());
		this.showIndices.addEventListener('change', () => this.toggleIndices());
		this.input.addEventListener("input", () => this.processInput());
		this.customSeparator.addEventListener("input", () => this.processInput());
		this.selectAllBtn.addEventListener("click", () => {
			this.toggleSelectAll();
			this.updateControlButtons();
		});
		this.copySelectedBtn.addEventListener("click", () => this.copySelected());
		this.deleteSelectedBtn.addEventListener("click", () =>
			this.deleteSelected()
		);
		this.shareBtn.addEventListener("click", () => this.copyShareURL());
		this.clearUrlBtn.addEventListener("click", () => this.clearURL());

		// Drag and drop event
		this.sortedList.addEventListener("dragover", (e) => {
			e.preventDefault();
			const draggingItem = this.sortedList.querySelector(".dragging");
			const siblings = [...this.sortedList.querySelectorAll(".list-item:not(.dragging)")];

			const nextSibling = siblings.find(sibling => {
				return e.clientY <= sibling.getBoundingClientRect().top +
					sibling.getBoundingClientRect().height / 2;
			});

			if (nextSibling) {
				this.sortedList.insertBefore(draggingItem, nextSibling);
			} else {
				this.sortedList.appendChild(draggingItem);
			}

			// Immediately update indices during drag
			this.updateItemsOrder();
		});
	}

	detectSeparator(text) {
		if (this.customSeparator.value) return this.customSeparator.value;
		if (text.includes("\n")) return "\n";
		if (text.includes(",")) return ",";
		if (text.includes(";")) return ";";
		return "\n";
	}

	processInput() {
		const text = this.input.value.trim();
		const separator = this.detectSeparator(text);
		this.items = text
			.split(separator)
			.map((item) => item.trim())
			.filter((item) => item)
			.sort((a, b) => a.localeCompare(b));
		this.renderList();
		this.updateURLState();
	}

	renderList() {
		this.sortedList.innerHTML = this.items
			.map(
				(item, index) => `
				<div class="list-item" draggable="true">
					<div class="checkbox-wrapper">
					<label class="checkbox">
						<input type="checkbox">
						<svg><use xlink:href="#checkbox-svg"></use></svg>
					</label>
					</div>
					<span>${item}</span>
					<span class="item-index">#${index + 1}</span>
				</div>
				`
			)
			.join("");

		// Add event listeners for drag events and checkbox changes
		this.sortedList.querySelectorAll(".list-item").forEach((item) => {
			item.addEventListener("dragstart", () => item.classList.add("dragging"));
			item.addEventListener("dragend", () => {
				item.classList.remove("dragging");
				this.updateItemsOrder();
			});
		});

		// Update the control buttons whenever a checkbox changes
		this.sortedList.querySelectorAll('input[type="checkbox"]').forEach((cb) => {
			cb.addEventListener("change", () => this.updateControlButtons());
		});
		this.updateControlButtons();
	}

	removeItem(index) {
		this.items.splice(index, 1);
		this.renderList();
		this.updateURLState();
	}

	updateItemsOrder() {
		const items = [...this.sortedList.querySelectorAll(".list-item")];
		this.items = items.map(item =>
			item.querySelector("span:not(.checkbox):not(.item-index)").textContent
		);

		// Update indices with #
		items.forEach((item, index) => {
			item.querySelector(".item-index").textContent = `#${index + 1}`;
		});

		this.updateURLState();
	}

	toggleSelectAll() {
		const checkboxes = this.sortedList.querySelectorAll(
			'input[type="checkbox"]'
		);
		const allChecked = [...checkboxes].every((cb) => cb.checked);
		checkboxes.forEach((cb) => (cb.checked = !allChecked));
	}

	updateControlButtons() {
		const checkboxes = this.sortedList.querySelectorAll(
			'input[type="checkbox"]'
		);
		const anySelected = Array.from(checkboxes).some((cb) => cb.checked);
		const allChecked =
			checkboxes.length > 0 && Array.from(checkboxes).every((cb) => cb.checked);

		this.deleteSelectedBtn.classList.toggle("disabled", !anySelected);
		this.copySelectedBtn.classList.toggle("disabled", !anySelected);

		this.selectAllBtn.textContent = allChecked ? "Unselect All" : "Select All";
		this.selectAllBtn.classList.toggle("disabled", this.items.length === 0);

		this.resetListBtn.classList.toggle("disabled", this.items.length === 0);

		this.shareBtn.disabled = !(
			this.items.length > 0 || this.customSeparator.value
		);
		this.shareBtn.classList.toggle("disabled", this.shareBtn.disabled);
	}

	updateURLState() {
		const params = new URLSearchParams();
		if (this.customSeparator.value)
			params.set("separator", this.customSeparator.value);
		if (this.items.length) params.set("items", this.items.join(","));
		window.history.replaceState({}, "", `?${params.toString()}`);
		this.parseClearUrlBtnEnabled()
	}

	loadStateFromURL() {
		const params = new URLSearchParams(window.location.search);
		this.customSeparator.value = params.get("separator") || "";
		const itemsParam = params.get("items");
		if (itemsParam) {
			this.input.value = itemsParam.split(",").join("\n");
			this.processInput();
		}
		this.parseClearUrlBtnEnabled()
	}

	parseClearUrlBtnEnabled() {
		const params = new URLSearchParams(window.location.search);
		this.clearUrlBtn.disabled = !params.has("separator") && !params.has("items");
		this.clearUrlBtn.classList.toggle("disabled", this.clearUrlBtn.disabled);
	}

	clearURL() {
		window.history.replaceState({}, "", window.location.pathname);
		this.customSeparator.value = "";
		this.input.value = "";
		this.processInput();
	}

	copyShareURL() {
		this.updateURLState();
		navigator.clipboard.writeText(window.location.href).then(() => {
			this.showToast("Link copied to clipboard!");
		});
	}

	copySelected() {
		const selectedItems = [...this.sortedList.querySelectorAll(".list-item")]
			.filter((item) => item.querySelector('input[type="checkbox"]').checked)
			.map((item) => item.querySelector("span:not(.checkbox)").textContent);
		if (selectedItems.length === 0) return;
		navigator.clipboard
			.writeText(selectedItems.join(","))
			.then(() => this.showToast("Copied to clipboard!"));
	}

	deleteSelected() {
		const newItems = [...this.sortedList.querySelectorAll(".list-item")]
			.filter((item) => !item.querySelector('input[type="checkbox"]').checked)
			.map((item) => item.querySelector("span:not(.checkbox)").textContent);
		this.items = newItems;
		this.renderList();
		this.updateURLState();
	}

	showToast(message) {
		this.toast.textContent = message;
		this.toast.classList.add("show");
		setTimeout(() => this.toast.classList.remove("show"), 2000);
	}

	toggleIndices() {
		this.sortedList.classList.toggle('show-indices', this.showIndices.checked);
	}

	resetList() {
		this.processInput();
		this.renderList();
		this.updateURLState();
	}
}

const listSorter = new ListSorter();

// Help modal functionality
const helpIcon = document.getElementById("helpIcon");
const helpModal = document.getElementById("helpModal");
const modalClose = helpModal.querySelector(".close");

helpIcon.addEventListener("click", () => {
	helpModal.style.display = "block";
});

modalClose.addEventListener("click", () => {
	helpModal.style.display = "none";
});

window.addEventListener("click", (event) => {
	if (event.target == helpModal) {
		helpModal.style.display = "none";
	}
});

// Add tooltips to all buttons
const tooltipButtons = [
	{ id: 'copySelected', text: 'Copy selected items to clipboard', direction: 'top' },
	{ id: 'deleteSelected', text: 'Delete selected items', direction: 'top' },
	{ id: 'shareBtn', text: 'Share link to current list', direction: 'top' },
	{ id: 'resetList', text: 'Reset the list to as it was at the moment of input', direction: 'right' },
	{ id: 'clearUrlBtn', text: 'Clear all data', direction: 'top' },
	{ id: 'toggleIndices', text: 'Show indices', direction: 'top' },
	{ id: 'github', text: 'Source code on GitHub', direction: 'top' },
	{ id: 'googlefonts', text: 'Google Fonts', direction: 'top' },
	{ id: 'tabler', text: 'Tabler', direction: 'top' },
	{ id: 'simpleicons', text: 'Simple Icons', direction: 'top' },
];

tooltipButtons.forEach(btn => {
	const element = document.getElementById(btn.id);
	const tooltip = document.createElement('div');
	tooltip.className = 'control-tooltip';
	tooltip.textContent = btn.text;
	tooltip.style.cssText = `
		display: none;
		position: absolute;
		${btn.direction === 'top' ? 'bottom: calc(100% + 8px); left: 50%; transform: translateX(-50%);' : ''}
		${btn.direction === 'left' ? 'right: calc(100% + 8px); top: 50%; transform: translateY(-50%);' : ''}
		`;
	element.appendChild(tooltip);
	element.addEventListener('mouseenter', () => tooltip.style.display = 'block');
	element.addEventListener('mouseleave', () => tooltip.style.display = 'none');
});

const separators = ['\n', ';', ','];
let editingSeparators = false;

document.getElementById('toggleSeparators').addEventListener('click', () => {
	editingSeparators = !editingSeparators;
	document.getElementById('separator-chips-container').style.display =
		editingSeparators ? 'flex' : 'none';
	document.getElementById('separator-input-wrapper').style.display =
		editingSeparators ? 'flex' : 'none';
	updateSeparatorsDisplay();
});

function updateSeparatorsDisplay() {
	const container = document.getElementById('separator-chips-container');
	container.innerHTML = '';
	separators.forEach(sep => {
		const chip = document.createElement('div');
		chip.className = 'separator-chip';
		chip.innerHTML = `
		<span>${sep === '\n' ? '\\n' : sep}</span>
		<button type="button" class="delete-separator">&times;</button>
	  `;
		chip.querySelector('button').addEventListener('click', () => {
			separators.splice(separators.indexOf(sep), 1);
			updateSeparatorsDisplay();
		});
		container.appendChild(chip);
	});
}

document.getElementById('save-separators').addEventListener('click', () => {
	const input = document.getElementById('separator-input');
	if (input.value.trim()) {
		separators.push(input.value.trim());
		input.value = '';
		updateSeparatorsDisplay();
	}
});

document.getElementById('separator-input').addEventListener('keyup', (e) => {
	if (e.key === 'Enter' || e.key === ',') {
		document.getElementById('save-separators').click();
	}
});

// Initialize separators
updateSeparatorsDisplay();

// First, include the sorting function
function sortStringWithSteps(inputString) {
	const chars = inputString.split('');
	const steps = [];

	steps.push([...chars]);

	for (let i = 0; i < chars.length; i++) {
		let swapped = false;

		for (let j = 0; j < chars.length - i - 1; j++) {
			if (chars[j] > chars[j + 1]) {
				[chars[j], chars[j + 1]] = [chars[j + 1], chars[j]];
				swapped = true;
				steps.push([...chars]);
			}
		}

		if (!swapped) break;
	}

	return steps;
}

// Animation controller
document.addEventListener('DOMContentLoaded', () => {
	const waveText = document.querySelector('.wave-text');
	let isAnimating = false;

	waveText.addEventListener('mouseenter', () => {
		if (isAnimating) return;

		animateSorting();
	});

	function animateSorting() {
		isAnimating = true;

		// Extract text from spans
		const spans = waveText.querySelectorAll('span');
		let originalText = '';

		spans.forEach(span => {
			originalText += span.textContent;
		});

		// Get sorting steps
		const sortingSteps = sortStringWithSteps(originalText);
		const totalSteps = sortingSteps.length;

		// Animate forward
		let stepIndex = 0;
		const forwardInterval = setInterval(() => {
			if (stepIndex >= totalSteps) {
				clearInterval(forwardInterval);

				// Wait 10 seconds before reversing
				setTimeout(() => {
					// Animate backward
					let reverseIndex = totalSteps - 2; // Start from the second-to-last step

					const backwardInterval = setInterval(() => {
						if (reverseIndex < 0) {
							clearInterval(backwardInterval);
							isAnimating = false;
							return;
						}

						// Update spans with characters from current step
						spans.forEach((span, i) => {
							if (i < sortingSteps[reverseIndex].length) {
								span.textContent = sortingSteps[reverseIndex][i];
							}
						});

						reverseIndex--;
					}, 500); // Adjust speed as needed

				}, 10000); // 10 second wait

				return;
			}

			// Update spans with characters from current step
			spans.forEach((span, i) => {
				if (i < sortingSteps[stepIndex].length) {
					span.textContent = sortingSteps[stepIndex][i];
				}
			});

			stepIndex++;
		}, 500); // Adjust speed as needed
	}
});