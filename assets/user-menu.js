(function () {
  "use strict";

  if (window.__LIO_USER_MENU_INIT__) return;
  window.__LIO_USER_MENU_INIT__ = true;

  function closeUserMenu(menu) {
    menu.classList.remove("is-open");
    var trigger = menu.querySelector(".user-menu__trigger");
    if (trigger) trigger.setAttribute("aria-expanded", "false");
  }

  function closeTopbarDropdown(dropdown) {
    dropdown.classList.remove("is-open");
    var trigger = dropdown.querySelector(".topbar__dropdown-trigger");
    if (trigger) trigger.setAttribute("aria-expanded", "false");
  }

  function closeAllUserMenus(except) {
    document.querySelectorAll(".user-menu.is-open").forEach(function (menu) {
      if (menu !== except) closeUserMenu(menu);
    });
  }

  function closeAllTopbarDropdowns(except) {
    document.querySelectorAll(".topbar__dropdown.is-open").forEach(function (dropdown) {
      if (dropdown !== except) closeTopbarDropdown(dropdown);
    });
  }

  function initUserMenu(menu) {
    var trigger = menu.querySelector(".user-menu__trigger");
    var panel = menu.querySelector(".user-menu__panel");
    if (!trigger || !panel) return;

    trigger.addEventListener("click", function (event) {
      event.preventDefault();
      event.stopPropagation();

      var willOpen = !menu.classList.contains("is-open");
      closeAllTopbarDropdowns(null);
      closeAllUserMenus(willOpen ? menu : null);

      if (willOpen) {
        menu.classList.add("is-open");
        trigger.setAttribute("aria-expanded", "true");
      } else {
        closeUserMenu(menu);
      }
    });

    panel.addEventListener("click", function (event) {
      event.stopPropagation();
    });

    if (window.location.pathname.endsWith("pessoas-perfil.html")) {
      var id = new URLSearchParams(window.location.search).get("id");
      if (id === "maria-silva") {
        var profileLink = panel.querySelector('a[href*="maria-silva"]');
        if (profileLink) profileLink.classList.add("is-active");
      }
    }
  }

  function initTopbarDropdowns() {
    document.querySelectorAll(".topbar__dropdown").forEach(function (dropdown) {
      var trigger = dropdown.querySelector(".topbar__dropdown-trigger");
      var menu = dropdown.querySelector(".topbar__dropdown-menu");
      if (!trigger) return;

      trigger.addEventListener("click", function (event) {
        event.preventDefault();
        event.stopPropagation();

        var willOpen = !dropdown.classList.contains("is-open");
        closeAllUserMenus(null);
        closeAllTopbarDropdowns(willOpen ? dropdown : null);

        if (willOpen) {
          dropdown.classList.add("is-open");
          trigger.setAttribute("aria-expanded", "true");
        } else {
          closeTopbarDropdown(dropdown);
        }
      });

      if (menu) {
        menu.addEventListener("click", function (event) {
          event.stopPropagation();
        });
      }
    });
  }

  function initGlobalClose() {
    document.addEventListener("click", function (event) {
      var target = event.target;

      document.querySelectorAll(".user-menu.is-open").forEach(function (menu) {
        if (menu.contains(target)) return;
        closeUserMenu(menu);
      });

      document.querySelectorAll(".topbar__dropdown.is-open").forEach(function (dropdown) {
        if (dropdown.contains(target)) return;
        closeTopbarDropdown(dropdown);
      });
    });

    document.addEventListener("keydown", function (event) {
      if (event.key !== "Escape") return;
      closeAllUserMenus(null);
      closeAllTopbarDropdowns(null);
    });
  }

  function boot() {
    document.querySelectorAll(".user-menu").forEach(initUserMenu);
    initTopbarDropdowns();
    initGlobalClose();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", boot);
  } else {
    boot();
  }
})();
