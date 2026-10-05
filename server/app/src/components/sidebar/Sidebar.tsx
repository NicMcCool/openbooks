import {
  Badge,
  createStyles,
  Group,
  Navbar,
  SegmentedControl,
  Stack,
  Text
} from "@mantine/core";
import { useLocalStorage } from "@mantine/hooks";
import { IdentificationBadge } from "phosphor-react";
import { useAppSelector } from "../../state/store";
import ConnectionControl from "../ConnectionControl";
import History from "./History";
import Library from "./Library";

const useStyles = createStyles((theme) => ({
  navbar: {
    backgroundColor:
      theme.colorScheme === "dark" ? theme.colors.dark[7] : theme.white,
    borderRightColor:
      theme.colorScheme === "dark" ? theme.colors.dark[5] : theme.colors.gray[2]
  },
  footer: {
    borderTop: `1px solid ${
      theme.colorScheme === "dark" ? theme.colors.dark[5] : theme.colors.gray[2]
    }`
  }
}));

export default function Sidebar() {
  const { classes } = useStyles();
  const connected = useAppSelector((store) => store.state.isConnected);
  const connecting = useAppSelector((store) => store.state.isConnecting);
  const username = useAppSelector((store) => store.state.username);
  const [index, setIndex] = useLocalStorage<"books" | "history">({
    key: "sidebar-state",
    defaultValue: "history"
  });

  return (
    <Navbar
      id="library-sidebar"
      aria-label="Library sidebar"
      width={{ sm: 300 }}
      className={classes.navbar}>
      <Navbar.Section p="md">
        <Text
          size="xs"
          weight={700}
          color="dimmed"
          transform="uppercase"
          mb={6}
          sx={{ letterSpacing: 1.2 }}>
          Your library
        </Text>
        <Text size="sm" color="dimmed" mb="lg">
          The shelves are organised. The books have other ideas.
        </Text>
        <SegmentedControl
          size="xs"
          value={index}
          onChange={(value: "books" | "history") => setIndex(value)}
          data={[
            { label: "Search History", value: "history" },
            { label: "Previous Downloads", value: "books" }
          ]}
          fullWidth
        />
      </Navbar.Section>
      <Navbar.Section
        grow
        px="md"
        pb="md"
        style={{ overflow: "auto", minHeight: 0 }}>
        {index === "history" ? <History /> : <Library />}
      </Navbar.Section>
      <Navbar.Section px="md" pb="md">
        <Text
          size={11}
          color="dimmed"
          sx={{
            fontFamily: "Georgia, serif",
            fontStyle: "italic",
            borderLeft: "2px solid #4277bb",
            paddingLeft: 10
          }}>
          Please do not feed the plot twists.
        </Text>
      </Navbar.Section>
      <Navbar.Section className={classes.footer} p="md">
        <Stack spacing="xs">
          <Group spacing="xs" noWrap>
            <IdentificationBadge size={22} style={{ flexShrink: 0 }} />
            <Text
              size="sm"
              weight={500}
              title={username}
              lineClamp={1}
              sx={{ overflowWrap: "anywhere" }}>
              {username || "Waiting for connection"}
            </Text>
          </Group>
          <Group position="apart" noWrap>
            <Text size="xs" color="dimmed">
              IRC Highway
            </Text>
            <Badge size="xs" variant="dot" color={connected ? "teal" : "gray"}>
              {connecting
                ? "Connecting"
                : connected
                ? "Connected"
                : "Disconnected"}
            </Badge>
          </Group>
          <ConnectionControl />
        </Stack>
      </Navbar.Section>
    </Navbar>
  );
}
