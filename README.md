# dchase

Dirty mobile tilt-steering userscript for the Forest Ride / Deathchase-ish remake at:

https://crg.cz/motorka/

## Install

Install with Tampermonkey / Violentmonkey / Kiwi Browser extensions:

[Install dchase.user.js](https://raw.githubusercontent.com/hanenashi/dchase/main/dchase.user.js)

On Android + Kiwi Browser:

1. Install Tampermonkey or Violentmonkey.
2. Open the install link above.
3. Confirm installation.
4. Open https://crg.cz/motorka/
5. Tap the page / START once so the browser can allow motion sensors.
6. Tilt phone left/right to steer.

## Technical TL;DR

The original game listens for keyboard state using `KeyA` and `KeyD` for left/right steering.

This userscript does not patch the game source directly. Instead it:

- listens to `deviceorientation`
- reads `event.gamma` as left/right phone tilt
- applies a small dead zone so hand wobble does not steer
- normalizes tilt into a `-1..1` steering value
- dispatches fake `keydown` / `keyup` events for `KeyA` and `KeyD`

So the game still thinks you are pressing A/D. Very elegant? No. Works? That is the job.

## Tuning

Inside `dchase.user.js`:

```js
const CFG = {
  deadZoneDeg: 4,
  fullTiltDeg: 24,
  steerThreshold: 0.15,
  updateMs: 50,
  invert: false,
  debug: false
};
```

Useful tweaks:

- `deadZoneDeg`: bigger = less nervous around center
- `fullTiltDeg`: smaller = stronger steering from smaller tilt
- `invert`: set to `true` if left/right feels reversed
- `debug`: set to `true` for console logging

## Target

```js
// @match https://crg.cz/motorka/*
```

Only runs on the original hosted game page.
