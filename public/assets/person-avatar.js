(function (global) {
  var FAKE_PATTERNS = [
    /^\/avatar-ti\.png$/i,
    /^avatar-ti\.png$/i,
    /\/avatar-placeholder/i,
    /\/images\/avatar\//i
  ];

  function normalizePath(url) {
    var trimmed = String(url || "").trim();
    if (!trimmed) return "";
    if (/^(https?:|data:|blob:)/i.test(trimmed)) return trimmed;
    return trimmed.startsWith("/") ? trimmed : "/" + trimmed;
  }

  function isGraphPhotoUrl(url) {
    var normalized = normalizePath(url);
    if (!normalized) return false;

    if (/^(https?:|data:|blob:)/i.test(normalized)) {
      return /\/media\/people\//i.test(normalized);
    }

    var path = normalized.split("?")[0].toLowerCase();
    for (var i = 0; i < FAKE_PATTERNS.length; i++) {
      if (FAKE_PATTERNS[i].test(path)) return false;
    }

    return path.indexOf("/media/people/") === 0;
  }

  function resolveGraphPhotoUrl(url) {
    return isGraphPhotoUrl(url) ? normalizePath(url) : null;
  }

  function defaultEscapeAttr(value) {
    return String(value || "").replace(/"/g, "&quot;");
  }

  function renderAvatarMarkup(photoUrlValue, options) {
    options = options || {};
    var className = options.className || "person-card__avatar";
    var escapeAttr = options.escapeAttr || defaultEscapeAttr;
    var src = resolveGraphPhotoUrl(photoUrlValue);

    if (!src) {
      return (
        '<span class="' + className + " " + className + '--placeholder" aria-hidden="true">' +
        '<i class="fa-solid fa-user"></i></span>'
      );
    }

    return (
      '<img class="' + className + '" src="' + escapeAttr(src) + '" alt="" loading="lazy" ' +
      'onerror="window.PersonAvatar && window.PersonAvatar.replaceBroken(this, \'' + className + '\')" />'
    );
  }

  function replaceBroken(img, className) {
    if (!img || !img.parentNode) return;
    var base = className || "person-card__avatar";
    var placeholder = document.createElement("span");
    placeholder.className = base + " " + base + "--placeholder";
    placeholder.setAttribute("aria-hidden", "true");
    placeholder.innerHTML = '<i class="fa-solid fa-user"></i>';
    img.replaceWith(placeholder);
  }

  global.PersonAvatar = {
    isGraphPhotoUrl: isGraphPhotoUrl,
    resolveGraphPhotoUrl: resolveGraphPhotoUrl,
    renderAvatarMarkup: renderAvatarMarkup,
    replaceBroken: replaceBroken
  };
})(window);
