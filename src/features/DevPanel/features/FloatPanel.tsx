'use client';

import { ActionIcon, FluentEmoji, Icon, SideNav } from '@lobehub/ui';
import { FloatButton } from 'antd';
import { createStyles } from 'antd-style';
import { BugIcon, BugOff, XIcon } from 'lucide-react';
import dynamic from 'next/dynamic';
import { ReactNode, memo, useEffect, useState } from 'react';
import { Flexbox } from 'react-layout-kit';

import { BRANDING_NAME } from '@/const/branding';

// 使用 dynamic import 并禁用 SSR
const RndComponent = dynamic(() => import('react-rnd').then((mod) => mod.Rnd), { 
  ssr: false 
});

// 定义样式
const useStyles = createStyles(({ token, css, prefixCls }) => {
  return {
    collapsed: css`
      pointer-events: none;
      transform: scale(0.8);
      opacity: 0;
    `,
    expanded: css`
      pointer-events: auto;
      transform: scale(1);
      opacity: 1;
    `,
    floatButton: css`
      inset-block-end: 16px;
      inset-inline-end: 16px;

      width: 36px;
      height: 36px;
      border: 1px solid ${token.colorBorderSecondary};

      font-size: 20px;
      .${prefixCls}-float-btn-body {
        background: ${token.colorBgLayout};

        &:hover {
          width: auto;
          background: ${token.colorBgElevated};
        }
      }
    `,
    header: css`
      cursor: move;
      user-select: none;

      padding-block: 8px;
      padding-inline: 16px;
      border-block-end: 1px solid ${token.colorBorderSecondary};

      color: ${token.colorText};

      background: ${token.colorFillAlter};
    `,
    panel: css`
      position: fixed;
      z-index: 1000;

      overflow: hidden;
      display: flex;

      border: 1px solid ${token.colorBorderSecondary};
      border-radius: 12px;

      background: ${token.colorBgContainer};
      box-shadow: ${token.boxShadow};

      transition: opacity ${token.motionDurationMid} ${token.motionEaseInOut};
    `,
  };
});

const minWidth = 800;
const minHeight = 600;

interface CollapsibleFloatPanelProps {
  items: { children: ReactNode; icon: ReactNode; key: string }[];
}

const CollapsibleFloatPanel = memo<CollapsibleFloatPanelProps>(({ items }) => {
  const { styles, theme } = useStyles();
  const [tab, setTab] = useState<string>(items[0].key);
  const [isExpanded, setIsExpanded] = useState(false);
  const [position, setPosition] = useState({ x: 100, y: 100 });
  const [size, setSize] = useState({ height: minHeight, width: minWidth });
  const [isMounted, setIsMounted] = useState(false);

  // 只在客户端加载时执行
  useEffect(() => {
    setIsMounted(true);
    
    if (typeof window !== 'undefined') {
      try {
        const localStoragePosition = localStorage.getItem('debug-panel-position');
        if (localStoragePosition) {
          const parsed = JSON.parse(localStoragePosition);
          if (parsed) setPosition(parsed);
        }
      } catch (error) {
        console.error('Failed to load panel position', error);
      }

      try {
        const localStorageSize = localStorage.getItem('debug-panel-size');
        if (localStorageSize) {
          const parsed = JSON.parse(localStorageSize);
          if (parsed) setSize(parsed);
        }
      } catch (error) {
        console.error('Failed to load panel size', error);
      }
    }
  }, []);

  // 如果在服务器端或未挂载，则不渲染 Rnd 组件
  return (
    <>
      <FloatButton
        className={styles.floatButton}
        icon={<Icon icon={isExpanded ? BugOff : BugIcon} />}
        onClick={() => setIsExpanded(!isExpanded)}
      />
      {isExpanded && isMounted && (
        <RndComponent
          bounds="window"
          className={`${styles.panel} ${isExpanded ? styles.expanded : styles.collapsed}`}
          dragHandleClassName="panel-drag-handle"
          minHeight={minHeight}
          minWidth={minWidth}
          onDragStop={(_e, d) => {
            setPosition({ x: d.x, y: d.y });
            try {
              localStorage.setItem('debug-panel-position', JSON.stringify({ x: d.x, y: d.y }));
            } catch {}
          }}
          onResizeStop={(_e, _direction, ref, _delta, position) => {
            const newSize = {
              height: parseInt(ref.style.height, 10),
              width: parseInt(ref.style.width, 10),
            };
            setSize(newSize);
            setPosition(position);
            try {
              localStorage.setItem('debug-panel-size', JSON.stringify(newSize));
              localStorage.setItem('debug-panel-position', JSON.stringify(position));
            } catch {}
          }}
          position={position}
          size={size}
        >
          <Flexbox
            height={'100%'}
            horizontal
            style={{ overflow: 'hidden', position: 'relative' }}
            width={'100%'}
          >
            <SideNav
              avatar={<FluentEmoji emoji={'🧰'} size={24} />}
              bottomActions={[]}
              style={{
                paddingBlock: 12,
                width: 48,
              }}
              topActions={items.map((item) => (
                <ActionIcon
                  active={tab === item.key}
                  key={item.key}
                  onClick={() => setTab(item.key)}
                  placement={'right'}
                  title={item.key}
                >
                  {item.icon}
                </ActionIcon>
              ))}
            />
            <Flexbox
              height={'100%'}
              style={{ overflow: 'hidden', position: 'relative' }}
              width={'100%'}
            >
              <Flexbox
                align={'center'}
                className={`panel-drag-handle ${styles.header}`}
                horizontal
                justify={'space-between'}
              >
                <Flexbox align={'baseline'} gap={6} horizontal>
                  <b>{BRANDING_NAME} Dev Tools</b>
                  <span style={{ color: theme.colorTextDescription }}>/</span>
                  <span style={{ color: theme.colorTextDescription }}>{tab}</span>
                </Flexbox>
                <ActionIcon icon={XIcon} onClick={() => setIsExpanded(false)} />
              </Flexbox>
              {items.map((item) => (
                <Flexbox
                  flex={1}
                  height={'100%'}
                  key={item.key}
                  style={{
                    display: tab === item.key ? 'flex' : 'none',
                    overflow: 'hidden',
                  }}
                >
                  {item.children}
                </Flexbox>
              ))}
            </Flexbox>
          </Flexbox>
        </RndComponent>
      )}
    </>
  );
});

export default CollapsibleFloatPanel;
