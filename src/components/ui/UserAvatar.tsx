import { useState } from "react";
import { resolvePersonAvatarSrc, resolvePhotoUrlFromSource } from "../../utils/personAvatar";

type AvatarSource = Parameters<typeof resolvePhotoUrlFromSource>[0];

type UserAvatarProps = {
  photoUrl?: string | null;
  source?: AvatarSource;
  className?: string;
  alt?: string;
};

export function UserAvatar({
  photoUrl,
  source,
  className = "avatar",
  alt = "",
}: UserAvatarProps) {
  const src = resolvePersonAvatarSrc(source ?? photoUrl);
  const [broken, setBroken] = useState(false);

  if (!src || broken) {
    return (
      <span className={`${className} avatar--placeholder`} aria-hidden={alt ? undefined : true}>
        <i className="fa-solid fa-user" aria-hidden="true" />
      </span>
    );
  }

  return (
    <img className={className} src={src} alt={alt} onError={() => setBroken(true)} />
  );
}
