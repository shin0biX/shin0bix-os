import { createContext, useContext } from "react";

/**
 * OS context — gives every app access to the window manager.
 * Value: { openApp, closeApp, minimizeApp, toggleMax, focusApp,
 *          windows, isMobile, reboot, bootedAt }
 */
export const OSContext = createContext(null);

export function useOS() {
  return useContext(OSContext);
}
