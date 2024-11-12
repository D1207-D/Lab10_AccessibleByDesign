'use strict';

// Define a class MenuButtonActions
class MenuButtonActions {
  constructor(domNode, performMenuAction) {
    this.domNode = domNode;
    this.performMenuAction = performMenuAction;
    this.buttonNode = domNode.querySelector('button');
    this.menuNode = domNode.querySelector('[role="menu"]');
    this.menuitemNodes = [];
    this.firstMenuitem = false;
    this.lastMenuitem = false;
    this.firstChars = [];

    // Initialize menu items
    var nodes = domNode.querySelectorAll('[role="menuitem"]');
    for (var i = 0; i < nodes.length; i++) {
      var menuitem = nodes[i];
      this.menuitemNodes.push(menuitem);
      menuitem.tabIndex = -1; // Start with all menu items out of the tab order
      this.firstChars.push(menuitem.textContent.trim()[0].toLowerCase());

      menuitem.addEventListener('keydown', this.onMenuitemKeydown.bind(this));
      menuitem.addEventListener('click', this.onMenuitemClick.bind(this));
      menuitem.addEventListener('mouseover', this.onMenuitemMouseover.bind(this));

      if (!this.firstMenuitem) {
        this.firstMenuitem = menuitem;
      }
      this.lastMenuitem = menuitem;
    }

    // Set focus management on button
    this.buttonNode.addEventListener('keydown', this.onButtonKeydown.bind(this));
    this.buttonNode.addEventListener('click', this.onButtonClick.bind(this));

    // Handle outside click to close the menu
    window.addEventListener('mousedown', this.onBackgroundMousedown.bind(this), true);
  }

  // Roving index implementation
  setFocusToMenuitem(newMenuitem) {
    // Set all menu items to tabindex -1
    this.menuitemNodes.forEach(item => {
      item.tabIndex = -1;
    });

    // Set new menu item tabindex to 0 and focus it
    newMenuitem.tabIndex = 0;
    newMenuitem.focus();
  }

  setFocusToFirstMenuitem() {
    this.setFocusToMenuitem(this.firstMenuitem);
  }

  setFocusToLastMenuitem() {
    this.setFocusToMenuitem(this.lastMenuitem);
  }

  setFocusToPreviousMenuitem(currentMenuitem) {
    let index = this.menuitemNodes.indexOf(currentMenuitem);
    const newMenuitem = index === 0 ? this.lastMenuitem : this.menuitemNodes[index - 1];
    this.setFocusToMenuitem(newMenuitem);
  }

  setFocusToNextMenuitem(currentMenuitem) {
    let index = this.menuitemNodes.indexOf(currentMenuitem);
    const newMenuitem = index === this.menuitemNodes.length - 1 ? this.firstMenuitem : this.menuitemNodes[index + 1];
    this.setFocusToMenuitem(newMenuitem);
  }

  onButtonKeydown(event) {
    const key = event.key;

    switch (key) {
      case 'ArrowDown':
        this.openPopup();
        this.setFocusToFirstMenuitem();
        event.preventDefault();
        break;

      case 'ArrowUp':
        this.openPopup();
        this.setFocusToLastMenuitem();
        event.preventDefault();
        break;

      case 'Escape':
        this.closePopup();
        break;
    }
  }

  onMenuitemKeydown(event) {
    const key = event.key;
    const currentMenuitem = event.currentTarget;

    switch (key) {
      case 'ArrowDown':
        this.setFocusToNextMenuitem(currentMenuitem);
        event.preventDefault();
        break;

      case 'ArrowUp':
        this.setFocusToPreviousMenuitem(currentMenuitem);
        event.preventDefault();
        break;

      case 'Enter':
        this.performMenuAction(currentMenuitem);
        this.closePopup();
        break;

      case 'Escape':
        this.closePopup();
        this.buttonNode.focus();
        break;
    }
  }

  openPopup() {
    this.menuNode.style.display = 'block';
    this.buttonNode.setAttribute('aria-expanded', 'true');
  }

  closePopup() {
    this.menuNode.style.display = 'none';
    this.buttonNode.removeAttribute('aria-expanded');
  }

  onButtonClick() {
    if (this.isOpen()) {
      this.closePopup();
    } else {
      this.openPopup();
      this.setFocusToFirstMenuitem();
    }
  }

  onMenuitemClick(event) {
    const menuitem = event.currentTarget;
    this.performMenuAction(menuitem);
    this.closePopup();
    this.buttonNode.focus();
  }

  onMenuitemMouseover(event) {
    event.currentTarget.focus();
  }

  onBackgroundMousedown(event) {
    if (!this.domNode.contains(event.target)) {
      this.closePopup();
      this.buttonNode.focus();
    }
  }

  isOpen() {
    return this.buttonNode.getAttribute('aria-expanded') === 'true';
  }
}

// Initialize menu buttons
window.addEventListener('load', function () {
  document.getElementById('action_output').value = 'none';

  function performMenuAction(node) {
    document.getElementById('action_output').value = node.textContent.trim();
  }

  const menuButtons = document.querySelectorAll('.menu-button-actions');
  menuButtons.forEach(button => new MenuButtonActions(button, performMenuAction));
});
