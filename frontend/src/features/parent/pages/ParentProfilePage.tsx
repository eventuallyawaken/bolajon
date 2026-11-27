import React from 'react';
import { UserProfileSettingsSection } from '@/features/settings/components/UserProfileSettingsSection';
import { useT } from '@/shared/i18n';
import { Badge } from '@/shared/ui/Badge';
import { useParentPortal } from '../context/ParentPortalContext';

export const ParentProfilePage: React.FC = () => {
  const { t } = useT();
  const { childrenList } = useParentPortal();

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      <UserProfileSettingsSection />

      <div className="card">
        <div className="card-header">
          <h3 className="card-title">{t('nav.children')}</h3>
        </div>
        <div style={{ padding: 20 }}>
          {childrenList.length === 0 ? (
            <p className="text-muted" style={{ margin: 0 }}>{t('parent.noChildrenDesc')}</p>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 16 }}>
              {childrenList.map((child) => (
                <div
                  key={child.id}
                  style={{
                    padding: 16,
                    borderRadius: 'var(--radius-md)',
                    border: '1px solid var(--border-subtle)',
                    background: 'var(--bg-canvas)',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 8,
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <strong style={{ fontSize: 15, color: 'var(--text-primary)' }}>{child.fullName}</strong>
                    <Badge variant="success">{t('common.active')}</Badge>
                  </div>
                  <span className="text-secondary" style={{ fontSize: 13 }}>
                    {child.groupName} &bull; {child.branchName}
                  </span>
                  <span className="text-muted" style={{ fontSize: 12.5 }}>
                    {t('parent.teacherContact')}: {child.teacherName} ({child.teacherPhone})
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ParentProfilePage;
