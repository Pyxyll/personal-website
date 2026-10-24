/**
 * Maps a service to its icon.
 *
 * The icons themselves are from ItsHover (itshover.com/icons), pulled in via
 * their shadcn registry and living unmodified in ./icons so they can be
 * re-pulled or swapped without untangling them from this file. They animate on
 * hover through Motion.
 *
 * Forwards the ref so a parent can drive the animation: in the mega menu the
 * thing you hover is the whole card, not the 20px icon inside it, and an icon
 * that only reacts when the pointer crosses the glyph itself feels broken.
 */
import { forwardRef, useImperativeHandle, useRef } from "react";
import type { AnimatedIconHandle, AnimatedIconProps } from "./icons/types";
import WorldIcon from "./icons/world-icon";
import LayoutDashboardIcon from "./icons/layout-dashboard-icon";
import PlugConnectedIcon from "./icons/plug-connected-icon";
import Stack3Icon from "./icons/stack-3-icon";
import BrainCircuitIcon from "./icons/brain-circuit-icon";
import MagnifierIcon from "./icons/magnifier-icon";

const BY_SLUG = {
  website: WorldIcon,
  app: LayoutDashboardIcon,
  automation: PlugConnectedIcon,
  hosting: Stack3Icon,
  ai: BrainCircuitIcon,
  audit: MagnifierIcon,
} as const;

export type ServiceIconSlug = keyof typeof BY_SLUG;

interface Props extends AnimatedIconProps {
  slug: string;
}

/** Read at call time, not once: the preference can change while a page is open. */
const wantsStillness = () =>
  typeof window !== "undefined" &&
  window.matchMedia("(prefers-reduced-motion: reduce)").matches;

const ServiceIcon = forwardRef<AnimatedIconHandle, Props>(
  ({ slug, size = 20, strokeWidth = 1.75, ...rest }, ref) => {
    const inner = useRef<AnimatedIconHandle>(null);

    /* These animate through Motion, which is to say in JavaScript, so the
       global reduced-motion CSS block cannot reach them — and one of them
       (the brain) pulses for as long as you hover. Gated here rather than in
       the icons themselves, which are vendored and meant to stay that way.
       Cards drive this through the ref; the icons' own hover handlers are
       neutralised in CSS so there is no second, ungated path in. */
    useImperativeHandle(ref, () => ({
      startAnimation: () => {
        if (!wantsStillness()) inner.current?.startAnimation();
      },
      stopAnimation: () => {
        if (!wantsStillness()) inner.current?.stopAnimation();
      },
    }), []);

    const Icon = BY_SLUG[slug as ServiceIconSlug];
    if (!Icon) return null;
    return <Icon ref={inner} size={size} strokeWidth={strokeWidth} {...rest} />;
  },
);

ServiceIcon.displayName = "ServiceIcon";
export default ServiceIcon;
