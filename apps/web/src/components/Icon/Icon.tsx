import type { SVGProps } from 'react';

export interface IconProps extends SVGProps<SVGSVGElement> {
  size?: number;
}

/** Base commune (trait, cadre 24, coins ronds) — remplace les icones emoji du redesign. */
function makeIcon(paths: string[]) {
  return function IconComponent({ size = 18, ...rest }: IconProps) {
    return (
      <svg
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
        {...rest}
      >
        {paths.map((d) => (
          <path key={d} d={d} />
        ))}
      </svg>
    );
  };
}

export const HomeIcon = makeIcon(['M4 11l8-7 8 7', 'M6 10v9a1 1 0 0 0 1 1h3v-6h4v6h3a1 1 0 0 0 1-1v-9']);
export const SearchIcon = makeIcon(['M11 3a8 8 0 1 0 0 16 8 8 0 0 0 0-16Z', 'm21 21-4.3-4.3']);
export const PlusCircleIcon = makeIcon(['M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18Z', 'M12 8v8', 'M8 12h8']);
export const FileTextIcon = makeIcon(['M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z', 'M14 2v6h6', 'M9 13h6', 'M9 17h6']);
export const ReceiptIcon = makeIcon(['M6 2h12v20l-3-2-3 2-3-2-3 2Z', 'M9 7h6', 'M9 11h6']);
export const MessageCircleIcon = makeIcon([
  'M21 11.5a8.38 8.38 0 0 1-3.8 7 8.5 8.5 0 0 1-7.6.9L3 21l1.6-6.6a8.38 8.38 0 0 1-.9-3.9 8.5 8.5 0 0 1 8-8.5h.5a8.48 8.48 0 0 1 8 8v.5z',
]);
export const HeartIcon = makeIcon([
  'M12 21s-6.5-4.35-9-8.28C1.4 9.5 2.5 6 6 6c2 0 3.5 1.2 4.5 2.7C11.5 7.2 13 6 15 6c3.5 0 4.6 3.5 3 6.72C18.5 16.65 12 21 12 21z',
]);
export const BellIcon = makeIcon(['M18 8a6 6 0 0 0-12 0c0 7-3 9-3 9h18s-3-2-3-9', 'M13.73 21a2 2 0 0 1-3.46 0']);

export function PlayIcon({ size = 18, ...rest }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" {...rest}>
      <path d="M6 4l14 8-14 8V4z" />
    </svg>
  );
}
