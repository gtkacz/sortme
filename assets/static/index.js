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
	{ id: 'vite', text: 'Vite', direction: 'top' },
	{ id: 'simpleicons', text: 'Simple Icons', direction: 'top' },
];

// Create container for tooltips at the bottom of the body
const tooltipContainer = document.createElement('div');
tooltipContainer.id = 'tooltip-container';
tooltipContainer.style.position = 'fixed';
tooltipContainer.style.zIndex = '1000';
tooltipContainer.style.pointerEvents = 'none';
tooltipContainer.style.top = '0';
tooltipContainer.style.left = '0';
document.body.appendChild(tooltipContainer);

tooltipButtons.forEach(btn => {
	const element = document.getElementById(btn.id);
	if (!element) return;
	
	// Create tooltip in the container
	const tooltip = document.createElement('div');
	tooltip.className = 'control-tooltip';
	tooltip.id = `tooltip-${btn.id}`;
	tooltip.textContent = btn.text;
	tooltip.style.display = 'none';
	tooltip.style.position = 'absolute';
	tooltip.style.width = btn.text.length * 12 + 'px'; // Roughly estimate the width
	tooltipContainer.appendChild(tooltip);
	
	// Show/hide tooltip with proper positioning
	element.addEventListener('mouseenter', () => {
		tooltip.style.display = 'block';
		// Get positioning after tooltip is visible to calculate its dimensions
		setTimeout(() => {
			const rect = element.getBoundingClientRect();
		
		if (btn.direction === 'top') {
			tooltip.style.top = `${rect.top - tooltip.offsetHeight - 8}px`;
			tooltip.style.left = `${rect.left + rect.width / 2}px`;
			tooltip.style.transform = 'translateX(-50%)';
		} else if (btn.direction === 'right') {
			tooltip.style.top = `${rect.top + rect.height / 2}px`;
			tooltip.style.left = `${rect.right + 8}px`;
			tooltip.style.transform = 'translateY(-50%)';
		} else if (btn.direction === 'bottom') {
			tooltip.style.top = `${rect.bottom + 8}px`;
			tooltip.style.left = `${rect.left + rect.width / 2}px`;
			tooltip.style.transform = 'translateX(-50%)';
		} else if (btn.direction === 'left') {
			tooltip.style.top = `${rect.top + rect.height / 2}px`;
			tooltip.style.left = `${rect.left - tooltip.offsetWidth - 8}px`;
			tooltip.style.transform = 'translateY(-50%)';
		}
		}, 0);
	});
	
	element.addEventListener('mouseleave', () => {
		tooltip.style.display = 'none';
	});
});

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
	let inactivityTimer = null;
	let inactivityDelay = 10000; // Default 10 seconds

	// Function to set custom inactivity delay
	function setInactivityDelay(milliseconds) {
		inactivityDelay = milliseconds;
		resetInactivityTimer();
	}
	
	// Expose the function globally
	window.setInactivityDelay = setInactivityDelay;

	// Reset and start inactivity timer
	function resetInactivityTimer() {
		clearTimeout(inactivityTimer);
		inactivityTimer = setTimeout(() => {
			if (!isAnimating) {
				animateSorting();
			}
		}, inactivityDelay);
	}

	// Initialize the inactivity timer
	resetInactivityTimer();

	// Add event listeners to detect user activity
	waveText.addEventListener('mouseenter', () => {
		if (isAnimating) return;
		animateSorting();
	});
	
	// Reset timer on user interaction
	document.addEventListener('mousemove', resetInactivityTimer);
	document.addEventListener('click', resetInactivityTimer);
	document.addEventListener('keypress', resetInactivityTimer);

	function animateSorting() {
		isAnimating = true;
		clearTimeout(inactivityTimer); // Clear timer during animation

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
							resetInactivityTimer(); // Restart inactivity timer after animation completes
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