import { useLayoutEffect, useRef } from "react";
import { createPortal } from "react-dom";

const GAP = 6;
const EDGE = 8;
const MAX_HEIGHT = 320;
const MIN_DROPDOWN = 96;

/**
 * A search-results dropdown anchored to an input and portaled to <body>.
 *
 * - Escapes scroll containers / bottom navigation stacking contexts.
 * - Anchored in document coordinates so it follows the input when the mobile
 *   keyboard scrolls the visual viewport.
 * - Sized (and flipped above the input when needed) using visualViewport so
 *   it stays in the visible area instead of hiding under the keyboard/nav.
 */
export default function SearchResults({
  open,
  anchorRef,
  items,
  onClose,
  renderItem,
}) {
  const boxRef = useRef(null);

  useLayoutEffect(() => {
    if (!open) return;

    const update = () => {
      const box = boxRef.current;
      const anchor = anchorRef.current;
      if (!box || !anchor) return;

      const rect = anchor.getBoundingClientRect();
      const scrollX = window.scrollX ?? window.pageXOffset;
      const scrollY = window.scrollY ?? window.pageYOffset;
      const vv = window.visualViewport;
      const vvHeight = vv?.height ?? window.innerHeight;
      const vvTop = vv?.offsetTop ?? scrollY;

      // Input position in document coords and in visible-viewport coords.
      const docTop = rect.top + scrollY;
      const docBottom = rect.bottom + scrollY;
      const visualTop = docTop - vvTop;
      const visualBottom = docBottom - vvTop;

      // Keep the list clear of the bottom navigation bar.
      const navHeight = document.querySelector("nav")?.getBoundingClientRect().height ?? 0;
      const spaceBelow = vvHeight - visualBottom - GAP - EDGE - navHeight;
      const spaceAbove = visualTop - GAP - EDGE;
      const flip = spaceBelow < 140 && spaceAbove > spaceBelow;
      const available = flip ? spaceAbove : spaceBelow;

      box.style.left = `${rect.left + scrollX}px`;
      box.style.width = `${rect.width}px`;
      box.style.top = `${flip ? docTop - GAP : docBottom + GAP}px`;
      box.style.transform = flip ? "translateY(-100%)" : "none";
      box.style.maxHeight = `${Math.max(
        MIN_DROPDOWN,
        Math.min(available, MAX_HEIGHT)
      )}px`;
    };

    update();
    const vv = window.visualViewport;
    window.addEventListener("resize", update);
    window.addEventListener("scroll", update, true);
    vv?.addEventListener("resize", update);
    vv?.addEventListener("scroll", update);

    return () => {
      window.removeEventListener("resize", update);
      window.removeEventListener("scroll", update, true);
      vv?.removeEventListener("resize", update);
      vv?.removeEventListener("scroll", update);
    };
  }, [open, anchorRef, items?.length]);

  useLayoutEffect(() => {
    if (!open) return;
    const handlePointerDown = (event) => {
      if (
        boxRef.current?.contains(event.target) ||
        anchorRef.current?.contains(event.target)
      ) {
        return;
      }
      onClose();
    };
    document.addEventListener("pointerdown", handlePointerDown);
    return () => document.removeEventListener("pointerdown", handlePointerDown);
  }, [open, anchorRef, onClose]);

  if (!open) return null;

  return createPortal(
    <div
      ref={boxRef}
      className="card absolute z-[70] overflow-y-auto overscroll-contain p-1.5 animate-fade-in"
    >
      {items.map((item, index) => renderItem(item, index))}
    </div>,
    document.body
  );
}
