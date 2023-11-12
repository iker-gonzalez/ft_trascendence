import {
    Controller,
    Get,
    Param,
  } from '@nestjs/common';

  import {
    ApiBadRequestResponse,
    ApiConflictResponse,
    ApiNotFoundResponse,
    ApiOkResponse,
    ApiOperation,
    ApiParam,
    ApiTags,
    ApiUnauthorizedResponse,
  } from '@nestjs/swagger';
import { ChatDMService } from './service/chatDM.service';
import { swaggerConstants } from 'config/swagger.constants';
import { ChatChannelService } from './service/chatChannel.service';
import { AllUsersDMWithDTO } from './dto/all-users-DM-with.dto';
import { ConversationMessageDTO } from './dto/conversation-message.dto';
import { AllExistingChannelsDTO } from './dto/all-existing-channel.dto';
import { AllUserChannelInDTO } from './dto/all-user-channel-in.dto';

@ApiTags('Chat')
@Controller('chat')
export class ChatController {
    constructor(
      private readonly chatDMService: ChatDMService,
      private readonly chatChannelService: ChatChannelService
      ) 
    {    }
    /********************************************************** */
    //                         DM                               //
    /********************************************************** */
    @Get(':userId1/:userId2/DM') // Define la ruta para los parámetros userId1 y userId2
    @ApiParam({ name: 'userId1' }) 
    @ApiParam({ name: 'userId2' }) 
    @ApiOperation({
      summary: swaggerConstants.chat.data.summary, 
    })
    @ApiOkResponse({
      description: swaggerConstants.chat.data.ok.description,
      type: ConversationMessageDTO,
    })
    async getDMBetweenUsers(
      @Param('userId1') userIntraId1: string,
      @Param('userId2') userIntraId2: string
    ) : Promise<ConversationMessageDTO[]> {  
      console.log("getDMBetweenUsers get");
      try{
        const userId1 = await this.chatDMService.findUserIdByIntraId(parseInt(userIntraId1, 10));
        const userId2 = await this.chatDMService.findUserIdByIntraId(parseInt(userIntraId2, 10));
        return this.chatDMService.getDMBetweenUsers(userId1, userId2);
      }
      catch (error) { 
          console.error("Error:", error); 
      }
    }  
 
    @Get(':userId/DM') // Define una nueva ruta para el método getAllUserDMWith
    @ApiParam({ name: 'userId' }) 
    @ApiOperation({
      summary: swaggerConstants.chat.all.summary,
    })
    @ApiOkResponse({
      description: swaggerConstants.chat.all.ok.description,
      type: AllUsersDMWithDTO,
    })
    async getAllUserDMWith(
      @Param('userId') userIntraId: string
      ):Promise<any[]> {
      const userId = await this.chatDMService.findUserIdByIntraId(parseInt(userIntraId, 10));

      console.log("getAllUserDMWith get");
      console.log(userId);
        try{
        return this.chatDMService.getAllUserDMWith(userId);
      } 
        catch (error) {
            console.error("Error:", error);
        }
    }

    /********************************************************** */
    //                    CHANNEL                               //
    /********************************************************** */

    @Get('/allExistingChannel') 
    @ApiOperation({
      summary: swaggerConstants.chat.allExistingChannel.summary,
    })
    @ApiOkResponse({
      description: swaggerConstants.chat.allExistingChannel.ok.description,
      type: AllExistingChannelsDTO,
    })
    async getAllExistingChannels(

      ):Promise<any[]> {

      console.log("getAllExistingChannels get");

      try{
        return this.chatChannelService.getAllExistingChannels();
      }
      catch (error) {
          console.error("Error:", error);
      }
    }

    @Get(':userIntra/CM') 
    @ApiParam({ name: 'userIntra' }) 
    @ApiOperation({
      summary: swaggerConstants.chat.allUserChannelIn.summary,
    })
    @ApiOkResponse({
      description: swaggerConstants.chat.allUserChannelIn.ok.description,
      type: AllUserChannelInDTO,
    })
    async getAllUserChannelIn(
      @Param('userIntra') userIntraId: string
      ):Promise<any[]> {

      console.log("getAllUserChannelIn get");
      console.log(userIntraId);
      
      try{
        const userId = await this.chatDMService.findUserIdByIntraId(parseInt(userIntraId, 10));
        return this.chatChannelService.getAllUserChannelIn(userId);
      }
      catch (error) {
          console.error("Error:", error);
      }
    }
   
   
    @Get(':roomName/allChannel') 
    @ApiParam({ name: 'roomName' })
    @ApiOperation({
      summary: swaggerConstants.chat.channelMess.summary,
    })
    @ApiOkResponse({
      description: swaggerConstants.chat.data.ok.description,
      type: ConversationMessageDTO,
    })
    async getMessageInRoom( 
      @Param('roomName') roomName: string,
    ) : Promise<ConversationMessageDTO[]> { 
      console.log("getMessageInRoom get");
      try{
        return this.chatChannelService.getMessageInRoom(roomName);
      }
      catch (error) {
          console.error("Error:", error);
      }
    }  
}