import {
    Controller,
    Delete,
    Get,
    HttpCode,
    HttpStatus,
    Param,
    Post,
    UseGuards,
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
import { ChatService } from './chat.service';
import { swaggerConstants } from 'config/swagger.constants';

@ApiTags('Chat')
@Controller('chat')
export class ChatController {
    constructor(private readonly chatService: ChatService) 
    {    }
    
    @Get(':userId1/:userId2') // Define la ruta para los parámetros userId1 y userId2
    @ApiParam({ name: 'userId1' }) 
    @ApiParam({ name: 'userId2' }) 
    @ApiBadRequestResponse({
        description: swaggerConstants.friends.delete.bad.description,
      })
      @ApiUnauthorizedResponse({
        description: swaggerConstants.friends.delete.unauthorized.description,
      })
    async getDMBetweenUsers(
      @Param('userId1') userId1: string,
      @Param('userId2') userId2: string
    ) : Promise<any[]> {
        return this.chatService.getDMBetweenUsers(userId1, userId2);

    }

    @Get('all/:userId') // Define una nueva ruta para el método getAllUserDMWith
    @ApiParam({ name: 'userId' }) 
    async getAllUserDMWith(@Param('userId') userId: string): Promise<any[]> {
        return this.chatService.getAllUserDMWith(userId);
    }
}