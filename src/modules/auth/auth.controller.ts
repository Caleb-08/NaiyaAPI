import {
  Body,
  Controller,
  ForbiddenException,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { ContinueWithGoogle, LoginDTO, RegisterDTO } from "./dto";
import { AuthGuard } from '@nestjs/passport';
import { ApiTags } from "@nestjs/swagger";

@ApiTags('Authentication')
@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('register')
  register(@Body() userData: RegisterDTO) {
    delete userData.isAdmin; // To ensure users won't create admin from this route
    return this.authService.register(userData);
  }

  @Post('continueWithGoogle')
  continueWithGoogle(@Body() jwtToken: ContinueWithGoogle) {
    return this.authService.continueWithGoogle(jwtToken.googleJWTToken);
  }

  @UseGuards(AuthGuard('auth'))
  @Post('adminRegistration')
  registerAdmin(@Body() userData: RegisterDTO, @Req() req: any): Promise<any> {
    console.log(req.user?.isAdmin);
    if (req.user?.isAdmin) {
      userData.isAdmin = true; // Ensure all users created from this route is an admin
      return this.authService.register(userData);
    } else {
      throw new ForbiddenException('You can not create this user');
    }
  }

  @Post('login')
  login(@Body() loginData: LoginDTO) {
    return this.authService.login(loginData);
  }

  @Post('refresh')
  async refreshToken(@Body() data: any) {
    return this.authService.refreshToken(data.refreshToken);
  }

  @Post('adminLogin')
  adminLogin(@Body() loginData: LoginDTO) {
    return this.authService.adminLogin(loginData);
  }

  @Post('forgetPassword')
  sendForgetPasswordEmail(@Body('email') email: string) {
    return this.authService.sendForgetPasswordEmail(email);
  }

  @Post('resetPassword')
  async resetPassword(
    @Body('email') email: string,
    @Body('newPassword') newPassword: string,
    @Body('refreshToken') refreshToken: string,
  ) {
    return this.authService.resetPassword(email, newPassword, refreshToken);
  }
}
