/* Copyright (c) 2018 Esri
 * Apache-2.0 */
define([
], function (
) {
  return {
    currentPct: 0,
    container: null,
    bar: null,

    init: function (containerId, barId) {
      this.container = document.getElementById(containerId);
      this.bar = document.getElementById(barId);
      this.clear();
    },

    show: function () {
      this.container.style.display = 'block';
    },

    hide: function () {
      this.container.style.display = 'none';
    },

    clear: function () {
      this.set(0);
    },

    set: function (percent) {
      this.currentPct = Math.max(0, Math.min(percent, 100));
      this.bar.style.width = this.currentPct + '%';
    }

  }
});
