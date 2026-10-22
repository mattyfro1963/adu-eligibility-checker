type WordmarkIconProps = {
  className?: string;
};

/** Star + cartoon THOW mark for the site wordmark (header, hero chrome). */
export function WordmarkIcon({ className }: WordmarkIconProps) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 32 32"
      fill="none"
      className={className}
      aria-hidden="true"
      focusable="false"
    >
      <rect width="32" height="32" rx="6" fill="#0F172A" />
      <polygon
        fill="#FC4A2B"
        points="24.6,2.8 25.63,5.78 28.78,5.84 26.26,7.74 27.19,10.76 24.6,8.95 22.01,10.76 22.94,7.74 20.42,5.84 23.57,5.78"
      />
      <rect x="2.6" y="19.15" width="4" height="1.7" rx="0.85" fill="#F4F6F8" />
      <circle cx="2.85" cy="20" r="1.1" fill="#F4F6F8" />
      <polygon fill="#F4F6F8" points="5.9,9.6 9.85,5.45 13.8,9.6" />
      <rect x="6.1" y="9.1" width="7.4" height="6.2" rx="1.35" fill="#F4F6F8" />
      <rect
        x="6.1"
        y="13.6"
        width="19.4"
        height="8.3"
        rx="1.7"
        fill="#F4F6F8"
      />
      <rect x="8" y="10.55" width="3.4" height="2.7" rx="0.45" fill="#0F172A" />
      <rect
        x="14.15"
        y="15.35"
        width="3.55"
        height="3.35"
        rx="0.45"
        fill="#0F172A"
      />
      <rect
        x="19.15"
        y="15.35"
        width="3.55"
        height="3.35"
        rx="0.45"
        fill="#0F172A"
      />
      <circle cx="10.35" cy="24.15" r="2.55" fill="#F4F6F8" />
      <circle cx="10.35" cy="24.15" r="0.95" fill="#0F172A" />
      <circle cx="21.55" cy="24.15" r="2.55" fill="#F4F6F8" />
      <circle cx="21.55" cy="24.15" r="0.95" fill="#0F172A" />
    </svg>
  );
}
