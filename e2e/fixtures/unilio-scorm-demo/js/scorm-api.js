/**
 * SCORM 1.2 API wrapper — finds LMS API in parent/top frames.
 */
(function (global) {
  'use strict';

  var API = null;
  var findAttempts = 0;
  var MAX_FIND_ATTEMPTS = 500;

  function findAPI(win) {
    while (win && findAttempts < MAX_FIND_ATTEMPTS) {
      findAttempts += 1;
      if (win.API) {
        return win.API;
      }
      if (win.parent && win.parent !== win) {
        win = win.parent;
      } else {
        break;
      }
    }
    return null;
  }

  function getAPI() {
    if (API) {
      return API;
    }
    API = findAPI(window);
    if (!API && window.opener) {
      API = findAPI(window.opener);
    }
    if (!API && window.top && window.top !== window) {
      API = findAPI(window.top);
    }
    return API;
  }

  function call(fnName) {
    var api = getAPI();
    if (!api || typeof api[fnName] !== 'function') {
      return 'false';
    }
    try {
      var args = Array.prototype.slice.call(arguments, 1);
      if (args.length === 0) {
        return api[fnName]('');
      }
      return api[fnName].apply(api, args);
    } catch (e) {
      console.warn('[SCORM] ' + fnName + ' failed:', e);
      return 'false';
    }
  }

  function ok(result) {
    return result === 'true' || result === true;
  }

  var ScormAPI = {
    isAvailable: function () {
      return !!getAPI();
    },

    initialize: function () {
      return ok(call('LMSInitialize', ''));
    },

    finish: function () {
      return ok(call('LMSFinish', ''));
    },

    getValue: function (element) {
      return call('LMSGetValue', element) || '';
    },

    setValue: function (element, value) {
      return ok(call('LMSSetValue', element, String(value)));
    },

    commit: function () {
      return ok(call('LMSCommit', ''));
    },

    getLastError: function () {
      return call('LMSGetLastError', '');
    },

    getErrorString: function (code) {
      return call('LMSGetErrorString', code || '');
    },

    getDiagnostic: function (code) {
      return call('LMSGetDiagnostic', code || '');
    },

    getStudentName: function () {
      return this.getValue('cmi.core.student_name') || '';
    },

    getLessonStatus: function () {
      return this.getValue('cmi.core.lesson_status') || 'not attempted';
    },

    setLessonStatus: function (status) {
      return this.setValue('cmi.core.lesson_status', status);
    },

    getLessonLocation: function () {
      return this.getValue('cmi.core.lesson_location') || '';
    },

    setLessonLocation: function (location) {
      return this.setValue('cmi.core.lesson_location', location);
    },

    getSuspendData: function () {
      return this.getValue('cmi.suspend_data') || '';
    },

    setSuspendData: function (data) {
      var payload = String(data || '');
      if (payload.length > 4096) {
        payload = payload.slice(0, 4096);
      }
      return this.setValue('cmi.suspend_data', payload);
    },

    getScoreRaw: function () {
      return this.getValue('cmi.core.score.raw') || '';
    },

    setScore: function (raw, min, max) {
      var okMin = this.setValue('cmi.core.score.min', min != null ? min : 0);
      var okMax = this.setValue('cmi.core.score.max', max != null ? max : 100);
      var okRaw = this.setValue('cmi.core.score.raw', raw);
      return okMin && okMax && okRaw;
    }
  };

  global.ScormAPI = ScormAPI;
})(window);
