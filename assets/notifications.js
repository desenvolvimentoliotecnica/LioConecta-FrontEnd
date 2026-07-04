(function () {
  "use strict";

  if (window.__LIO_NOTIFICATIONS_INIT__) return;
  window.__LIO_NOTIFICATIONS_INIT__ = true;

  function closeNotificationsMenu(menu) {
    menu.classList.remove("is-open");
    var trigger = menu.querySelector(".notifications-menu__trigger");
    if (trigger) trigger.setAttribute("aria-expanded", "false");
  }

  function closeAllNotifications(except) {
    document.querySelectorAll(".notifications-menu.is-open").forEach(function (menu) {
      if (menu !== except) closeNotificationsMenu(menu);
    });
  }

  function closeUserMenus() {
    document.querySelectorAll(".user-menu.is-open").forEach(function (menu) {
      menu.classList.remove("is-open");
      var trigger = menu.querySelector(".user-menu__trigger");
      if (trigger) trigger.setAttribute("aria-expanded", "false");
    });
  }

  function closeTopbarDropdowns() {
    document.querySelectorAll(".topbar__dropdown.is-open").forEach(function (dropdown) {
      dropdown.classList.remove("is-open");
      var trigger = dropdown.querySelector(".topbar__dropdown-trigger");
      if (trigger) trigger.setAttribute("aria-expanded", "false");
    });
  }

  function initNotificationsMenu(menu) {
    var trigger = menu.querySelector(".notifications-menu__trigger");
    var panel = menu.querySelector(".notifications-menu__panel");
    if (!trigger || !panel) return;

    trigger.addEventListener("click", function (event) {
      event.preventDefault();
      event.stopPropagation();

      var willOpen = !menu.classList.contains("is-open");
      closeUserMenus();
      closeTopbarDropdowns();
      closeAllNotifications(willOpen ? menu : null);

      if (willOpen) {
        menu.classList.add("is-open");
        trigger.setAttribute("aria-expanded", "true");
      } else {
        closeNotificationsMenu(menu);
      }
    });

    panel.addEventListener("click", function (event) {
      event.stopPropagation();
    });

    var markReadBtn = menu.querySelector(".notifications-menu__mark-read");
    if (markReadBtn) {
      markReadBtn.addEventListener("click", function () {
        menu.setAttribute("data-badge", "0");
        menu.querySelectorAll(".notifications-menu__item--unread").forEach(function (item) {
          item.classList.remove("notifications-menu__item--unread");
        });
      });
    }

    menu.querySelectorAll(".notifications-menu__item").forEach(function (item) {
      item.addEventListener("click", function () {
        item.classList.remove("notifications-menu__item--unread");
        var unread = menu.querySelectorAll(".notifications-menu__item--unread").length;
        menu.setAttribute("data-badge", String(unread));
      });
    });
  }

  function initGlobalClose() {
    document.addEventListener("click", function (event) {
      document.querySelectorAll(".notifications-menu.is-open").forEach(function (menu) {
        if (menu.contains(event.target)) return;
        closeNotificationsMenu(menu);
      });
    });

    document.addEventListener("keydown", function (event) {
      if (event.key !== "Escape") return;
      closeAllNotifications(null);
    });
  }

  window.LioNotifications = {
    closeAll: closeAllNotifications,
  };

  function boot() {
    document.querySelectorAll(".notifications-menu").forEach(initNotificationsMenu);
    initGlobalClose();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", boot);
  } else {
    boot();
  }
})();
