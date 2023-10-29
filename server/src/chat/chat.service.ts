import { BadRequestException, Injectable } from '@nestjs/common';
import { User } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { GetDirectMessageDto } from './dto/get-direct-message.dto';
import { AddMessageToUserDto } from './dto/add-message.dto';
import { UserService } from 'src/user/user.service';

@Injectable()
export class ChatService {
  constructor(private readonly prisma: PrismaService) {}
  
  async getUser(clientId: string) 
  {
    let userData: User; 
    try {
      userData = await this.prisma.user.findUniqueOrThrow({
        where: { id: clientId },
        include : { sentMessages : true},
      });  }
      catch (error) {
           console.log( "erorr");
           return;
        };
      return {
        created: 1, 
        data : {
          id: userData.id,
        }
      }  
  }

  async getDMUsers(userId1: string, userId2: string):
    Promise<any[]>
  {
    const conversationMessages = await this.prisma.directMessage.findMany({
      where: {
        OR: [
          {
            senderId: userId1,
            receiverId: userId2,
          },
          {
            senderId: userId2,
            receiverId: userId1,
          },
        ],
      },
      orderBy: {
        createdAt: 'asc', // Ordenar por fecha de creación de forma ascendente
      },
    });
    return conversationMessages;
  }

  async getMessagesByUser(
    intraId: string,
    ): Promise<any[]> 
  {
    const userWithMessage = await this.prisma.user.findUnique({
      where: { intraId: parseInt(intraId, 10)},
      include: {
       sentMessages: true,
       receivedMessages: true,
      },
    });

    if (!userWithMessage) {
      throw new BadRequestException('User with ID ${id} not found');
    }

    const sentMessages = userWithMessage.sentMessages || [];
    const receivedMessages = userWithMessage.receivedMessages || [];

    // Join sended and received messages.
    const allMessages = [...sentMessages, ...receivedMessages];

    return allMessages;
  }

  async findUserIdByIntraId(intraId: number): Promise<string>
  {
    const user = await this.prisma.user.findUnique({
      where: {
        intraId: intraId,
      },
    });

    return user ? user.id : null;
  }


  async addMessageToUser(
    senderIntraId: string,
    receiverIntraId: string,
    content: string
  ): Promise<void> 
  {
    const idSender = this.findUserIdByIntraId(parseInt(senderIntraId, 10));
    const idReceiver = this.findUserIdByIntraId(parseInt(receiverIntraId, 10));
    try {
      const userSenderId = await idSender;
      console.log("userSenderId");
      console.log(userSenderId);

      const userReceiverId = await idReceiver;
      console.log("userReceiverId");
      console.log(userReceiverId);
 
      const existingMessage = await this.prisma.directMessage.findUnique({
        where: { id: userSenderId },
      });  
      
      if (!existingMessage || existingMessage) {

        console.log("exisingMessage");

        // El registro no se encontró, así que créalo
        const newMessage = await this.prisma.directMessage.create({
          data: {
            senderId: userSenderId,
            receiverId: userReceiverId,
            content: content,
          },
        });
        // El nuevo mensaje ha sido creado
      } else {
        //por aqui no esntra, lo tengo para un futuro si es necesario
        // El registro ya existe, simplemente actualízalo
        const updatedMessage = await this.prisma.directMessage.update({
          where: { id: userSenderId},
          data: {
            senderId: userSenderId,
            receiverId: userReceiverId,
            content: content,
          },
        });
        // El mensaje existente ha sido actualizado
      }
  }
    catch(e)
    {
      throw new BadRequestException(e);
    }

   };
  }






