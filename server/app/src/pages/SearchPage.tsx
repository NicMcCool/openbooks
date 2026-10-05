import {
  Alert,
  Button,
  Center,
  createStyles,
  Group,
  Stack,
  Text,
  TextInput,
  Title
} from "@mantine/core";
import { MagnifyingGlass, Warning } from "phosphor-react";
import { FormEvent, useEffect, useMemo, useState } from "react";
import ConnectionControl from "../components/ConnectionControl";
import LibraryKeeper from "../components/LibraryKeeper";
import BookTable from "../components/tables/BookTable";
import ErrorTable from "../components/tables/ErrorTable";
import { sendDownload, sendSearch } from "../state/stateSlice";
import { useAppDispatch, useAppSelector } from "../state/store";

const useStyles = createStyles(
  (theme, { errorMode }: { errorMode: boolean }) => ({
    stack: {
      "width": "100%",
      "height": "calc(100vh - 72px)",
      "@supports (height: 100dvh)": { height: "calc(100dvh - 72px)" },
      "minHeight": 360,
      "padding": theme.spacing.xl,
      "gap": theme.spacing.sm,
      [theme.fn.smallerThan("sm")]: { padding: theme.spacing.md }
    },
    searchForm: {
      width: "100%",
      flexShrink: 0,
      padding: theme.spacing.md,
      borderRadius: theme.radius.md,
      border: `1px solid ${
        theme.colorScheme === "dark"
          ? theme.colors.dark[5]
          : theme.colors.gray[3]
      }`,
      backgroundColor:
        theme.colorScheme === "dark" ? theme.colors.dark[7] : theme.white
    },
    searchRow: {
      gap: theme.spacing.sm,
      [theme.fn.smallerThan("xs")]: {
        "flexWrap": "wrap",
        "& > button": { width: "100%" }
      }
    },
    searchInput: {
      flex: 1,
      minWidth: 0,
      [theme.fn.smallerThan("xs")]: { flexBasis: "100%" }
    },
    heading: {
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      gap: theme.spacing.md,
      flexShrink: 0
    },
    clerk: {
      display: "flex",
      alignItems: "center",
      flexShrink: 0,
      [theme.fn.smallerThan("md")]: { display: "none" }
    },
    stamp: {
      border: `1px solid ${
        theme.colorScheme === "dark"
          ? theme.colors.dark[3]
          : theme.colors.gray[6]
      }`,
      borderRadius: 3,
      padding: "7px 12px",
      transform: "rotate(-4deg)",
      fontSize: 9,
      lineHeight: 1.8,
      textAlign: "center",
      letterSpacing: 1.5,
      color:
        theme.colorScheme === "dark"
          ? theme.colors.dark[1]
          : theme.colors.gray[7]
    },
    empty: {
      flex: 1,
      minHeight: 0,
      width: "100%",
      overflow: "auto",
      borderRadius: theme.radius.md,
      border: `1px dashed ${
        theme.colorScheme === "dark"
          ? theme.colors.dark[5]
          : theme.colors.gray[3]
      }`,
      padding: theme.spacing.lg
    },
    errorToggle: {
      "alignSelf": "start",
      "minHeight": 28,
      "flexShrink": 0,
      "fontWeight": 500,
      "color":
        theme.colorScheme === "dark"
          ? errorMode
            ? theme.white
            : theme.colors.dark[1]
          : errorMode
          ? theme.white
          : theme.colors.gray[7],
      "&:hover": {
        backgroundColor:
          theme.colorScheme === "dark"
            ? errorMode
              ? theme.colors.brand[6]
              : theme.colors.dark[7]
            : errorMode
            ? theme.colors.brand[5]
            : theme.colors.gray[1]
      }
    }
  })
);

