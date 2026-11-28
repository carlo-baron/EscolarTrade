import { create } from 'zustand';
import { ConversationType } from '@/schemas/conversation.schema';

interface ConversationState {
	conversationList: ConversationType[],
	setConversationList: (newList: ConversationType[]) => void;
}

const useAuthStore = create<ConversationState>()((set) => ({
	conversationList: [],
	setConversationList: (newList) => set(() => ({ conversationList: newList }))
}));

export const useConversationList = () => useAuthStore(state => state.conversationList);
export const useSetConversationList = () => useAuthStore(state => state.setConversationList);
