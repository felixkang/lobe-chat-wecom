'use client';

import { BookText, Cog, DatabaseIcon, FlagIcon, GlobeLockIcon } from 'lucide-react';
import dynamic from 'next/dynamic';

import CacheViewer from './CacheViewer';
import FeatureFlagViewer from './FeatureFlagViewer';
import MetadataViewer from './MetadataViewer';
import PostgresViewer from './PostgresViewer';
import SystemInspector from './SystemInspector';

// 使用 dynamic import 并禁用 SSR，确保组件仅在客户端渲染
const FloatPanel = dynamic(() => import('./features/FloatPanel'), { ssr: false });

const DevPanel = () => (
  <FloatPanel
    items={[
      {
        children: <PostgresViewer />,
        icon: <DatabaseIcon size={16} />,
        key: 'Postgres Viewer',
      },
      {
        children: <MetadataViewer />,
        icon: <BookText size={16} />,
        key: 'SEO Metadata',
      },
      {
        children: <CacheViewer />,
        icon: <GlobeLockIcon size={16} />,
        key: 'NextJS Caches',
      },
      {
        children: <FeatureFlagViewer />,
        icon: <FlagIcon size={16} />,
        key: 'Feature Flags',
      },
      {
        children: <SystemInspector />,
        icon: <Cog size={16} />,
        key: 'System Status',
      },
    ]}
  />
);

export default DevPanel;
