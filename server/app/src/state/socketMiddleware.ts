import { Middleware, MiddlewareAPI } from "@reduxjs/toolkit";
import { openbooksApi } from "./api";
import { deleteHistoryItem } from "./historySlice";
import {
  ConnectionResponse,
  DownloadResponse,
  MessageType,
  Notification,
  NotificationType,
  Response,
  SearchResponse
} from "./messages";
import { addNotification } from "./notificationSlice";
import {
  connect,
  connectionFailed,
  connectionStarted,
  finishDownload,
  sendMessage,
  setConnectionState,
  setPendingSearch,
  setSearchResults,
  setUsername
} from "./stateSlice";
import { AppDispatch, RootState } from "./store";
import { displayNotification, downloadFile } from "./util";

export const websocketConn =
  (wsUrl: string): Middleware =>
  ({ dispatch, getState }: MiddlewareAPI<AppDispatch, RootState>) => {
    let socket: WebSocket | null = null;
    let generation = 0;
    let timeout: ReturnType<typeof setTimeout> | undefined;
    const clearTimeoutHandle = () => {
      if (timeout) clearTimeout(timeout);
      timeout = undefined;
    };
    const retire = (old: WebSocket | null) => {
      if (!old) return;
      old.onopen = old.onclose = old.onerror = old.onmessage = null;
      if (old.readyState !== WebSocket.CLOSED) old.close();
    };
    const fail = (message: string) => {
      generation++;
      clearTimeoutHandle();
      const old = socket;
      socket = null;
      retire(old);
      dispatch(connectionFailed(message));
    };
    const begin = () => {
      if (getState().state.isConnecting) return;
      const id = ++generation;
      const previous = socket;
      socket = null;
      clearTimeoutHandle();
      retire(previous);
      dispatch(connectionStarted());
      timeout = setTimeout(() => {
        if (id === generation)
          fail("Connection timed out. Check the server, then try again.");
      }, 30000);

      const open = () => {
        if (id !== generation) return;
        try {
          const current = new WebSocket(wsUrl);
          socket = current;
          current.onopen = () => {
            if (id !== generation) return;
            current.send(
              JSON.stringify({ type: MessageType.CONNECT, payload: {} })
            );
          };
          current.onerror = () => {
            if (id === generation)
              fail(
                "Unable to connect. Check the server and close other OpenBooks tabs, then try again."
              );
          };
          current.onclose = () => {
            if (id === generation)
              fail(
                "Connection closed. Check the server and close other OpenBooks tabs, then try again."
              );
          };
          current.onmessage = (event) => {
            if (id !== generation) return;
            let response: Response;
            try {
              response = JSON.parse(event.data);
            } catch {
              fail(
                "The server sent an unreadable response. Try connecting again."
              );
              return;
            }
            const notification: Notification = {
              ...response,
              timestamp: Date.now()
            };
            dispatch(addNotification(notification));
            displayNotification(notification);

            if (response.type === MessageType.CONNECT) {
              clearTimeoutHandle();
              dispatch(setUsername((response as ConnectionResponse).name));
              dispatch(setConnectionState(true));
              dispatch(openbooksApi.util.invalidateTags(["servers", "books"]));
            } else if (
              getState().state.isConnecting &&
              response.appearance === NotificationType.DANGER
            ) {
              fail(response.title);
            } else if (response.type === MessageType.SEARCH) {
              dispatch(setSearchResults(response as SearchResponse));
            } else if (response.type === MessageType.DOWNLOAD) {
              downloadFile((response as DownloadResponse).downloadPath);
              dispatch(finishDownload(true));
              dispatch(openbooksApi.util.invalidateTags(["books"]));
            } else if (response.type === MessageType.RATELIMIT) {
              const pending = getState().state.pendingSearchTimestamp;
              dispatch(setPendingSearch(null));
              if (pending !== null) dispatch(deleteHistoryItem(pending));
            } else if (
              response.type === MessageType.STATUS &&
              response.appearance === NotificationType.DANGER
            ) {
              // Legacy protocol reports operation failures by title, without IDs.
              if (response.title === "No results found for the query.") {
                dispatch(
                  setSearchResults({
                    ...response,
                    books: [],
                    errors: []
                  } as SearchResponse)
                );
              } else if (
                [
                  "Error when downloading search results.",
                  "Error when parsing search results."
                ].includes(response.title)
              ) {
                dispatch(setPendingSearch(null));
              } else if (
                [
                  "Error when downloading book.",
                  "Server is not available. Try another one."
                ].includes(response.title)
              ) {
                dispatch(finishDownload(false));
              }
            }
          };
        } catch {
          fail(
            "Unable to open a connection. Check the server, then try again."
          );
        }
      };
      // Allow the backend's single-client slot to be released on a manual reconnect.
      if (previous && previous.readyState !== WebSocket.CLOSED)
        setTimeout(open, 300);
      else open();
    };
    return (next) => (action) => {
      if (connect.match(action)) {
        begin();
        return next(action);
      }
      if (sendMessage.match(action)) {
        if (
          socket?.readyState === WebSocket.OPEN &&
          getState().state.isConnected
        )
          socket.send(action.payload.message);
        else
          displayNotification({
            appearance: NotificationType.WARNING,
            title: "Not connected to IRC. Use Connect to try again.",
            timestamp: Date.now()
          });
      }
      return next(action);
    };
  };
