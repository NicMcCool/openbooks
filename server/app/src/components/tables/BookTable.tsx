import {
  Button,
  Group,
  Indicator,
  ScrollArea,
  Stack,
  Table,
  Text,
  TextInput,
  Tooltip
} from "@mantine/core";
import { useElementSize, useMergedRef } from "@mantine/hooks";
import {
  createColumnHelper,
  FilterFn,
  flexRender,
  getCoreRowModel,
  getFacetedRowModel,
  getFacetedUniqueValues,
  getFilteredRowModel,
  Row,
  useReactTable
} from "@tanstack/react-table";
import { useVirtualizer } from "@tanstack/react-virtual";
import { Check, MagnifyingGlass, User } from "phosphor-react";
import { useMemo, useRef } from "react";
import { useGetServersQuery } from "../../state/api";
import { BookDetail } from "../../state/messages";
import { sendDownload } from "../../state/stateSlice";
import { useAppDispatch, useAppSelector } from "../../state/store";
import FacetFilter, {
  ServerFacetEntry,
  StandardFacetEntry
} from "./Filters/FacetFilter";
import { useTableStyles } from "./styles";

const columnHelper = createColumnHelper<BookDetail>();
const stringInArray: FilterFn<any> = (
  row,
  columnId,
  filterValue: string[] | undefined
) =>
  !filterValue?.length || filterValue.includes(row.getValue<string>(columnId));
