import React from 'react';
import type { ParentChild } from '../types';
import { Badge } from '@/shared/ui/Badge';
import { useT } from '@/shared/i18n';

interface ParentChildSidebarCardProps {
  child: ParentChild;
}

export const ParentChildSidebarCard: React.FC<ParentChildSidebarCardProps> = ({ child }) => {
  const { t } = useT();
  const initials = child.fullName
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((n) => n[0])
    .join('')
    .toUpperCase();

  return (
    <aside className="child-card-main">
      <div className="child-avatar-wrap">
        <div className="child-avatar-big">{initials || 'BG'}</div>
        <div className="child-profile-name">{child.fullName}</div>
        <div className="child-meta-pills">
          <Badge variant="success">{t('common.active')}</Badge>
          <Badge variant="default">{child.groupName}</Badge>
        </div>
      </div>

      {child.allergies.length > 0 && (
        <div className="alert-box alert-box-danger">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z" />
            <path d="M12 9v4" />
            <path d="M12 17h.01" />
          </svg>
          <div>
            <strong>{t('parent.allergyAlert')}</strong> {child.allergies.join(', ')}
          </div>
        </div>
      )}

      <div className="profile-info-list">
        <div className="profile-info-item">
          <span className="profile-info-label">{t('parent.branch')}</span>
          <span className="profile-info-val">{child.branchName}</span>
        </div>

        <div className="profile-info-item">
          <span className="profile-info-label">{t('parent.birthDate')}</span>
          <span className="profile-info-val tabular-nums">{child.birthDate}</span>
        </div>

        <div className="profile-info-item">
          <span className="profile-info-label">{t('parent.teacherContact')}</span>
          <span className="profile-info-val">
            <span>{child.teacherName}</span>
            {child.teacherPhone && (
              <a href={`tel:${child.teacherPhone.replace(/\s+/g, '')}`}>
                {child.teacherPhone}
              </a>
            )}
          </span>
        </div>

        <div className="profile-info-item">
          <span className="profile-info-label">{t('parent.branchContact')}</span>
          <span className="profile-info-val">
            <a href={`tel:${child.emergencyPhone.replace(/\s+/g, '')}`}>
              {child.emergencyPhone}
            </a>
          </span>
        </div>
      </div>
    </aside>
  );
};
