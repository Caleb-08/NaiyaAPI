import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { httpErrorException } from '../../core/services/utility.service';
import { StoreService } from '../store/store.service';

@Injectable()
export class UsersService {
  constructor(
    private prisma: PrismaService,
    private storeService: StoreService,
  ) {}

  async getAllRegisteredUsers(req: any): Promise<any> {
    if (!req.user?.isAdmin) {
      httpErrorException('You are not Authorised to view all users');
    }
    return this.prisma.user.findMany({
      where: {
        isAdmin: false,
      },
      select: {
        id: true,
        email: true,
        phoneNumber: true,
        name: true,
        itFavorite: true,
        isAdmin: true,
        createdAt: true,
        updatedAt: true,
      },
    });
  }

  async getAllAdminUsers(req: any): Promise<any> {
    if (!req.user?.isAdmin) {
      httpErrorException('You are not Authorised to view all users');
    }
    return this.prisma.user.findMany({
      where: {
        isAdmin: true,
      },
      select: {
        id: true,
        email: true,
        phoneNumber: true,
        name: true,
        isAdmin: true,
        createdAt: true,
        updatedAt: true,
      },
    });
  }

  async deleteAdminUserById(req: any, id: string): Promise<any> {
    // Check if user is authorized
    if (!req.user?.isAdmin) {
      httpErrorException('You are not authorized to delete admin users');
    }

    // Verify that the ID is valid
    if (!id || !/^[0-9a-fA-F]{24}$/.test(id)) {
      httpErrorException('Invalid user ID');
    }

    // Check if user exists
    const user = await this.prisma.user.findUnique({
      where: { id },
    });
    if (!user) {
      httpErrorException('User with the provided ID does not exist');
    }

    // Ensure the user is an admin
    if (!user.isAdmin) {
      httpErrorException('You can only delete admin users');
    }

    // Delete the user
    await this.prisma.user.delete({
      where: { id },
    });

    // Return a success message
    return {
      message: `Admin user with Name ${user.name} successfully deleted`,
    };
  }

  async banRegisteredUserById(req: any, id: string): Promise<any> {
    if (!req.user?.isAdmin) {
      httpErrorException('You are not authorized to delete admin users');
    }

    // Verify that the ID is valid
    if (!id || !/^[0-9a-fA-F]{24}$/.test(id)) {
      httpErrorException('Invalid user ID');
    }

    const user = await this.prisma.user.findUnique({
      where: { id },
    });
    if (!user) {
      httpErrorException('User with the provided ID does not exist');
    }

    if (user.isAdmin) {
      httpErrorException('User is not registered on Naiya');
    }

    const allUserStores = await this.storeService.getAllUserStoresByUserId(id);

    await Promise.all(
      allUserStores.map((store: any) =>
        this.storeService.deleteStoreAndAllItAds(store.id),
      ),
    );
    await this.prisma.user.delete({
      where: { id },
    });

    return {
      message: `User with Name ${user.name} successfully Ban from Naiya`,
    };
  }

  async unbanRegisteredUserById(req: any, id: string): Promise<any> {
    if (!req.user?.isAdmin) {
      httpErrorException('You are not authorized to unban users');
    }

    // Verify that the ID is valid
    if (!id || !/^[0-9a-fA-F]{24}$/.test(id)) {
      httpErrorException('Invalid user ID');
    }

    const user = await this.prisma.user.findUnique({
      where: { id },
    });
    if (!user) {
      httpErrorException('User with the provided ID does not exist');
    }

    if (!user.isUserBan) {
      httpErrorException('User is not banned on Naiya');
    }

    const allUserStores = await this.storeService.getAllUserStoresByUserId(id);

    // Update user to set isUserBan to false
    await this.prisma.user.update({
      where: { id },
      data: {
        isUserBan: false,
      },
    });

    await Promise.all(
      allUserStores.map(async (store: any) => {
        await this.prisma.store.update({
          where: { id: store.id },
          data: {
            isDisabled: false,
          },
        });
      }),
    );

    return {
      message: `User with Name ${user.name} successfully unbanned on Naiya. Account and stores restored.`,
    };
  }

  async deleteRegisteredUserById(req: any, id: string): Promise<any> {
    if (!req.user?.isAdmin) {
      httpErrorException('You are not authorized to delete admin users');
    }

    // Verify that the ID is valid
    if (!id || !/^[0-9a-fA-F]{24}$/.test(id)) {
      httpErrorException('Invalid user ID');
    }

    const user = await this.prisma.user.findUnique({
      where: { id },
    });
    if (!user) {
      httpErrorException('User with the provided ID does not exist');
    }

    if (user.isAdmin) {
      httpErrorException('User is not registered on Naiya');
    }

    const allUserStores = await this.storeService.getAllUserStoresByUserId(id);

    await Promise.all(
      allUserStores.map((store) =>
        this.storeService.deleteStoreAndAllItAds(store.id),
      ),
    );
    await this.prisma.user.delete({
      where: { id },
    });

    return {
      message: `User with Name ${user.name} successfully deleted`,
    };
  }
}
