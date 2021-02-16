import { Injectable } from '@nestjs/common';
import { ChatClient } from '../chat-client.model';
import { ChatMessage } from '../chat-message.model';

@Injectable()
export class ChatService {
  allMessages: ChatMessage[] = [];
  userMap: ChatClient[] = [];

  newMessage(message: string, chatClientId: string): ChatMessage {
    const chatMessage: ChatMessage = {
      message,
      chatClient: this.userMap.find((c) => c.id === chatClientId),
      date: Date.now(),
    };
    this.allMessages.push(chatMessage);
    return chatMessage;
  }

  newClient(id: string, name: string): ChatClient {
    let chatClient = this.getClients().find
    ((c) => c.name === name && c.id === id);
    if(chatClient)
    {
      return chatClient;
    }
    if(this.getClients().find((c) => c.name == name))
    {
      throw new Error("Name is already in use");
    }
    chatClient = {id: id, name: name}
    this.userMap.push(chatClient)
    return chatClient;
  }

  getClients(): ChatClient[] {
    return this.userMap;
  }

  getMessages(): ChatMessage[]{
    return this.allMessages;
  }

  delete(id: string) {
    this.userMap = this.userMap.filter((c) => c.id !== id);
  }

  updateTyping(typing: boolean, id: string): ChatClient {
    const chatClient = this.getClients().find((c) => c.id === id);
    if(chatClient && chatClient.typing !== typing) {
      chatClient.typing = typing;
      return chatClient
    }
  }
}
