import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence } from "framer-motion";
import BootScreen from "./components/BootScreen.jsx";
import { Background, TopBar, Footer, Dock, DesktopIcons } from "./components/Chrome.jsx";
import Window from "./components/Window.jsx";
import { OSContext } from "./context.js";
import { APP_DEFS } from "./registry.js";

function useIsMobile() {
  const [isMobile, setIsMobile] = useState(() =>
    typeof window !== "undefined" ? window.matchMedia("(max-width: 760px)").matches : false
  );
  useEffect(() => {
    const mq = window.matchMedia("(max-width: 760px)");
    const onChange = (e) => setIsMobile(e.matches);
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);
  return isMobile;
}

export default function App() {
  const [booted, setBooted] = useState(false);
  const [bootedAt, setBootedAt] = useState(() => Date.now());
  const [windows, setWindows] = useState([]);
  const zRef = useRef(100);
  const deskRef = useRef(null);
  const isMobile = useIsMobile();

  const nextZ = useCallback(() => {
    zRef.current += 1;
    return zRef.current;
  }, []);

  const openApp = useCallback(
    (app) => {
      if (!APP_DEFS[app]) return;
      const z = nextZ();
      setWindows((ws) => {
        // already open → restore + focus
        if (ws.some((w) => w.app === app)) {
          return ws.map((w) => (w.app === app ? { ...w, minimized: false, z } : w));
        }
        const def = APP_DEFS[app];
        const desk = deskRef.current?.getBoundingClientRect();
        const w = desk ? Math.min(def.w, desk.width - 32) : def.w;
        const h = desk ? Math.min(def.h, desk.height - 32) : def.h;
        const offset = (ws.length % 6) * 26;
        const x = desk ? Math.max(12, Math.min(84 + offset, desk.width - w - 16)) : 84 + offset;
        const y = desk ? Math.max(10, Math.min(44 + offset, desk.height - h - 14)) : 44 + offset;
        return [
          ...ws,
          {
            id: app,
            app,
            z,
            minimized: false,
            maximized: false,
            x,
            y,
            w,
            h,
          },
        ];
      });
    },
    [nextZ]
  );

  const closeApp = useCallback((app) => {
    setWindows((ws) => ws.filter((w) => w.app !== app));
  }, []);

  const minimizeApp = useCallback((app) => {
    setWindows((ws) => ws.map((w) => (w.app === app ? { ...w, minimized: true } : w)));
  }, []);

  const focusApp = useCallback(
    (app) => {
      setWindows((ws) => {
        const topZ = ws.reduce((m, w) => Math.max(m, w.z), 0);
        const target = ws.find((w) => w.app === app);
        if (!target || target.z === topZ) return ws;
        const z = nextZ();
        return ws.map((w) => (w.app === app ? { ...w, z } : w));
      });
    },
    [nextZ]
  );

  const toggleMax = useCallback(
    (app) => {
      setWindows((ws) =>
        ws.map((w) => (w.app === app ? { ...w, maximized: !w.maximized, z: nextZ() } : w))
      );
    },
    [nextZ]
  );

  const moveWindow = useCallback((id, x, y) => {
    setWindows((ws) => ws.map((w) => (w.id === id ? { ...w, x, y } : w)));
  }, []);

  const reboot = useCallback(() => {
    setWindows([]);
    setBooted(false);
    setBootedAt(Date.now());
  }, []);

  // Deep links (?app=terminal …) + WELCOME.EXE auto-open on first visit
  useEffect(() => {
    if (!booted) return;
    const t = setTimeout(() => {
      const deepLink = new URLSearchParams(window.location.search).get("app");
      if (deepLink && APP_DEFS[deepLink]) openApp(deepLink);
      else if (localStorage.getItem("shin0bixos.welcome.done") !== "1") openApp("welcome");
    }, 650);
    return () => clearTimeout(t);
  }, [booted, openApp]);

  const os = useMemo(
    () => ({
      openApp,
      closeApp,
      minimizeApp,
      toggleMax,
      focusApp,
      moveWindow,
      windows,
      isMobile,
      reboot,
      bootedAt,
    }),
    [
      openApp,
      closeApp,
      minimizeApp,
      toggleMax,
      focusApp,
      moveWindow,
      windows,
      isMobile,
      reboot,
      bootedAt,
    ]
  );

  return (
    <OSContext.Provider value={os}>
      <div className="os-root">
        <Background />
        <TopBar onOpen={openApp} />
        <main className="desk" ref={deskRef} aria-label="Desktop">
          {!isMobile && <DesktopIcons onOpen={openApp} />}
          <AnimatePresence>
            {booted &&
              windows
                .filter((w) => !w.minimized)
                .map((w) => {
                  const def = APP_DEFS[w.app];
                  const Body = def.component;
                  return (
                    <Window
                      key={w.id}
                      def={def}
                      win={w}
                      isMobile={isMobile}
                      constraintsRef={deskRef}
                      onFocus={() => focusApp(w.app)}
                      onClose={() => closeApp(w.app)}
                      onMinimize={() => minimizeApp(w.app)}
                      onMaximize={() => toggleMax(w.app)}
                      onMove={(x, y) => moveWindow(w.id, x, y)}
                    >
                      <Body />
                    </Window>
                  );
                })}
          </AnimatePresence>
        </main>
        <Dock />
        <Footer />
        <AnimatePresence>
          {!booted && (
            <BootScreen
              key="boot"
              onDone={() => {
                setBootedAt(Date.now());
                setBooted(true);
              }}
            />
          )}
        </AnimatePresence>
      </div>
    </OSContext.Provider>
  );
}