interface BookTableProps {
  books: BookDetail[];
}
export default function BookTable({ books }: BookTableProps) {
  const { classes, cx, theme } = useTableStyles();
  const connected = useAppSelector((store) => store.state.isConnected);
  const { data: servers } = useGetServersQuery(null, { skip: !connected });
  const { ref: elementSizeRef, width } = useElementSize();
  const virtualizerRef = useRef<HTMLDivElement>(null);
  const mergedRef = useMergedRef(elementSizeRef, virtualizerRef);
  const columns = useMemo(
    () => [
      columnHelper.accessor("server", {
        header: "Server",
        size: 110,
        minSize: 95,
        filterFn: stringInArray,
        cell: (props) => (
          <Tooltip
            label={
              connected && servers?.includes(props.getValue())
                ? "Server online"
                : "Server unavailable"
            }
            withArrow>
            <Text size="xs" lineClamp={1} ml={16} title={props.getValue()}>
              <Indicator
                zIndex={0}
                position="middle-start"
                offset={-12}
                size={6}
                color={
                  connected && servers?.includes(props.getValue())
                    ? "green.6"
                    : "gray"
                }>
                {props.getValue()}
              </Indicator>
            </Text>
          </Tooltip>
        )
      }),
      // Kept as a hidden column so author filtering is independent of title.
      columnHelper.accessor("author", {
        header: "Author",
        filterFn: "includesString"
      }),
      columnHelper.accessor("title", {
        header: "Book / author",
        size: Math.max(300, width - 414),
        minSize: 260,
        filterFn: "includesString",
        cell: (props) => (
          <Stack spacing={2}>
            <Tooltip
              label={props.getValue()}
              multiline
              width={360}
              events={{ hover: true, focus: true, touch: false }}>
              <Text tabIndex={0} size="sm" weight={500} lineClamp={1}>
                {props.getValue()}
              </Text>
            </Tooltip>
            <Tooltip
              label={props.row.original.author || "Unknown author"}
              multiline
              width={300}
              events={{ hover: true, focus: true, touch: false }}>
              <Text tabIndex={0} size="xs" color="dimmed" lineClamp={1}>
                {props.row.original.author || "Unknown author"}
              </Text>
            </Tooltip>
          </Stack>
        )
      }),
      columnHelper.accessor("format", {
        header: "Format",
        size: 72,
        minSize: 60,
        filterFn: stringInArray
      }),
      columnHelper.accessor("size", { header: "Size", size: 82, minSize: 65 }),
      columnHelper.display({
        id: "download",
        header: "Download",
        size: 150,
        minSize: 145,
        cell: ({ row }) => <DownloadButton book={row.original.full} />
      })
    ],
    [width, servers, connected]
  );
  const table = useReactTable({
    data: books,
    columns,
    initialState: { columnVisibility: { author: false } },
    enableFilters: true,
    columnResizeMode: "onChange",
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getFacetedRowModel: getFacetedRowModel(),
    getFacetedUniqueValues: getFacetedUniqueValues()
  });
  const { rows: tableRows } = table.getRowModel();
  const rowVirtualizer = useVirtualizer({
    count: tableRows.length,
    getScrollElement: () => virtualizerRef.current,
    estimateSize: () => 72,
    overscan: 10
  });
  const virtualItems = rowVirtualizer.getVirtualItems();
  const paddingTop = virtualItems[0]?.start ?? 0;
  const paddingBottom = virtualItems.length
    ? rowVirtualizer.getTotalSize() - virtualItems[virtualItems.length - 1].end
    : 0;
  const filtered = table.getState().columnFilters.length > 0;
  return (
    <>
      <Stack spacing="xs" sx={{ flexShrink: 0 }}>
        <Group position="apart" spacing="xs">
          <Text size="xs" weight={600}>
            Filter these results
          </Text>
          <Group spacing="sm">
            <Text size="xs" color="dimmed" role="status">
              {tableRows.length} of {books.length} books
            </Text>
            <Button
              size="xs"
              variant="subtle"
              compact
              disabled={!filtered}
              onClick={() => table.resetColumnFilters(true)}>
              Clear filters
            </Button>
          </Group>
        </Group>
        <Group spacing="xs">
          <TextInput
            size="xs"
            aria-label="Filter by title"
            placeholder="Filter by title"
            icon={<MagnifyingGlass size={14} />}
            sx={{ flex: "1 1 170px" }}
            value={(table.getColumn("title")?.getFilterValue() as string) ?? ""}
            onChange={(event) =>
              table
                .getColumn("title")
                ?.setFilterValue(event.currentTarget.value)
            }
          />
          <TextInput
            size="xs"
            aria-label="Filter by author"
            placeholder="Filter by author"
            icon={<User size={14} />}
            sx={{ flex: "1 1 150px" }}
            value={
              (table.getColumn("author")?.getFilterValue() as string) ?? ""
            }
            onChange={(event) =>
              table
                .getColumn("author")
                ?.setFilterValue(event.currentTarget.value)
            }
          />
          <FacetFilter
            placeholder="Server"
            column={table.getColumn("server")!}
            table={table}
            Entry={ServerFacetEntry}
          />
          <FacetFilter
            placeholder="Format"
            column={table.getColumn("format")!}
            table={table}
            Entry={StandardFacetEntry}
          />
        </Group>
      </Stack>
      <ScrollArea
        viewportRef={mergedRef}
        className={classes.container}
        type="auto"
        scrollbarSize={8}
        offsetScrollbars={false}>
        <Table
          highlightOnHover
          verticalSpacing="sm"
          fontSize="xs"
          sx={{
            tableLayout: "fixed",
            width: table.getTotalSize(),
            minWidth: "100%"
          }}>
          <thead className={classes.head}>
            {table.getHeaderGroups().map((headerGroup) => (
              <tr key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <th
                    key={header.id}
                    className={classes.headerCell}
                    style={{ width: header.getSize() }}>
                    {flexRender(
                      header.column.columnDef.header,
                      header.getContext()
                    )}
                    <div
                      onMouseDown={header.getResizeHandler()}
                      onTouchStart={header.getResizeHandler()}
                      className={cx(classes.resizer, {
                        isResizing: header.column.getIsResizing()
                      })}
                    />
                  </th>
                ))}
              </tr>
            ))}
          </thead>
          <tbody>
            {paddingTop > 0 && (
              <tr>
                <td
                  colSpan={5}
                  style={{ height: paddingTop, padding: 0, border: 0 }}
                />
              </tr>
            )}
            {virtualItems.map((virtualRow) => {
              const row = tableRows[virtualRow.index] as Row<BookDetail>;
              return (
                <tr key={row.id} style={{ height: 72 }}>
                  {row.getVisibleCells().map((cell) => (
                    <td
                      key={cell.id}
                      style={{
                        color:
                          theme.colorScheme === "dark"
                            ? theme.colors.dark[0]
                            : theme.colors.gray[9]
                      }}>
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </td>
                  ))}
                </tr>
              );
            })}
            {paddingBottom > 0 && (
              <tr>
                <td
                  colSpan={5}
                  style={{ height: paddingBottom, padding: 0, border: 0 }}
                />
              </tr>
            )}
            {tableRows.length === 0 && (
              <tr>
                <td colSpan={5}>
                  <Text align="center" color="dimmed" py="xl">
                    {filtered
                      ? "No books match these filters. Try clearing them."
                      : "No results to show yet."}
                  </Text>
                </td>
              </tr>
            )}
          </tbody>
        </Table>
      </ScrollArea>
    </>
  );
}
function DownloadButton({ book }: { book: string }) {
  const dispatch = useAppDispatch();
  const {
    isConnected,
    inFlightDownloads,
    completedDownloads,
    failedDownloads
  } = useAppSelector((state) => state.state);
  const pending = inFlightDownloads.includes(book);
  const completed = completedDownloads.includes(book);
  const failed = failedDownloads.includes(book);
  const blocked = !isConnected || inFlightDownloads.length > 0;
  const hint = !isConnected
    ? "Connect to IRC to download"
    : pending
    ? "Waiting for the server to send this book"
    : blocked
    ? "Another download is in progress"
    : completed
    ? "File received. Download another copy"
    : failed
    ? "The download did not finish. Try again"
    : "Download this book";
  return (
    <Tooltip label={hint}>
      <span>
        <Button
          size="xs"
          compact
          radius="sm"
          loading={pending}
          disabled={blocked}
          color={completed ? "teal" : "brand"}
          variant={completed ? "light" : "filled"}
          leftIcon={completed ? <Check size={13} /> : undefined}
          onClick={() => dispatch(sendDownload(book))}
          sx={{ width: 132, fontWeight: 500 }}>
          {pending
            ? "Downloading..."
            : completed
            ? "Download again"
            : failed
            ? "Retry download"
            : "Download"}
        </Button>
      </span>
    </Tooltip>
  );
}
