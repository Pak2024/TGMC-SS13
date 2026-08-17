/**
 * @file
 * @copyright 2020 Aleksej Komarov
 * @license MIT
 */

import {
  ComponentProps,
  PropsWithChildren,
  ReactNode,
  useEffect,
  useLayoutEffect,
  useState,
} from 'react';
import { Box } from 'tgui-core/components';
import { UI_DISABLED, UI_INTERACTIVE } from 'tgui-core/constants';
import { BooleanLike, classes } from 'tgui-core/react';
import { decodeHtmlEntities } from 'tgui-core/string';

import { backendSuspendStart, globalStore, useBackend } from '../backend';
import { useDebug } from '../debug';
import {
  dragStartHandler,
  recallWindowGeometry,
  resizeStartHandler,
  setWindowKey,
} from '../drag';
import { createLogger } from '../logging';
import { Layout } from './Layout';
import { TitleBar } from './TitleBar';

const logger = createLogger('Window');

const DEFAULT_SIZE: [number, number] = [400, 600];

type Props = Partial<{
  buttons: ReactNode;
  canClose: BooleanLike;
  /** Fills the entire parent browser (lobby-style). No drag/resize. */
  fitted: BooleanLike;
  height: number;
  theme: string;
  title: string;
  width: number;
}> &
  PropsWithChildren;

export const Window = (props: Props) => {
  const {
    canClose = true,
    fitted = false,
    theme,
    title,
    children,
    buttons,
    width,
    height,
  } = props;

  const { config, suspended } = useBackend();
  const { debugLayout = false } = useDebug();
  const [isReadyToRender, setIsReadyToRender] = useState(false);

  useLayoutEffect(() => {
    Byond.winset(Byond.windowId, {
      'is-visible': false,
    });
    setIsReadyToRender(true);
  }, []);

  const { scale } = config.window;

  useEffect(() => {
    if (!suspended && isReadyToRender) {
      const updateGeometry = () => {
        if (fitted) {
          // Fullscreen inside parent browser — no geometry memory
          Byond.winset(Byond.windowId, {
            'is-visible': true,
            'titlebar': false,
            'can-resize': false,
            'can-close': false,
          });
        } else {
          const options = {
            ...config.window,
            size: DEFAULT_SIZE as [number, number],
          };
          if (width && height) {
            options.size = [width, height];
          }
          if (config.window?.key) {
            setWindowKey(config.window.key);
          }
          recallWindowGeometry(options);
          Byond.winset(Byond.windowId, {
            'is-visible': true,
          });
        }
        Byond.sendMessage('visible');
        logger.log('set to visible');
      };

      Byond.winset(Byond.windowId, {
        'can-close': fitted ? false : Boolean(canClose),
      });
      logger.log('mounting');
      updateGeometry();

      return () => {
        logger.log('unmounting');
      };
    }
  }, [isReadyToRender, width, height, scale, fitted, canClose]);

  const dispatch = globalStore.dispatch;

  const showDimmer =
    config.user &&
    (config.user.observer
      ? config.status < UI_DISABLED
      : config.status < UI_INTERACTIVE);

  return suspended ? null : (
    <Layout
      className={classes(['Window', fitted && 'Window--fitted'])}
      theme={theme}
    >
      {!fitted && (
        <TitleBar
          title={title || decodeHtmlEntities(config.title)}
          status={config.status}
          onDragStart={dragStartHandler}
          onClose={() => {
            logger.log('pressed close');
            dispatch(backendSuspendStart());
          }}
          canClose={canClose}
        >
          {buttons}
        </TitleBar>
      )}
      <div
        className={classes(['Window__rest', debugLayout && 'debug-layout'])}
        style={
          fitted
            ? { position: 'fixed', inset: 0, width: '100%', height: '100%' }
            : undefined
        }
      >
        {!suspended && children}
        {showDimmer && <div className="Window__dimmer" />}
      </div>
      {!fitted && (
        <>
          <div
            className="Window__resizeHandle__e"
            onMouseDown={resizeStartHandler(1, 0) as any}
          />
          <div
            className="Window__resizeHandle__s"
            onMouseDown={resizeStartHandler(0, 1) as any}
          />
          <div
            className="Window__resizeHandle__se"
            onMouseDown={resizeStartHandler(1, 1) as any}
          />
        </>
      )}
    </Layout>
  );
};

type ContentProps = Partial<{
  className: string;
  fitted: boolean;
  scrollable: boolean;
  vertical: boolean;
}> &
  ComponentProps<typeof Box> &
  PropsWithChildren;

const WindowContent = (props: ContentProps) => {
  const { className, fitted, children, ...rest } = props;
  return (
    <Layout.Content
      className={classes(['Window__content', className])}
      {...rest}
    >
      {(fitted && children) || (
        <div className="Window__contentPadding">{children}</div>
      )}
    </Layout.Content>
  );
};

Window.Content = WindowContent;
