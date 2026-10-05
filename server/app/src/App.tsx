import {
  ActionIcon,
  AppShell,
  Badge,
  ColorScheme,
  ColorSchemeProvider,
  createEmotionCache,
  Group,
  Header,
  MantineProvider,
  Text,
  Tooltip
} from "@mantine/core";
import { useLocalStorage } from "@mantine/hooks";
import { NotificationsProvider } from "@mantine/notifications";
import {
  BellSimple,
  BookOpen,
  MoonStars,
  Sidebar as SidebarIcon,
  Sun
} from "phosphor-react";
import ConnectionControl from "./components/ConnectionControl";
import NotificationDrawer from "./components/drawer/NotificationDrawer";
import Sidebar from "./components/sidebar/Sidebar";
import SearchPage from "./pages/SearchPage";
import { toggleDrawer } from "./state/notificationSlice";
import { toggleSidebar } from "./state/stateSlice";
import { useAppDispatch, useAppSelector } from "./state/store";

const emotionCache = createEmotionCache({ key: "openbooks" });

export default function App() {
  const [colorScheme, setColorScheme] = useLocalStorage({
    key: "color-scheme",
    defaultValue: "dark" as ColorScheme,
    getInitialValueInEffect: true
  });
  const dispatch = useAppDispatch();
  const opened = useAppSelector((state) => state.state.isSidebarOpen);
  const connected = useAppSelector((state) => state.state.isConnected);
  const connecting = useAppSelector((state) => state.state.isConnecting);
  const toggleColorScheme = () =>
    setColorScheme((color) => (color === "dark" ? "light" : "dark"));

  return (
    <ColorSchemeProvider
      colorScheme={colorScheme}
      toggleColorScheme={toggleColorScheme}>
      <MantineProvider
        emotionCache={emotionCache}
        withGlobalStyles
        withNormalizeCSS
        theme={{
          colorScheme,
          fontFamily:
            'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
          headings: {
            fontFamily:
              'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif'
          },
          defaultRadius: "md",
          activeStyles: { transform: "none" },
          primaryColor: "brand",
          primaryShade: { light: 6, dark: 5 },
          colors: {
            dark: [
              "#e5eaf1",
              "#c4cdd9",
              "#9daabd",
              "#748399",
              "#46546a",
              "#303d50",
              "#222d3e",
              "#192332",
              "#121b28",
              "#0d1420"
            ],
            brand: [
              "#edf3fc",
              "#dce8f8",
              "#b7cff0",
              "#8fb3e4",
              "#6a98d3",
              "#4277bb",
              "#3264a5",
              "#28528a",
              "#234571",
              "#203b5e"
            ]
          },
          components: {
            ActionIcon: {
              defaultProps: { radius: "md", color: "brand", size: "lg" }
            },
            Button: { defaultProps: { radius: "md" } },
            Tooltip: { defaultProps: { withArrow: true, withinPortal: true } }
          }
        }}>
        <NotificationsProvider position="top-center">
          <AppShell
            navbar={opened ? <Sidebar /> : undefined}
            navbarOffsetBreakpoint="sm"
            header={
              <Header
                height={72}
                px="md"
                sx={(theme) => ({
                  backgroundColor:
                    colorScheme === "dark" ? theme.colors.dark[7] : theme.white,
                  borderBottomColor:
                    colorScheme === "dark"
                      ? theme.colors.dark[5]
                      : theme.colors.gray[2]
                })}>
                <Group
                  position="apart"
                  noWrap
                  sx={{ height: "100%" }}
                  spacing="xs">
                  <Group noWrap spacing="sm">
                    <Tooltip
                      label={opened ? "Collapse sidebar" : "Open sidebar"}>
                      <ActionIcon
                        aria-label={
                          opened ? "Collapse sidebar" : "Open sidebar"
                        }
                        aria-expanded={opened}
                        aria-controls="library-sidebar"
                        onClick={() => dispatch(toggleSidebar())}>
                        <SidebarIcon size={21} />
                      </ActionIcon>
                    </Tooltip>
                    <Text
                      component="span"
                      sx={(theme) => ({
                        display: "flex",
                        [theme.fn.smallerThan("xs")]: { display: "none" }
                      })}>
                      <BookOpen size={25} weight="duotone" />
                    </Text>
                    <div>
                      <Text
                        weight={700}
                        size={23}
                        sx={(theme) => ({
                          fontFamily: "Georgia, serif",
                          letterSpacing: -0.5,
                          lineHeight: 1.15,
                          [theme.fn.smallerThan("xs")]: { fontSize: 20 }
                        })}>
                        OpenBooks{" "}
                        <Text
                          component="span"
                          color="dimmed"
                          sx={(theme) => ({
                            fontSize: 14,
                            fontWeight: 400,
                            letterSpacing: 0,
                            [theme.fn.smallerThan("xs")]: {
                              display: "block",
                              fontSize: 11
                            }
                          })}>
                          by Nic
                        </Text>
                      </Text>
                      <Text
                        size={9}
                        color="dimmed"
                        transform="uppercase"
                        sx={(theme) => ({
                          letterSpacing: 1.6,
                          marginTop: 4,
                          [theme.fn.smallerThan("sm")]: { display: "none" }
                        })}>
                        Department of Unfinished Reading
                      </Text>
                    </div>
                  </Group>
                  <Group noWrap spacing="xs">
                    <Badge
                      variant="light"
                      color={connected ? "teal" : "gray"}
                      role="status"
                      sx={(theme) => ({
                        [theme.fn.smallerThan("xs")]: { display: "none" }
                      })}>
                      {connecting
                        ? "Connecting"
                        : connected
                        ? "Connected"
                        : "Disconnected"}
                    </Badge>
                    <ConnectionControl compact />
                    <Tooltip
                      label={
                        colorScheme === "dark"
                          ? "Switch to light mode"
                          : "Switch to dark mode"
                      }>
                      <ActionIcon
                        aria-label={
                          colorScheme === "dark"
                            ? "Switch to light mode"
                            : "Switch to dark mode"
                        }
                        onClick={toggleColorScheme}>
                        {colorScheme === "dark" ? (
                          <Sun size={20} />
                        ) : (
                          <MoonStars size={20} />
                        )}
                      </ActionIcon>
                    </Tooltip>
                    <Tooltip label="Notifications">
                      <ActionIcon
                        aria-label="Notifications"
                        onClick={() => dispatch(toggleDrawer())}>
                        <BellSimple size={20} />
                      </ActionIcon>
                    </Tooltip>
                  </Group>
                </Group>
              </Header>
            }
            padding={0}
            styles={(theme) => ({
              main: {
                minWidth: 0,
                backgroundColor:
                  colorScheme === "dark"
                    ? theme.colors.dark[8]
                    : theme.colors.gray[0]
              }
            })}>
            <SearchPage />
            <NotificationDrawer />
          </AppShell>
        </NotificationsProvider>
      </MantineProvider>
    </ColorSchemeProvider>
  );
}