export default function SearchPage() {
  const dispatch = useAppDispatch();
  const activeItem = useAppSelector((store) => store.state.activeItem);
  const connected = useAppSelector((store) => store.state.isConnected);
  const { isConnecting, connectionError, inFlightDownloads } = useAppSelector(
    (store) => store.state
  );
  const pendingTimestamp = useAppSelector(
    (store) => store.state.pendingSearchTimestamp
  );
  const searching = pendingTimestamp !== null;
  const activeSearching =
    activeItem !== null && activeItem.timestamp === pendingTimestamp;

  const [searchQuery, setSearchQuery] = useState("");
  const [showErrors, setShowErrors] = useState(false);

  const hasErrors = (activeItem?.errors ?? []).length > 0;
  const errorMode = showErrors && activeItem;
  const validInput = errorMode
    ? searchQuery.startsWith("!")
    : searchQuery !== "";

  const { classes } = useStyles({ errorMode: !!errorMode });

  useEffect(() => {
    setShowErrors(false);
  }, [activeItem]);

  const searchHandler = (event: FormEvent) => {
    event.preventDefault();
    if (
      !connected ||
      searching ||
      !validInput ||
      (errorMode && inFlightDownloads.length > 0)
    )
      return;

    if (errorMode) {
      dispatch(sendDownload(searchQuery));
    } else {
      dispatch(sendSearch(searchQuery));
    }

    setSearchQuery("");
  };

  const bookTable = useMemo(
    () => <BookTable books={activeItem?.results ?? []} />,
    [activeItem?.results]
  );

  const errorTable = useMemo(
    () => (
      <ErrorTable
        errors={activeItem?.errors ?? []}
        setSearchQuery={setSearchQuery}
      />
    ),
    [activeItem?.errors]
  );

  return (
    <Stack spacing={0} className={classes.stack}>
      <div className={classes.heading}>
        <div style={{ minWidth: 0 }}>
          <Text
            size="xs"
            color="dimmed"
            weight={600}
            transform="uppercase"
            mb={4}
            sx={{ letterSpacing: 1.2 }}>
            {activeItem
              ? "Findings of the catalogue"
              : "A small enquiry into a very large library"}
          </Text>
          <Title
            order={1}
            size="h2"
            weight={600}
            sx={{
              overflowWrap: "anywhere",
              fontFamily: "Georgia, serif",
              fontWeight: 400
            }}>
            {activeItem
              ? `${
                  activeItem.results
                    ? "Results"
                    : activeSearching
                    ? "Searching"
                    : "Search interrupted"
                } for "${activeItem.query}"`
              : "What shall we unearth?"}
          </Title>
          <Text color="dimmed" size="sm" mt={4}>
            {activeItem
              ? activeItem.results
                ? `${activeItem.results.length} ${
                    activeItem.results.length === 1 ? "book" : "books"
                  } found on IRC Highway`
                : activeSearching
                ? "Waiting for search results."
                : "This search was interrupted. Enter the query below to try again."
              : "Search eBooks shared on IRC Highway."}
          </Text>
        </div>
        {activeItem && (
          <div className={classes.clerk} aria-hidden="true">
            <div className={classes.stamp}>
              PROVISIONALLY
              <br />
              CATALOGUED
            </div>
            <LibraryKeeper size={100} />
          </div>
        )}
      </div>
      {!connected && (
        <Alert
          color={isConnecting ? "brand" : "yellow"}
          icon={<Warning size={18} />}
          sx={{ flexShrink: 0 }}>
          <Group position="apart" spacing="xs">
            <Text size="sm">
              {isConnecting
                ? "Connecting to IRC..."
                : connectionError ||
                  "Connect to IRC to search and download books."}
            </Text>
            <ConnectionControl />
          </Group>
        </Alert>
      )}
      <form className={classes.searchForm} onSubmit={(e) => searchHandler(e)}>
        <Group noWrap className={classes.searchRow}>
          <TextInput
            className={classes.searchInput}
            variant="default"
            size="md"
            aria-label={
              errorMode ? "Manual download command" : "Search for a book"
            }
            disabled={searching}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={
              errorMode
                ? "Paste a download command starting with !"
                : "Search by title, author, or keyword"
            }
            radius="md"
            type="search"
            icon={<MagnifyingGlass weight="bold" size={22} />}
            required
          />

          <Button
            type="submit"
            size="md"
            disabled={
              !connected ||
              searching ||
              !validInput ||
              (!!errorMode && inFlightDownloads.length > 0)
            }
            radius="md"
            variant="filled">
            {errorMode ? "Download" : "Search"}
          </Button>
        </Group>
      </form>

      {hasErrors && (
        <Button
          className={classes.errorToggle}
          variant={errorMode ? "filled" : "subtle"}
          onClick={() => setShowErrors((show) => !show)}
          leftIcon={<Warning size={18} />}
          size="xs">
          {activeItem?.errors?.length} Parsing{" "}
          {activeItem?.errors?.length === 1 ? "Error" : "Errors"}
        </Button>
      )}
      {!activeItem ? (
        <Center className={classes.empty}>
          <Stack align="center" spacing="sm">
            <LibraryKeeper size={220} />
            <Title
              order={2}
              size="h2"
              weight={400}
              align="center"
              sx={{ fontFamily: "Georgia, serif" }}>
              The catalogue awaits instructions.
            </Title>
            <Text
              size="sm"
              color="dimmed"
              align="center"
              sx={{ maxWidth: 420 }}>
              Give it a title or an author. It will consult the shelves, disturb
              something small, and pretend this was all perfectly routine.
            </Text>
          </Stack>
        </Center>
      ) : errorMode ? (
        errorTable
      ) : (
        bookTable
      )}
      <Text
        size={11}
        color="dimmed"
        sx={{
          flexShrink: 0,
          fontFamily: "Georgia, serif",
          fontStyle: "italic"
        }}>
        <sup>1</sup> Reading the books you already own is, of course, an
        entirely separate department.
      </Text>
    </Stack>
  );
}
