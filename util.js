(function() {
  "use strict";

  window.Rktrs = {
    degreeComponents(degrees) {
      const d = Math.trunc(degrees);
      const m = Math.trunc(Math.abs(degrees - d) * 60);
      const s = Math.trunc((Math.abs(degrees - d) * 60 - m) * 60);
      return [d, m, s];
    },

    /**
     * +19° 10′ 56″
     */
    formatDegrees(rawDegrees) {
      const [d, m, s] = degreeComponents(rawDegrees);
      return `${d}&deg; ${m}' ${s}"`;
    }
  };
})();