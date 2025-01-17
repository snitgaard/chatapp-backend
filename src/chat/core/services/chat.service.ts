import { Injectable } from '@nestjs/common';
import { ChatClient } from '../models/chat-client.model';
import { ChatMessage } from '../models/chat-message.model';
import { IChatService } from '../primary-ports/chat.service.interface';
import { InjectRepository } from '@nestjs/typeorm';
import { Client } from '../../../client.entity';
import { Repository } from 'typeorm';
import { Message } from '../../../message.entity';

@Injectable()
export class ChatService implements IChatService {
  allMessages: ChatMessage[] = [];
  clients: ChatClient[] = [];
  constructor(
    @InjectRepository(Client)
    private clientRepository: Repository<Client>,
    @InjectRepository(Message)
    private messageRepository: Repository<Message>,
  ) {}

  async getClient(id: string): Promise<ChatClient> {
        const clientDb = await  this.clientRepository.findOne({id: id})
        const chatClient: ChatClient = {
          id: clientDb.id,
          name: clientDb.name
        };
        return chatClient;
    }

  async newMessage(messageString: string, chatClientId: string): Promise<ChatMessage> {
    let message: Message = this.messageRepository.create();
    message.message = messageString;

    message.client = await this.clientRepository.findOne({id: chatClientId})
    message.date = Date.now();
    console.log("message", message);
    console.log("chatClientId", chatClientId);
    message = await this.messageRepository.save(message);

    return {message: message.message, chatClient: message.client, date: message.date };

  }

  async newClient(chatClient: ChatClient): Promise<ChatClient> {
    const chatClientFoundById = await this.clientRepository.findOne({id: chatClient.id});
    if(chatClientFoundById)
    {
      return JSON.parse(JSON.stringify(chatClientFoundById));
    }
    const chatClientFoundByName = await this.clientRepository.findOne({id: chatClient.name});
    if(chatClientFoundByName)
    {
      throw new Error("Name is already in use");
    }
    let client = this.clientRepository.create();
    client.name = chatClient.name;
    client = await this.clientRepository.save(client);
    const newChatClient = JSON.parse(JSON.stringify(client));
    this.clients.push(newChatClient);
    return newChatClient;
  }

  async getClients(): Promise<ChatClient[]> {
    const clients = await this.clientRepository.find();
    const chatClients: ChatClient[] = JSON.parse(JSON.stringify(clients));
    return chatClients;
  }

  async getMessages(): Promise<ChatMessage[]>{
    const messages = await this.messageRepository.find();
    const chatMessages: ChatMessage[] = JSON.parse(JSON.stringify(messages));
    return chatMessages;
  }

  async delete(id: string): Promise<void> {
    await this.clientRepository.delete({id: id});
    this.clients = this.clients.filter((c) => c.id !== id);
  }

  async updateTyping(typing: boolean, id: string): Promise<ChatClient> {
    const clients = await this.clientRepository.find();
    const chatClients: ChatClient[] = JSON.parse(JSON.stringify(clients));

    const chatClient = await chatClients.find((c) => c.id === id);
    if(chatClient && chatClient.typing !== typing) {
      chatClient.typing = typing;
      return chatClient
    }
  }
}
