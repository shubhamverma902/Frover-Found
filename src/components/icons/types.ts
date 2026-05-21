import type { SVGProps } from 'react';

/** Base props for all icon components. `size` sets both width and height. */
export type IconProps = SVGProps<SVGSVGElement> & {
  size?: number;
};
