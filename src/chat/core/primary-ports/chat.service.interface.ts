import { ChatMessage } from '../models/chat-message.model';
import { ChatClient } from '../models/chat-client.model';
export const IChatServiceProvider = 'IChatServiceProvider';
export interface IChatService {
  newMessage(message: string, chatClientId: string): Promise<ChatMessage>;

  newClient(chatClient: ChatClient): Promise<ChatClient>;

  getClients(): Promise<ChatClient[]>;

  /*getClient(id: string): Promise<ChatClient>;*/

  getMessages(): Promise<ChatMessage[]>;

  delete(id: string): Promise<void>;

  updateTyping(typing: boolean, id: string): Promise<ChatClient>;
}
