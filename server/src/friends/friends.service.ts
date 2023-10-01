import {
  BadRequestException,
  ConflictException,
  Injectable,
} from '@nestjs/common';
import { Prisma, User } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { GetFriendsResponseDto } from './dto/get-friends-response.dto';

@Injectable()
export class FriendsService {
  constructor(private readonly prisma: PrismaService) {}

  async addFriend(friendIntraId: number, user: User): Promise<any> {
    if (friendIntraId === user.intraId) {
      throw new BadRequestException('You cannot add yourself as a friend');
    }

    const friend = await this.prisma.user.findUnique({
      where: {
        intraId: friendIntraId,
      },
      include: {
        friends: true,
      },
    });

    if (!friend) {
      throw new BadRequestException('Friend not found');
    }

    const { friends: userFriends } = await this.prisma.user.findUnique({
      where: {
        id: user.id,
      },
      include: {
        friends: true,
      },
    });

    // Delete all user friends
    await this.prisma.friend.deleteMany({
      where: {
        userId: user.id,
      },
    });

    let updatedUser;
    try {
      updatedUser = await this.prisma.user.update({
        where: {
          id: user.id,
        },
        data: {
          friends: {
            create: [
              ...userFriends.map((friend) => {
                return {
                  intraId: friend.intraId,
                  avatar: friend.avatar,
                  username: friend.username,
                  email: friend.email,
                };
              }),
              {
                intraId: friend.intraId,
                avatar: friend.avatar,
                username: friend.username,
                email: friend.email,
              },
            ],
          },
        },
        include: {
          friends: true,
        },
      });
    } catch (e) {
      if (
        e instanceof Prisma.PrismaClientKnownRequestError &&
        e.code === 'P2002'
      )
        throw new ConflictException('Friend already added');
      throw e;
    }

    return {
      created: 1,
      data: {
        id: user.id,
        intraId: user.intraId,
        friends: updatedUser.friends.map((friend) => {
          return {
            intraId: friend.intraId,
            avatar: friend.avatar,
          };
        }),
      },
    };
  }

  async getFriends(
    intraId: number,
    user: User,
  ): Promise<GetFriendsResponseDto> {
    const userWithFriends = await this.prisma.user.findUnique({
      where: {
        intraId: intraId ? intraId : user.intraId,
      },
      include: {
        friends: true,
      },
    });

    if (!userWithFriends) {
      throw new BadRequestException('User not found');
    }

    return {
      found: userWithFriends.friends.length,
      data: {
        id: userWithFriends.id,
        intraId: userWithFriends.intraId,
        friends: userWithFriends.friends,
      },
    };
  }

  async deleteFriend(friendIntraId: number, user: User): Promise<any> {
    const userData = await this.prisma.user.findUnique({
      where: {
        id: user.id,
      },
      include: {
        friends: true,
      },
    });

    const isValidFriend = userData.friends.some(
      (friend) => friend.intraId === friendIntraId,
    );

    if (!isValidFriend) {
      throw new BadRequestException('Friend not found');
    }

    const updatedFriends = userData.friends.filter(
      (friend) => friend.intraId !== friendIntraId,
    );

    // To avoid errors with prisma, we need to delete the userId field
    updatedFriends.forEach((friend) => {
      delete friend.userId;
    });

    await this.prisma.friend.deleteMany({
      where: {
        userId: user.id,
      },
    });

    const updatedUser = await this.prisma.user.update({
      where: {
        id: user.id,
      },
      data: {
        friends: {
          create: updatedFriends,
        },
      },
      include: {
        friends: true,
      },
    });

    return {
      deleted: 1,
      data: {
        id: updatedUser.id,
        intraId: updatedUser.intraId,
        friends: updatedUser.friends,
      },
    };
  }
}
