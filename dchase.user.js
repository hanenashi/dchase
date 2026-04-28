// ==UserScript==
// @name         DChase tilt steering
// @namespace    https://github.com/hanenashi/dchase
// @version      0.1.0
// @description  Dirty mobile tilt steering patch for https://crg.cz/motorka/
// @author       hanenashi
// @match        https://crg.cz/motorka/*
// @run-at       document-start
// @grant        none
// ==/UserScript==

(() => {
  'use strict';

  const CFG = {
    deadZoneDeg: 4,       // bigger = less twitchy around center
    fullTiltDeg: 24,      // smaller = more sensitive
    steerThreshold: 0.15, // normalized -1..1 threshold before fake A/D starts
    updateMs: 50,
    invert: false,        // set true if steering feels reversed on your phone
    debug: false
  };

  let tiltEnabled = false;
  let tiltSeen = false;
  let tiltSteer = 0;
  let leftDown = false;
  let rightDown = false;

  function log(...args) {
    if (CFG.debug) console.log('[dchase-tilt]', ...args);
  }

  function fakeKey(code, type) {
    window.dispatchEvent(new KeyboardEvent(type, {
      bubbles: true,
      cancelable: true,
      code,
      key: code === 'KeyA' ? 'a' : 'd'
    }));
  }

  function setKeyState(left, right) {
    if (left !== leftDown) {
      fakeKey('KeyA', left ? 'keydown' : 'keyup');
      leftDown = left;
      log(left ? 'A down' : 'A up');
    }

    if (right !== rightDown) {
      fakeKey('KeyD', right ? 'keydown' : 'keyup');
      rightDown = right;
      log(right ? 'D down' : 'D up');
    }
  }

  function normalizeGamma(gamma) {
    let g = Number(gamma) || 0;
    if (CFG.invert) g = -g;
    if (Math.abs(g) < CFG.deadZoneDeg) g = 0;
    return Math.max(-1, Math.min(1, g / CFG.fullTiltDeg));
  }

  function onTilt(e) {
    // gamma is normally left/right phone tilt in portrait orientation.
    tiltSteer = normalizeGamma(e.gamma);
    tiltSeen = true;
  }

  async function enableTilt() {
    if (tiltEnabled) return;

    try {
      if (
        typeof DeviceOrientationEvent !== 'undefined' &&
        typeof DeviceOrientationEvent.requestPermission === 'function'
      ) {
        const state = await DeviceOrientationEvent.requestPermission();
        if (state !== 'granted') {
          console.warn('[dchase-tilt] DeviceOrientation permission denied');
          return;
        }
      }

      window.addEventListener('deviceorientation', onTilt, true);
      tiltEnabled = true;
      console.log('[dchase-tilt] enabled - tilt phone left/right to steer');
    } catch (err) {
      console.warn('[dchase-tilt] failed to enable:', err);
    }
  }

  // Browsers usually require sensor permission to be requested from a real user gesture.
  window.addEventListener('click', enableTilt, true);
  window.addEventListener('touchstart', enableTilt, true);
  window.addEventListener('pointerdown', enableTilt, true);

  setInterval(() => {
    if (!tiltEnabled || !tiltSeen) return;

    if (tiltSteer < -CFG.steerThreshold) {
      setKeyState(true, false);
    } else if (tiltSteer > CFG.steerThreshold) {
      setKeyState(false, true);
    } else {
      setKeyState(false, false);
    }
  }, CFG.updateMs);

  window.addEventListener('blur', () => setKeyState(false, false));
  window.addEventListener('pagehide', () => setKeyState(false, false));
})();
