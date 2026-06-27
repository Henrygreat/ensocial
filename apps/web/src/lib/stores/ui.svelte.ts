class UIStore {
	sidebarOpen = $state(true);
	commandOpen = $state(false);

	toggleSidebar() {
		this.sidebarOpen = !this.sidebarOpen;
	}

	openCommand() {
		this.commandOpen = true;
	}

	closeCommand() {
		this.commandOpen = false;
	}
}

export const ui = new UIStore();
