import { configureStore, createSlice, PayloadAction } from "@reduxjs/toolkit";
import { Discussion, Message } from "@/types/Discussion";

interface DiscussionState {
    discussions: Discussion[];
    currentDiscussion: Discussion | null;
}

const initialState: DiscussionState = {
    discussions: [],
    currentDiscussion: null,
};

const discussionSlice = createSlice({
    name: "discussions",
    initialState,
    reducers: {
        SET_DISCUSSIONS: (state, action: PayloadAction<Discussion[]>) => {
            state.discussions = action.payload;
        },
        UPDATE_DISCUSSION: (
            state,
            action: PayloadAction<{
                discussion_uuid: string;
                lastMessage: Message;
            }>
        ) => {
            const { discussion_uuid, lastMessage } = action.payload;
            const discussionIndex = state.discussions.findIndex(
                (d) => d.discussion_uuid === discussion_uuid
            );

            if (discussionIndex !== -1) {
                state.discussions[discussionIndex].discussion_messages.push(
                    lastMessage
                );
                state.discussions[discussionIndex].discussion_last_message =
                    lastMessage;

                // Si c'est la discussion courante, la mettre à jour aussi
                if (
                    state.currentDiscussion?.discussion_uuid === discussion_uuid
                ) {
                    state.currentDiscussion.discussion_messages.push(
                        lastMessage
                    );
                    state.currentDiscussion.discussion_last_message =
                        lastMessage;
                }
            }
        },
        SET_CURRENT_DISCUSSION: (
            state,
            action: PayloadAction<Discussion | null>
        ) => {
            state.currentDiscussion = action.payload;
        },
        MARK_MESSAGE_AS_READ: (
            state,
            action: PayloadAction<{
                discussion_uuid: string;
                message_uuid: string;
            }>
        ) => {
            const { discussion_uuid, message_uuid } = action.payload;
            const discussion = state.discussions.find(
                (d) => d.discussion_uuid === discussion_uuid
            );

            if (discussion) {
                const message = discussion.discussion_messages.find(
                    (m) => m.message_uuid === message_uuid
                );
                if (message) {
                    message.message_status = "read";
                }
            }

            if (state.currentDiscussion?.discussion_uuid === discussion_uuid) {
                const message =
                    state.currentDiscussion.discussion_messages.find(
                        (m) => m.message_uuid === message_uuid
                    );
                if (message) {
                    message.message_status = "read";
                }
            }
        },
        MARK_MESSAGES_AS_READ: (
            state,
            action: PayloadAction<{
                discussion_uuid: string;
                messages: string[];
            }>
        ) => {
            const { discussion_uuid, messages } = action.payload;
            const discussion = state.discussions.find(
                (d) => d.discussion_uuid === discussion_uuid
            );

            if (discussion) {
                discussion.discussion_messages.forEach((message) => {
                    if (messages.includes(message.message_uuid)) {
                        message.message_status = "read";
                    }
                });
            }

            if (state.currentDiscussion?.discussion_uuid === discussion_uuid) {
                state.currentDiscussion.discussion_messages.forEach(
                    (message) => {
                        if (messages.includes(message.message_uuid)) {
                            message.message_status = "read";
                        }
                    }
                );
            }
        },
    },
});

export const {
    SET_DISCUSSIONS,
    UPDATE_DISCUSSION,
    SET_CURRENT_DISCUSSION,
    MARK_MESSAGE_AS_READ,
    MARK_MESSAGES_AS_READ,
} = discussionSlice.actions;

export const store = configureStore({
    reducer: {
        discussions: discussionSlice.reducer,
    },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
