type IconName =
  | "search"
  | "bell"
  | "menu"
  | "home"
  | "bookmark"
  | "user"
  | "chart"
  | "plus"
  | "more"
  | "clap"
  | "comment"
  | "edit"
  | "spark"
  | "arrow";

const paths: Record<IconName, string> = {
  search: "M11 19a8 8 0 1 1 5.66-2.34L21 21M11 17a6 6 0 1 0 0-12 6 6 0 0 0 0 12Z",
  bell: "M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9M10 21h4",
  menu: "M4 6h16M4 12h16M4 18h16",
  home: "m3 10 9-7 9 7v10a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1V10Z",
  bookmark: "M6 4a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v18l-6-4-6 4V4Z",
  user: "M20 21a8 8 0 0 0-16 0M12 13a4 4 0 1 0 0-8 4 4 0 0 0 0 8Z",
  chart: "M4 19V9M10 19V5M16 19v-7M22 19H2",
  plus: "M12 5v14M5 12h14",
  more: "M5 12h.01M12 12h.01M19 12h.01",
  clap: "M7 11V5a1.5 1.5 0 0 1 3 0v5M10 9V3.5a1.5 1.5 0 0 1 3 0V9M13 9V5a1.5 1.5 0 0 1 3 0v6M16 10V7.5a1.5 1.5 0 0 1 3 0v6c0 4-2.5 7-7 7-3.5 0-5-2-6.5-4L3 12a1.5 1.5 0 0 1 2-2l2 2",
  comment: "M20 11.5a7.5 7.5 0 0 1-8 7.5 9 9 0 0 1-4-.9L4 20l1.7-3.5A7.5 7.5 0 1 1 20 11.5Z",
  edit: "M4 20h4L19 9l-4-4L4 16v4ZM13.5 6.5l4 4",
  spark: "m12 3 1.4 5.6L19 10l-5.6 1.4L12 17l-1.4-5.6L5 10l5.6-1.4L12 3Z",
  arrow: "M5 12h13M13 6l6 6-6 6",
};

export function Icon({ name, size = 20 }: { name: IconName; size?: number }) {
  return (
    <svg
      aria-hidden="true"
      fill="none"
      height={size}
      viewBox="0 0 24 24"
      width={size}
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d={paths[name]}
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.7"
      />
    </svg>
  );
}
