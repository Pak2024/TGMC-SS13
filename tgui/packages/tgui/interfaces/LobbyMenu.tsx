import { randomInteger } from 'common/random';
import { storage } from 'common/storage';
import {
  type ComponentProps,
  createContext,
  type PropsWithChildren,
  type ReactNode,
  useContext,
  useEffect,
  useRef,
  useState,
} from 'react';
import { resolveAsset } from 'tgui/assets';
import { useBackend } from 'tgui/backend';
import { Window } from 'tgui/layouts';
import {
  Box,
  Button as NativeButton,
  Flex,
  Section,
  Stack,
} from 'tgui-core/components';
import { type BooleanLike, classes } from 'tgui-core/react';

type LobbyData = {
  lobby_author?: string;
  character_name: string;
  xeno_prefix?: string;
  xeno_postfix?: string;
  tutorials_ready?: BooleanLike;
  round_start: BooleanLike;
  readied: BooleanLike;
  confirmation_message?: string | string[];
  upp_enabled?: BooleanLike;
  xenomorph_enabled?: BooleanLike;
  predator_enabled?: BooleanLike;
  fax_responder_enabled?: BooleanLike;
  preference_issues?: string[];
};

type LobbyContextType = {
  animationsDisable: boolean;
  themeDisable: boolean;
  setModal?: (_: ReactNode | false) => void;
};

const LobbyContext = createContext<LobbyContextType>({
  animationsDisable: false,
  themeDisable: false,
});

export const LobbyMenu = () => {
  const { act, data } = useBackend<LobbyData>();
  const {
    confirmation_message,
    preference_issues = [],
  } = data;

  const onLoadPlayer = useRef<HTMLAudioElement>(null);
  const [modal, setModal] = useState<ReactNode | false>(false);
  const [disableAnimations, setDisableAnimations] = useState(false);
  const [filterDisabled, setFilterDisabled] = useState(false);
  const [themeDisabled, setThemeDisabled] = useState(false);
  const [hidden, setHidden] = useState(false);

  useEffect(() => {
    storage
      .get('lobby-filter-disabled')
      .then((val) => setFilterDisabled(!!val))
      .catch(() => undefined);
    storage
      .get('lobby-theme-disabled')
      .then((val) => setThemeDisabled(!!val))
      .catch(() => undefined);

    const audioTimer = setTimeout(() => {
      onLoadPlayer.current?.play().catch(() => undefined);
    }, 250);

    const animTimer = setTimeout(() => setDisableAnimations(true), 10000);

    return () => {
      clearTimeout(audioTimer);
      clearTimeout(animTimer);
    };
  }, []);

  useEffect(() => {
    if (!confirmation_message) return;
    setModal(
      <Section
        buttons={
          <Button
            mb={5}
            onClick={() => {
              setModal(false);
              act('cancel');
            }}
            icon="x"
          />
        }
        p={3}
        title="Confirm"
      >
        <Box>
          <Stack vertical>
            {Array.isArray(confirmation_message) ? (
              confirmation_message.map((el, i) => (
                <Stack.Item key={i}>{el}</Stack.Item>
              ))
            ) : (
              <Stack.Item>{confirmation_message}</Stack.Item>
            )}
          </Stack>
          <Stack justify="center">
            <Stack.Item>
              <Button onClick={() => act('confirm')}>Confirm</Button>
            </Stack.Item>
          </Stack>
        </Box>
      </Section>,
    );
  }, [confirmation_message]);

  const themeToUse = themeDisabled ? undefined : 'crtlobby';

  return (
    <Window theme={themeToUse} fitted canClose={false}>
      <audio src={resolveAsset('load.mp3')} ref={onLoadPlayer} />
      <Window.Content
        className={classes([
          'LobbyScreen',
          !themeDisabled && 'crtTheme',
          !filterDisabled && 'filterEnabled',
          disableAnimations && 'noAnimation',
        ])}
        fitted
      >
        <LobbyContext.Provider
          value={{
            animationsDisable: disableAnimations,
            themeDisable: themeDisabled,
            setModal,
          }}
        >
          {!!modal && (
            <Box
              position="absolute"
              style={{
                inset: 0,
                zIndex: 20,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                background: 'rgba(0,0,0,0.45)',
              }}
            >
              {modal}
            </Box>
          )}

          <Box
            height="100%"
            width="100%"
            style={{
              backgroundImage: `url(${resolveAsset('lobby_art.png')})`,
            }}
            className="bgLoad bgBackground"
          />
          {/* Слой фильтра с z-index 2 и игнорированием кликов (арт под ним) */}
          <Box
            height="100%"
            width="100%"
            position="absolute"
            className="crt"
            style={{ zIndex: 2, pointerEvents: 'none' }}
          />
          <Box position="absolute" top="10px" right="10px" style={{ zIndex: 5 }}>
            <Button
              icon="cog"
              onClick={() => {
                setModal(
                  <Section
                    p={5}
                    title="Lobby Settings"
                    buttons={
                      <Button icon="xmark" onClick={() => setModal(false)} />
                    }
                  >
                    <Stack>
                      <Stack.Item>
                        <Button
                          icon="tv"
                          onClick={() => {
                            storage.set(
                              'lobby-filter-disabled',
                              !filterDisabled,
                            );
                            setFilterDisabled(!filterDisabled);
                            setModal(false);
                          }}
                          tooltip="Removes the CRT filter background"
                        >
                          {`${filterDisabled ? 'Enable' : 'Disable'} Cinema Mode`}
                        </Button>
                      </Stack.Item>
                      <Stack.Item>
                        <Button
                          icon="bolt"
                          onClick={() => {
                            storage.set(
                              'lobby-theme-disabled',
                              !themeDisabled,
                            );
                            setThemeDisabled(!themeDisabled);
                            setModal(false);
                          }}
                          tooltip="Totally removes the CRT theme"
                        >
                          {`${themeDisabled ? 'Enable' : 'Disable'} CRT Theme`}
                        </Button>
                      </Stack.Item>
                    </Stack>
                  </Section>,
                );
              }}
            />
          </Box>

          {hidden && (
            <Box position="absolute" top="10px" left="10px" style={{ zIndex: 5 }}>
              <Button icon="check" onClick={() => setHidden(false)} />
            </Box>
          )}

          <Stack vertical height="100%" justify="space-around" align="center">
            <Stack.Item>
              <LobbyButtons
                setModal={setModal}
                hidden={hidden}
                setHidden={setHidden}
              />
            </Stack.Item>
          </Stack>
          <Box
            position="absolute"
            left={3}
            top={-2}
            height="100%"
            className="messageHolder"
          >
            <Stack vertical justify="flex-end" fill>
              {preference_issues.map((issue, index) => (
                <Section key={index} className="sectionLoad">
                  <Box>{issue}</Box>
                </Section>
              ))}
            </Stack>
          </Box>
        </LobbyContext.Provider>
      </Window.Content>
    </Window>
  );
};

