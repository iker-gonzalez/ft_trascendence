import { ChatRoom, ChatRoomUser, User } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { GetDirectMessageDto } from './../dto/get-direct-message.dto';
import { AddMessageToUserDto } from './../dto/add-message.dto';
import { UserService } from '../../user/user.service';
import { BadRequestException, Injectable } from '@nestjs/common';

@Injectable()
export class ChatChannelService {
  constructor(private readonly prisma: PrismaService) {
  }
  /********************************************************** */
  //                     END POINT GETTER                     //
  /********************************************************** */
    // Get all the DM conversation the user had had with other users
    async getAllUserChannelIn(userId: string):
    Promise<any[]>
  {
    if (userId == null)
      throw new BadRequestException('User Id not found in DB');

      const userChatRooms = await this.prisma.chatRoomUser.findMany({
        where: {
          userId: userId, // El ID del usuario del que deseas encontrar los ChatRooms
        },
        select: {
          room: {
            select: {
              name: true,
              // Otros campos de ChatRoom que desees incluir
            },
          },
        },
      });
  
      if (userChatRooms) {
        const chatRooms = userChatRooms.map((entry) => entry.room);
        return chatRooms;
      }

      return [];
  }

  async getMessageInRoom(roomName: string):
  Promise<any[]>
  {
    if (roomName == null)
      throw new BadRequestException('User Id not found in DB');
  
      const chatRoom = await this.prisma.chatRoom.findFirst({
        where: {
          name: roomName,
        },
      });
      if (!chatRoom)
       {
        // La sala de chat con el nombre especificado no fue encontrada
        throw new BadRequestException('roomName not found in DB');
      }
    
      const conversations = await this.prisma.chatMessage.findMany({
        where: {
          roomId: chatRoom.id,
        },
        select: {
          content: true,
          createdAt: true,
          sender: {
            select: {
              username: true,
              avatar: true,
              connectStatus: true,
            },
          },
        },
        orderBy: {
          createdAt: 'asc',
        },
      });
      
      // El objeto `conversations` contendrá todas las conversaciones relacionadas con el canal, incluyendo el contenido de los mensajes
    
    return conversations;
  }



  /********************************************************** */
  //                     CHANEL FUNCIONALITY                  //
  /********************************************************** */
  async channelExist(
    channelName: string,
  ) :  Promise<boolean> 
  {
    try
    { 
      if (!channelName)
      throw new BadRequestException('channelName cannot be null');

      const foundChatRoom = await this.prisma.chatRoom.findFirst({
        where: { name: channelName,
        },
      });
      if (!foundChatRoom)
        return false;
      else
        return true;
    }
    catch(e)
    {
      throw new BadRequestException(e);
    }
  } 

  
  async createChannel(
    adminId: string,
    channelName: string,
    access: string
  ): Promise<void> 
  {
    try{
        if (!adminId)
        throw new BadRequestException('adminId does not exist in DB');

      // Crear el Channel
      await this.prisma.chatRoom.create({
          data:{
            name: channelName
          }
        })
    }
    catch(e)
    {
      throw new BadRequestException(e);
    }

   };

   async addUserToChannel(
    userIdToAdd: string,
    channelName: string,
  ): Promise<void> 
  {
    try{
        if (!userIdToAdd)
        throw new BadRequestException('adminId does not exist in DB');

      // Crear el Channel
      const foundChatRoom = await this.prisma.chatRoom.findFirst({
        where: { name: channelName,
        },
        include:{
          users:true,
        },
      });
      if (!foundChatRoom)
        throw new BadRequestException("This chatRoom does not exist");

      // Buscar si ya esta en la Sala
      const existingChatRoomUser = await this.prisma.chatRoomUser.findFirst({
        where: {
          userId: userIdToAdd,
          roomId: foundChatRoom.id,
        },
      });

      //Si ya esta en el ChatRoom no hay que añadirlo
      if (existingChatRoomUser)
        return;
        
        console.log("foundCharRoom");
        console.log(foundChatRoom.users);
        console.log(foundChatRoom.id);
        
        // Añadir el usuario a la sala de chat
        const myharRoomUser = await this.prisma.chatRoomUser.create({
          data: {
            roomId: foundChatRoom.id,
            userId: userIdToAdd,
          },
        })
     
    }
    catch(e)
    {
      throw new BadRequestException(e);
    }

   };

   
   async addChannelMessageToUser(
    channelRoom: string,
    senderId: string,
    content: string
   ): Promise<void> 
   {
    if (!channelRoom || !senderId || !content)
    throw new BadRequestException ("channelRoom or senderId or content are null");

  // Get el Channel
    const foundChatRoom = await this.prisma.chatRoom.findFirst({
      where: { name: channelRoom,
      },
      include:{
        users:true,
      },
    });

    if (!foundChatRoom)
      throw new BadRequestException ("channelRoom not exist");

    // Buscar si ya esta en la Sala
    const existingChatRoomUser = await this.prisma.chatRoomUser.findFirst({
    where: {
      userId: senderId,
      roomId: foundChatRoom.id,
    },
    });

    if (!existingChatRoomUser)
      throw new BadRequestException ("user is not in the channel");

    const existingMessage = await this.prisma.chatMessage.create({
      data: 
      { 
        content: content,
        roomId:foundChatRoom.id,
        senderId:senderId, 
      },
    });  
    
}

async leaveUserFromChannel(
  channelRoom: string,
  userToLeaveId: string,
 ): Promise<void> 
 {
  if (!channelRoom || !userToLeaveId )
  throw new BadRequestException ("channelRoom or userToLeaveId or content are null");

  // Get el Channel
  const foundChatRoom = await this.prisma.chatRoom.findFirst({
    where: { name: channelRoom,
    },
    include:{
      users:true,
    },
  });

  if (!foundChatRoom)
  throw new BadRequestException ("channelRoom not exist");

 // Buscar si ya esta en la Sala
 const existingChatRoomUser = await this.prisma.chatRoomUser.findFirst({
  where: {
    userId: userToLeaveId,
    roomId: foundChatRoom.id,
  },
  });
   
  if (existingChatRoomUser)
  {
    await this.prisma.chatRoomUser.delete({
      where: {
        id: existingChatRoomUser.id,
      },
    });
  }
 }

  /********************************************************** */
  //                     ADMIN FUNCIONALITY                   //
  /********************************************************** */

  /********************************************************** */
  //                     ACCESS FUNCIONALITY                  //
  /********************************************************** */
}

