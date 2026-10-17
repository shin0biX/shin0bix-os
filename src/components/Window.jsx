import { useRef, useState } from "react";
import { motion } from "framer-motion";

/**
 * Draggable OS window. Position lives in the window-manager state (win.x/win.y),
 * so maximize/restore and constraints stay perfectly consistent.
 */
export default function Window({
  def,
  win,
  children,
  onFocus,
  onClose,
  onMinimize,
  onMaximize,
  onMove,
  constraintsRef,
  isMobile,
}) {
  const dragRef = useRef(null);
  const [dragging, setDragging] = useState(false);

  const startDrag = (e) => {
    onFocus();
    if (win.maximized || isMobile || e.button !== 0) return;
    if (e.target.closest("button")) return;
    const desk = constraintsRef.current?.getBoundingClientRect();
    if (!desk) return;
    dragRef.current = {
      startX: e.clientX,
      startY: e.clientY,
      origX: win.x,
      origY: win.y,
      desk,
    };
    e.currentTarget.setPointerCapture?.(e.pointerId);
    setDragging(true);
  };

  const onPointerMove = (e) => {
    const d = dragRef.current;
    if (!d) return;
    const clamp = (v, lo, hi) => Math.min(Math.max(v, lo), hi);
    const loX = Math.min(0, d.desk.width - win.w);
    const hiX = Math.max(0, d.desk.width - win.w);
    const loY = Math.min(0, d.desk.height - win.h);
    const hiY = Math.max(0, d.desk.height - win.h);
    const nx = clamp(d.origX + (e.clientX - d.startX), loX, hiX);
    const ny = clamp(d.origY + (e.clientY - d.startY), loY, hiY);
    onMove(nx, ny);
  };

  const endDrag = (e) => {
    if (!dragRef.current) return;
    dragRef.current = null;
    setDragging(false);
    try {
      e.currentTarget.releasePointerCapture?.(e.pointerId);
    } catch {
      /* pointer already released */
    }
  };

  const style = win.maximized
    ? { zIndex: win.z }
    : { left: win.x, top: win.y, width: win.w, height: win.h, zIndex: win.z };

  return (
    <motion.section
      className={
        "win" +
        ` win--${win.app}` +
        (win.maximized ? " win--max" : "") +
        (dragging ? " win--dragging" : "")
      }
      style={style}
      initial={{ opacity: 0, scale: 0.95, y: 14 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.96, y: 10, transition: { duration: 0.16 } }}
      transition={{ type: "spring", stiffness: 430, damping: 33 }}
      onPointerDown={onFocus}
      role="dialog"
      aria-label={def.title}
    >
      <header
        className="win__bar"
        onPointerDown={startDrag}
        onPointerMove={onPointerMove}
        onPointerUp={endDrag}
        onPointerCancel={endDrag}
        onDoubleClick={() => {
          if (!isMobile) onMaximize();
        }}
      >
        <div className="win__btns">
          <button className="win__btn win__btn--close" onClick={onClose} aria-label="Close window" title="Close" />
          <button className="win__btn win__btn--min" onClick={onMinimize} aria-label="Minimize window" title="Minimize" />
          <button className="win__btn win__btn--max" onClick={onMaximize} aria-label="Maximize window" title="Maximize" />
        </div>
        <h2 className="win__title">{def.title}</h2>
        <span className="win__spacer" aria-hidden="true" />
      </header>
      <div className="win__body">{children}</div>
    </motion.section>
  );
}