const ModalConfirm = (props: PropsWithChildren) => {
  const { children } = props;
  const { setModal } = useContext(LobbyContext);
  return (
    <Section
      buttons={<Button mb={5} onClick={() => setModal!(false)} icon="x" />}
      p={3}
      title="Confirm"
    >
      {children}
    </Section>
  );
};

const SMALL_BUTTON_DELAY = 3;

const LobbyButtons = (props: {
  readonly setModal: (_: ReactNode | false) => void;
  readonly hidden: boolean;
  readonly setHidden: (_: boolean) => void;
}) => {
  const { act, data } = useBackend<LobbyData>();
  const { setModal, hidden, setHidden } = props;
  const {
    character_name,
    xeno_postfix = '',
    xeno_prefix = '',
    round_start,
    readied,
    predator_enabled,
    fax_responder_enabled,
    tutorials_ready,
    xenomorph_enabled,
  } = data;

  const [xenoNumber] = useState(`${randomInteger(0, 999)}`);
  const noop = () => undefined;

  return (
    <Section
      p={3}
      className="sectionLoad"
      style={{
        opacity: hidden ? 0 : 1,
        /* Исправление бага с кликабельными скрытыми кнопками */
        pointerEvents: hidden ? 'none' : undefined,
      }}
    >
      <Stack vertical>
        <Stack.Item>
          <Stack>
            <Stack.Item>
              <Stack vertical justify="space-around" height="100%">
                <Stack.Item>
                  <Box height="65px">
                    <Box
                      style={{
                        backgroundImage: `url("${resolveAsset('tgmc_64.png')}")`,
                        backgroundSize: 'contain',
                        backgroundRepeat: 'no-repeat',
                      }}
                      width="64px"
                      height="64px"
                      className="loadEffect"
                      onClick={() => setHidden(true)}
                    />
                  </Box>
                </Stack.Item>
              </Stack>
            </Stack.Item>
            <Stack.Item minWidth="200px">
              <Stack vertical>
                <Stack.Item>
                  <Stack justify="center">
                    <Stack.Item>
                      <Box className="typeEffect styledText">Welcome,</Box>
                    </Stack.Item>
                  </Stack>
                </Stack.Item>
                <Stack.Item>
                  <Stack justify="center">
                    <Stack.Item>
                      <Box
                        className="typeEffect styledText"
                        style={{ animationDelay: '1.4s' }}
                      >
                        {character_name || 'Recruit'}
                      </Box>
                    </Stack.Item>
                  </Stack>
                </Stack.Item>
                <Stack.Item>
                  <Stack justify="center">
                    <Stack.Item>
                      <Box
                        className="typeEffect styledText"
                        style={{ animationDelay: '1.4s' }}
                      >
                        {`${xeno_prefix || 'XX'}-${xenoNumber}${xeno_postfix || ''}`}
                      </Box>
                    </Stack.Item>
                  </Stack>
                </Stack.Item>
              </Stack>
            </Stack.Item>
          </Stack>
        </Stack.Item>

        <TimedDivider />
        <LobbyButton
          index={1}
          onClick={noop}
          disabled={!tutorials_ready}
          tooltip={
            !tutorials_ready
              ? 'Tutorials are not available on this server.'
              : ''
          }
          icon="book-open"
        >
          Tutorial
        </LobbyButton>

        <LobbyButton
          index={2}
          onClick={() => act('preferences')}
          icon="file-lines"
        >
          Setup Character
        </LobbyButton>

        <LobbyButton index={3} icon="check-to-slot" onClick={noop}>
          Polls
        </LobbyButton>

        <LobbyButton index={4} onClick={noop} icon="list-ul">
          View Playtimes
        </LobbyButton>

        <TimedDivider />

        <LobbyButton
          index={5}
          icon="eye"
          onClick={() => {
            setModal(
              <ModalConfirm>
                <Box>
                  <Stack vertical>
                    <Stack.Item>Are you sure you wish to observe?</Stack.Item>
                    <Stack.Item>
                      When you observe, you will not be able to join as marine
                      immediately.
                    </Stack.Item>
                  </Stack>
                  <Stack justify="center">
                    <Stack.Item>
                      <Button onClick={() => act('observe')}>Confirm</Button>
                    </Stack.Item>
                  </Stack>
                </Box>
              </ModalConfirm>,
            );
          }}
        >
          Observe
        </LobbyButton>

        {round_start ? (
          <LobbyButton
            index={6}
            selected={!!readied}
            onClick={() => act('ready')}
            icon={readied ? 'check' : 'xmark'}
            tooltip={
              xenomorph_enabled ? 'Ready with Xenomorph enabled' : undefined
            }
          >
            {readied ? 'Unready' : 'Ready'}
          </LobbyButton>
        ) : (
          <>
            <Stack.Item>
              <Stack>
                <Stack.Item grow>
                  <LobbyButton
                    index={6}
                    onClick={() => act('late_join')}
                    icon="users"
                  >
                    Join the TGMC
                  </LobbyButton>
                </Stack.Item>
                <Stack.Item>
                  <LobbyButton
                    icon="list"
                    tooltip="View Crew Manifest"
                    index={6 + SMALL_BUTTON_DELAY}
                    onClick={() => act('manifest')}
                  />
                </Stack.Item>
              </Stack>
            </Stack.Item>
            <Stack.Item>
              <Stack>
                <Stack.Item grow>
                  <LobbyButton
                    index={7}
                    icon="virus"
                    onClick={() => act('late_join')}
                  >
                    Join the Hive
                  </LobbyButton>
                </Stack.Item>
                <Stack.Item>
                  <LobbyButton
                    icon="users"
                    tooltip="View Hive Manifest"
                    index={7 + SMALL_BUTTON_DELAY}
                    onClick={() => act('xenomanifest')}
                  />
                </Stack.Item>
              </Stack>
            </Stack.Item>
            {!!predator_enabled && (
              <LobbyButton index={9} onClick={noop}>
                <Flex>
                  <Flex.Item>
                    <Box className="pred" inline />
                  </Flex.Item>
                  <Flex.Item>Join the Hunt</Flex.Item>
                </Flex>
              </LobbyButton>
            )}
            {!!fax_responder_enabled && (
              <LobbyButton index={10} icon="fax" onClick={noop}>
                Respond to Faxes
              </LobbyButton>
            )}
          </>
        )}

        <LobbyButton index={11} icon="book" onClick={() => act('lore')}>
          Lore
        </LobbyButton>
      </Stack>
    </Section>
  );
};

