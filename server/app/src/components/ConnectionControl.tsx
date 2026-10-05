import { ActionIcon, Button, Loader, Tooltip } from "@mantine/core";
import { Plugs } from "phosphor-react";
import { connect } from "../state/stateSlice";
import { useAppDispatch, useAppSelector } from "../state/store";

export default function ConnectionControl({
  compact = false
}: {
  compact?: boolean;
}) {
  const dispatch = useAppDispatch();
  const { isConnected, isConnecting, connectionError } = useAppSelector(
    (store) => store.state
  );
  const label = isConnecting
    ? "Connecting..."
    : isConnected
    ? "Reconnect"
    : connectionError
    ? "Retry connection"
    : "Connect";
  if (compact) {
    return (
      <Tooltip label={label}>
        <ActionIcon
          aria-label={label}
          disabled={isConnecting}
          onClick={() => dispatch(connect())}>
          {isConnecting ? <Loader size={16} /> : <Plugs size={20} />}
        </ActionIcon>
      </Tooltip>
    );
  }
  return (
    <Button
      size="xs"
      variant="light"
      loading={isConnecting}
      onClick={() => dispatch(connect())}
      leftIcon={<Plugs size={16} />}>
      {label}
    </Button>
  );
}
