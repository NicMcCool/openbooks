import {
  createAction,
  createAsyncThunk,
  createSlice,
  PayloadAction
} from "@reduxjs/toolkit";
import { addHistoryItem, HistoryItem, updateHistoryItem } from "./historySlice";
import { MessageType, SearchResponse } from "./messages";
import { AppDispatch, RootState } from "./store";

interface AppState {
  isConnected: boolean;
  isConnecting: boolean;
  connectionError?: string;
  pendingSearchTimestamp: number | null;
  isSidebarOpen: boolean;
  activeItem: HistoryItem | null;
  username?: string;
  inFlightDownloads: string[];
  completedDownloads: string[];
  failedDownloads: string[];
}
const loadActive = (): HistoryItem | null => {
  try {
    return JSON.parse(localStorage.getItem("active")!) ?? null;
  } catch {
    return null;
  }
};
const initialState: AppState = {
  isConnected: false,
  isConnecting: false,
  pendingSearchTimestamp: null,
  isSidebarOpen: true,
  activeItem: loadActive(),
  username: undefined,
  inFlightDownloads: [],
  completedDownloads: [],
  failedDownloads: []
};
const interruptRequests = (state: AppState) => {
  state.pendingSearchTimestamp = null;
  state.failedDownloads = [
    ...new Set([...state.failedDownloads, ...state.inFlightDownloads])
  ];
  state.inFlightDownloads = [];
};
const stateSlice = createSlice({
  name: "state",
  initialState,
  reducers: {
    setActiveItem(state, action: PayloadAction<HistoryItem | null>) {
      state.activeItem = action.payload;
    },
    connectionStarted(state) {
      state.isConnecting = true;
      state.isConnected = false;
      state.connectionError = undefined;
      state.username = undefined;
      interruptRequests(state);
    },
    setConnectionState(state, action: PayloadAction<boolean>) {
      state.isConnected = action.payload;
      state.isConnecting = false;
      if (action.payload) state.connectionError = undefined;
      else {
        state.username = undefined;
        interruptRequests(state);
      }
    },
    connectionFailed(state, action: PayloadAction<string>) {
      state.isConnected = false;
      state.isConnecting = false;
      state.connectionError = action.payload;
      state.username = undefined;
      interruptRequests(state);
    },
    setPendingSearch(state, action: PayloadAction<number | null>) {
      state.pendingSearchTimestamp = action.payload;
    },
    setUsername(state, action: PayloadAction<string>) {
      state.username = action.payload;
    },
    addInFlightDownload(state, action: PayloadAction<string>) {
      if (!state.inFlightDownloads.includes(action.payload))
        state.inFlightDownloads.push(action.payload);
      state.failedDownloads = state.failedDownloads.filter(
        (book) => book !== action.payload
      );
      state.completedDownloads = state.completedDownloads.filter(
        (book) => book !== action.payload
      );
    },
    finishDownload(state, action: PayloadAction<boolean>) {
      const book = state.inFlightDownloads.shift();
      if (!book) return;
      if (action.payload) state.completedDownloads.push(book);
      else state.failedDownloads.push(book);
    },
    toggleSidebar(state) {
      state.isSidebarOpen = !state.isSidebarOpen;
    }
  }
});
const connect = createAction("socket/connect");
const sendMessage = createAction("socket/send_message", (message: any) => ({
  payload: { message: JSON.stringify(message) }
}));
// The server does not attach request IDs to download responses. One transfer
// at a time keeps completion/error feedback tied to the correct book.
const sendDownload = createAsyncThunk<void, string, { state: RootState }>(
  "state/send_download",
  (book, { dispatch }) => {
    dispatch(addInFlightDownload(book));
    dispatch(sendMessage({ type: MessageType.DOWNLOAD, payload: { book } }));
  },
  {
    condition: (_, { getState }) =>
      getState().state.isConnected &&
      getState().state.inFlightDownloads.length === 0
  }
);
const sendSearch = createAsyncThunk<void, string, { state: RootState }>(
  "state/send_sendSearch",
  (queryString, { dispatch }) => {
    const timestamp = new Date().getTime();
    dispatch(setPendingSearch(timestamp));
    dispatch(addHistoryItem({ query: queryString, timestamp }));
    dispatch(setActiveItem({ query: queryString, timestamp }));
    dispatch(
      sendMessage({ type: MessageType.SEARCH, payload: { query: queryString } })
    );
  },
  {
    condition: (_, { getState }) =>
      getState().state.isConnected &&
      getState().state.pendingSearchTimestamp === null
  }
);
const setSearchResults = createAsyncThunk<
  Promise<void>,
  SearchResponse,
  { dispatch: AppDispatch; state: RootState }
>(
  "state/set_search_results",
  async ({ books, errors }, { dispatch, getState }) => {
    const state = getState();
    const timestamp = state.state.pendingSearchTimestamp;
    const pending = state.history.items.find(
      (item) => item.timestamp === timestamp
    );
    dispatch(setPendingSearch(null));
    if (!pending) return;
    const updatedItem: HistoryItem = {
      ...pending,
      results: books ?? [],
      errors: errors ?? []
    };
    dispatch(updateHistoryItem(updatedItem));
    // Browsing older history must not assign a pending search's response to it.
    if (state.state.activeItem?.timestamp === timestamp)
      dispatch(setActiveItem(updatedItem));
  }
);
export const {
  setActiveItem,
  setConnectionState,
  connectionStarted,
  connectionFailed,
  setPendingSearch,
  setUsername,
  addInFlightDownload,
  finishDownload,
  toggleSidebar
} = stateSlice.actions;
export {
  stateSlice,
  connect,
  sendMessage,
  sendDownload,
  sendSearch,
  setSearchResults
};
export default stateSlice.reducer;
