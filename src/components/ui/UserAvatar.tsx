import { useState } from "react";
import { resolveGraphPhotoUrl } from "../../utils/personAvatar";

type UserAvatarProps = {
  photoUrl?: string | null;
  className?: string;
  alt?: string;
};

export function UserAvatar({ photoUrl, className = "avatar", alt = "" }: UserAvatarProps) {
  const src = resolveGraphPhotoUrl(photoUrl);
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
