export class TabNavigator {
  constructor(
    private readonly tabButtons: HTMLButtonElement[],
    private readonly tabPanels: HTMLElement[]
  ) {}

  bind(): void {
    this.tabButtons.forEach((button) => {
      button.addEventListener("click", () => {
        const panelId = button.dataset.tabTarget;
        if (panelId) {
          this.activate(panelId);
        }
      });
    });
  }

  activate(panelId: string): void {
    this.tabButtons.forEach((button) => {
      const isCurrent = button.dataset.tabTarget === panelId;
      button.classList.toggle("is-active", isCurrent);
      button.setAttribute("aria-selected", isCurrent ? "true" : "false");
    });

    this.tabPanels.forEach((panel) => {
      panel.classList.toggle("is-active", panel.id === panelId);
    });
  }
}
