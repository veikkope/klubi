import type { SocialLink } from "@/lib/types";

type Props = {
  platform: SocialLink["platform"];
  size?: number;
};

const paths: Record<SocialLink["platform"], React.ReactNode> = {
  facebook: (
    <path
      fill="currentColor"
      d="M22 12.07C22 6.51 17.52 2 12 2S2 6.51 2 12.07c0 4.99 3.66 9.13 8.44 9.93v-7.02H7.9v-2.91h2.54V9.85c0-2.51 1.49-3.9 3.77-3.9 1.09 0 2.24.2 2.24.2v2.47h-1.26c-1.24 0-1.63.78-1.63 1.57v1.88h2.78l-.45 2.91h-2.33V22c4.78-.8 8.44-4.94 8.44-9.93Z"
    />
  ),
  instagram: (
    <>
      <rect
        x="2.5"
        y="2.5"
        width="19"
        height="19"
        rx="5"
        ry="5"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
      />
      <circle
        cx="12"
        cy="12"
        r="4"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
      />
      <circle cx="17.5" cy="6.5" r="1.2" fill="currentColor" />
    </>
  ),
  linkedin: (
    <path
      fill="currentColor"
      d="M20.45 20.45h-3.55v-5.57c0-1.33-.03-3.04-1.85-3.04-1.86 0-2.15 1.45-2.15 2.95v5.66H9.35V9h3.41v1.56h.05c.48-.9 1.64-1.85 3.37-1.85 3.6 0 4.27 2.37 4.27 5.45v6.29ZM5.34 7.43A2.06 2.06 0 1 1 5.34 3.3a2.06 2.06 0 0 1 0 4.13ZM7.12 20.45H3.56V9h3.56v11.45ZM22.22 0H1.77C.79 0 0 .77 0 1.72v20.56C0 23.23.79 24 1.77 24h20.44C23.2 24 24 23.23 24 22.28V1.72C24 .77 23.2 0 22.22 0Z"
    />
  ),
  youtube: (
    <path
      fill="currentColor"
      d="M23.5 6.51a3 3 0 0 0-2.11-2.12C19.5 4 12 4 12 4s-7.5 0-9.39.39A3 3 0 0 0 .5 6.51 31.4 31.4 0 0 0 0 12a31.4 31.4 0 0 0 .5 5.49 3 3 0 0 0 2.11 2.12C4.5 20 12 20 12 20s7.5 0 9.39-.39a3 3 0 0 0 2.11-2.12A31.4 31.4 0 0 0 24 12a31.4 31.4 0 0 0-.5-5.49ZM9.6 15.57V8.43L15.82 12 9.6 15.57Z"
    />
  ),
  x: (
    <path
      fill="currentColor"
      d="M18.244 2H21l-6.51 7.44L22.5 22h-6.84l-4.77-6.24L5.36 22H2.6l6.97-7.96L1.8 2h6.9l4.33 5.72L18.244 2Zm-1.2 18h1.92L7.05 4h-2L17.045 20Z"
    />
  ),
};

export const socialLabels: Record<SocialLink["platform"], string> = {
  youtube: "YouTube",
  facebook: "Facebook",
  instagram: "Instagram",
  linkedin: "LinkedIn",
  x: "X / Twitter",
};

export function SocialIcon({ platform, size = 18 }: Props) {
  return (
    <svg
      viewBox="0 0 24 24"
      width={size}
      height={size}
      aria-hidden
      role="img"
    >
      {paths[platform]}
    </svg>
  );
}