const TimedDivider = () => {
  const ref = useRef<HTMLDivElement>(null);
  const { themeDisable } = useContext(LobbyContext);

  useEffect(() => {
    if (!themeDisable) {
      setTimeout(() => {
        if (ref.current) ref.current.style.display = 'block';
      }, 1500);
    }
  }, [themeDisable]);

  return (
    <Stack.Item>
      <div
        style={{
          borderStyle: 'solid',
          borderWidth: '1px',
          display: themeDisable ? 'block' : 'none',
        }}
        className="dividerEffect"
        ref={ref}
      />
    </Stack.Item>
  );
};

type LobbyButtonProps = ComponentProps<typeof Box> & {
  readonly index: number;
  readonly selected?: boolean;
  readonly disabled?: boolean;
  readonly icon?: string;
  readonly tooltip?: string;
  readonly onClick?: () => void;
};

const LobbyButton = (props: LobbyButtonProps) => {
  const { children, index, className, ...rest } = props;
  const context = useContext(LobbyContext);

  return (
    <Stack.Item
      className="buttonEffect"
      style={{
        animationDelay: context.animationsDisable
          ? '0s'
          : `${1.5 + index * 0.2}s`,
      }}
    >
      <Button fluid className={'distinctButton ' + (className || '')} {...rest}>
        <StyledText>{children}</StyledText>
      </Button>
    </Stack.Item>
  );
};

const StyledText = (props: PropsWithChildren) => (
  <Box inline className="styledText">
    {props.children}
  </Box>
);

const Button = (props: any) => <NativeButton {...props} />;
