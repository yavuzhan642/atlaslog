import Image from "next/image";

type AtlaslogLogoProps = {
  size?: "sm" | "md" | "lg";
  priority?: boolean;
  className?: string;
};

const sizeClasses = {
  sm: "h-8 w-8 rounded-xl",
  md: "h-9 w-9 rounded-xl",
  lg: "h-11 w-11 rounded-2xl",
};

const imageSizes = {
  sm: "32px",
  md: "36px",
  lg: "44px",
};

export function AtlaslogLogo({
  size = "sm",
  priority = false,
  className = "",
}: AtlaslogLogoProps) {
  return (
    <span
      aria-hidden="true"
      className={[
        "relative block shrink-0 overflow-hidden border border-white/[0.10] bg-[#2b2d31]",
        sizeClasses[size],
        className,
      ].join(" ")}
    >
      <Image
        src="/atlaslog-logo.png"
        alt=""
        fill
        priority={priority}
        sizes={imageSizes[size]}
        className="object-cover"
      />
    </span>
  );
}