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
import { forwardRef } from "react";
import type { AnimatedIconHandle, AnimatedIconProps } from "./icons/types";
import WorldIcon from "./icons/world-icon";
import LayoutDashboardIcon from "./icons/layout-dashboard-icon";
import PlugConnectedIcon from "./icons/plug-connected-icon";
import Stack3Icon from "./icons/stack-3-icon";

const BY_SLUG = {
  website: WorldIcon,
  app: LayoutDashboardIcon,
  automation: PlugConnectedIcon,
  hosting: Stack3Icon,
} as const;

export type ServiceIconSlug = keyof typeof BY_SLUG;

interface Props extends AnimatedIconProps {
  slug: string;
}

const ServiceIcon = forwardRef<AnimatedIconHandle, Props>(
  ({ slug, size = 20, strokeWidth = 1.75, ...rest }, ref) => {
    const Icon = BY_SLUG[slug as ServiceIconSlug];
    if (!Icon) return null;
    return <Icon ref={ref} size={size} strokeWidth={strokeWidth} {...rest} />;
  },
);

ServiceIcon.displayName = "ServiceIcon";
export default ServiceIcon;
