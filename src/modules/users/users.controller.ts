import {
  Controller,
  UseGuards,
  Get,
  Req,
  Param,
  Delete,
  Put,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { AuthGuard } from '@nestjs/passport';
import { ApiTags } from '@nestjs/swagger';

@ApiTags('Users')
@Controller('users')
export class UsersController {
  constructor(private readonly userService: UsersService) {}

  @UseGuards(AuthGuard('auth'))
  @Get('getAllUsers')
  getAllRegisteredUsers(@Req() req: any): Promise<any> {
    return this.userService.getAllRegisteredUsers(req);
  }

  @UseGuards(AuthGuard('auth'))
  @Get('getAllAdmins')
  getAllAdminUsers(@Req() req: any): Promise<any> {
    return this.userService.getAllAdminUsers(req);
  }

  @UseGuards(AuthGuard('auth'))
  @Delete('deleteAdminUserById/:id')
  deleteAdminUserById(@Req() req: any, @Param('id') id: string): Promise<any> {
    return this.userService.deleteAdminUserById(req, id);
  }

  @UseGuards(AuthGuard('auth'))
  @Put('banRegisteredUserById/:id')
  banRegisteredUserById(
    @Req() req: any,
    @Param('id') id: string,
  ): Promise<any> {
    return this.userService.banRegisteredUserById(req, id);
  }

  @UseGuards(AuthGuard('auth'))
  @Put('unbanRegisteredUserById/:id')
  unbanRegisteredUserById(
    @Req() req: any,
    @Param('id') id: string,
  ): Promise<any> {
    return this.userService.unbanRegisteredUserById(req, id);
  }

  @UseGuards(AuthGuard('auth'))
  @Delete('deleteRegisteredUserById/:id')
  deleteRegisteredUserById(
    @Req() req: any,
    @Param('id') id: string,
  ): Promise<any> {
    return this.userService.deleteRegisteredUserById(req, id);
  }
}
