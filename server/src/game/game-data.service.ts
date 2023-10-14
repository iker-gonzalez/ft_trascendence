import { Injectable, UnprocessableEntityException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { NewGameDataSetBodyDto } from './dto/new-game-data-set-body.dto';
import { FetchUserSessionsResponseDto } from './dto/fetch-user-sessions-response.dto';

@Injectable()
export class GameDataService {
  constructor(private readonly prisma: PrismaService) {}

  async createNewDataSet(
    newGameDataSetDto: NewGameDataSetBodyDto,
  ): Promise<any> {
    const { gameDataId, startedAt, elapsedTime, player } = newGameDataSetDto;

    // If session exists
    try {
      const gameDataSet = await this.prisma.gameDataSet.findFirstOrThrow({
        where: {
          sessionId: gameDataId,
        },
        include: {
          players: true,
        },
      });

      // Delete session players since it's not possible to upsert them
      await this.prisma.gameDataSetPlayer.deleteMany({
        where: {
          gameDataSetId: gameDataSet.id,
        },
      });

      const existingPlayers = gameDataSet.players.map((player) => {
        delete player.gameDataSetId;
        return player;
      });

      if (existingPlayers.length !== 1) {
        await this.prisma.gameDataSet.delete({
          where: {
            id: gameDataSet.id,
          },
        });

        throw new UnprocessableEntityException(
          'Number of players is not correct',
        );
      }

      const updatedGameDataSet = await this.prisma.gameDataSet.update({
        where: {
          id: gameDataSet.id,
        },
        data: {
          players: {
            create: [...existingPlayers, player],
          },
        },
        include: {
          players: true,
        },
      });

      return {
        created: 0,
        data: {
          sessionId: updatedGameDataSet.sessionId,
          id: updatedGameDataSet.id,
          startedAt: updatedGameDataSet.startedAt,
          elapsedTime: updatedGameDataSet.elapsedTime,
          players: updatedGameDataSet.players,
        },
      };
    } catch (e) {
      // If session doesn't exist, create it
      if (e.code === 'P2025') {
        const gameDataSet = await this.prisma.gameDataSet.create({
          data: {
            sessionId: gameDataId,
            startedAt,
            elapsedTime,
            players: {
              create: [player],
            },
          },
          include: {
            players: true,
          },
        });

        return {
          created: 1,
          data: {
            sessionId: gameDataSet.sessionId,
            id: gameDataSet.id,
            startedAt: gameDataSet.startedAt,
            elapsedTime: gameDataSet.elapsedTime,
            players: gameDataSet.players,
          },
        };
      } else if (e instanceof UnprocessableEntityException) {
        throw e;
      } else {
        throw new UnprocessableEntityException('Invalid data');
      }
    }
  }

  async fetchUserSessions(
    userId: number,
  ): Promise<FetchUserSessionsResponseDto> {
    const user = await this.prisma.user.findUnique({
      where: {
        intraId: +userId,
      },
    });

    if (!user) {
      throw new UnprocessableEntityException('User not found');
    }

    const userGameDataSets = await this.prisma.gameDataSet.findMany({
      where: {
        players: {
          some: {
            intraId: +userId,
          },
        },
      },
      include: {
        players: true,
      },
    });

    return {
      found: userGameDataSets.length,
      data: userGameDataSets.map((gameDataSet) => {
        return {
          sessionId: gameDataSet.sessionId,
          startedAt: gameDataSet.startedAt,
          elapsedTime: gameDataSet.elapsedTime,
          players: gameDataSet.players.map((player) => {
            delete player.gameDataSetId;
            delete player.id;
            return player;
          }),
        };
      }),
    };
  }
}
