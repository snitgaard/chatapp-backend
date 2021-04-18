import {
  ConnectedSocket,
  MessageBody,
  OnGatewayConnection, OnGatewayDisconnect,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Socket } from 'socket.io';
import { WelcomeDto } from '../dto/welcome.dto';
import { IChatService, IChatServiceProvider } from '../../core/primary-ports/chat.service.interface';
import { Inject } from '@nestjs/common';
import { JoinChatDto } from '../dto/join-chat.dto';
import { ChatClient } from '../../core/models/chat-client.model';

@WebSocketGateway()
export class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect {
  constructor(@Inject(IChatServiceProvider) private chatService: IChatService)
  {}
  @WebSocketServer() server;

  @SubscribeMessage('message')
  async handleChatEvent(
    @MessageBody() message: string,
    @ConnectedSocket() client: Socket,
    ): Promise<void> {
    const chatMessage = await this.chatService.newMessage(message, client.id);
    this.server.emit('newMessage', chatMessage);
  }

  @SubscribeMessage('typing')
  async handleTypingEvent(
    @MessageBody() typing: boolean,
    @ConnectedSocket() client: Socket,
  ): Promise<void> {
    console.log('typing', typing);
    const chatClient = await this.chatService.updateTyping(typing, client.id);
    if(chatClient) {
      this.server.emit('clientTyping', chatClient);
    }
  }

  @SubscribeMessage('joinChat')
  async handleJoinChatEvent(
    @MessageBody() joinChatClientDto: JoinChatDto,
    @ConnectedSocket() client: Socket,
  ): Promise<void> {
    try {
      let chatClient: ChatClient = JSON.parse(JSON.stringify(joinChatClientDto));
      chatClient = await this.chatService.newClient(chatClient);
      const chatClients = await this.chatService.getClients();
      const welcome: WelcomeDto = {
        clients: chatClients,
        messages: await this.chatService.getMessages(),
        client: chatClient
      };
      client.emit('welcome', welcome)
      this.server.emit('clients', chatClients);
    }
    catch (e) {
      client.error(e.message);
    }
  }

  /*@SubscribeMessage('clientConnect')
  async handleClientConnect(
    @MessageBody() id: string,
    @ConnectedSocket() client: Socket,
  ): Promise<void> {
    if(id) {
      const clientFound = await this.chatService.getClient(id);
      if(clientFound)
      {
        const chatClients = await this.chatService.getClients();
        const welcome: WelcomeDto = {
          clients: chatClients,
          messages: await this.chatService.getMessages(),
          client: clientFound
        };
        client.emit('welcome', welcome)
        this.server.emit('clients', chatClients);
      }
      else {
        client.emit('error', 'Client Not Found');
      }
    }
  }*/

  async handleConnection(client: Socket, ...args: any[]): Promise<any> {
    console.log('Client connect:', client.id);
    client.emit("allMessages", this.chatService.getMessages());
    this.server.emit('clients', await this.chatService.getClients());
  }

  async handleDisconnect(client: Socket): Promise<any> {
    await this.chatService.delete(client.id);
    this.server.emit('clients', await this.chatService.getClients());
    console.log('Client disconnect:', client.id);
  }
}

