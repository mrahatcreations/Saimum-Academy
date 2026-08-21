import React, { useState } from 'react';
import styles from './UserAvatar.module.css';

export interface UserAvatarProps {
  name: string;
  photoUrl?: string | null;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | number;
  shape?: 'circle' | 'squircle';
  className?: string;
  style?: React.CSSProperties;
  showStatus?: boolean;
  statusColor?: string;
}

// Clean name and extract 2-letter uppercase initials
export function getInitials(name: string): string {
  if (!name) return 'SA';
  
  // Strip emojis & unwanted symbols
  const clean = name.replace(/[\u{1F300}-\u{1F9FF}]/gu, '').trim();
  if (!clean) return 'SA';

  const parts = clean.split(/\s+/).filter(Boolean);
  if (parts.length >= 2) {
    const first = parts[0].charAt(0).toUpperCase();
    const second = parts[parts.length - 1].charAt(0).toUpperCase();
    return `${first}${second}`;
  } else if (parts.length === 1 && parts[0].length >= 2) {
    return parts[0].slice(0, 2).toUpperCase();
  }
  return clean.slice(0, 1).toUpperCase() || 'SA';
}

export function UserAvatar({
  name,
  photoUrl,
  size = 'md',
  shape = 'circle',
  className = '',
  style = {},
  showStatus = false,
  statusColor = '#10B981'
}: UserAvatarProps) {
  const [imageError, setImageError] = useState(false);

  // Derive pixel dimensions
  const getDimensionPx = (s: UserAvatarProps['size']) => {
    if (typeof s === 'number') return s;
    switch (s) {
      case 'xs': return 26;
      case 'sm': return 32;
      case 'md': return 38;
      case 'lg': return 48;
      case 'xl': return 68;
      default: return 38;
    }
  };

  const dimension = getDimensionPx(size);
  const initials = getInitials(name);

  // Font size relative to avatar dimension
  const fontSize = Math.max(10, Math.round(dimension * 0.36));
  const borderRadius = shape === 'squircle' ? `${Math.max(6, Math.round(dimension * 0.24))}px` : '50%';

  const hasValidPhoto = photoUrl && photoUrl.trim() !== '' && !imageError;

  return (
    <div 
      className={`${styles.avatarContainer} ${className}`}
      style={{
        width: `${dimension}px`,
        height: `${dimension}px`,
        borderRadius,
        ...style
      }}
    >
      {hasValidPhoto ? (
        <img
          src={photoUrl}
          alt={name}
          className={styles.avatarImg}
          style={{ borderRadius }}
          onError={() => setImageError(true)}
          loading="lazy"
        />
      ) : (
        <div
          className={styles.avatarInitials}
          style={{
            borderRadius,
            fontSize: `${fontSize}px`
          }}
        >
          {initials}
        </div>
      )}

      {showStatus && (
        <span 
          className={styles.statusIndicator}
          style={{ backgroundColor: statusColor }}
        />
      )}
    </div>
  );
}

export default UserAvatar;
