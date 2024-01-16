import { ForbiddenException, Injectable, UnauthorizedException } from "@nestjs/common";
import { LoginDTO, RegisterDTO } from "./dto";
import { PrismaService } from "../../prisma/prisma.service";
import { hash, verify } from "argon2";
import { JwtService } from "@nestjs/jwt";
import { ConfigService } from "@nestjs/config";
import { httpErrorException } from "../../core/services/utility.service";
import { MailerService } from "@nestjs-modules/mailer";
import { EventEmitter2 } from "@nestjs/event-emitter";
import { LoginTicket, OAuth2Client } from "google-auth-library";

@Injectable()
export class AuthService {
  jwtService: any;
  constructor(
    private prisma: PrismaService,
    private jwt: JwtService,
    private config: ConfigService,
    private mailerService: MailerService,
    private eventEmitter: EventEmitter2,
  ) {}

  async register(userData: RegisterDTO): Promise<any> {
    const passwordHash = await hash(userData.password);

    const findUser = await this.prisma.user.findUnique({
      where: { email: userData.email },
    });

    if (findUser) {
      throw new ForbiddenException('Email already registered, try login in.');
    }

    if (userData.name.length > 20) {
      throw new ForbiddenException('Name can not be more than 20 characters');
    }

    try {
      let user = await this.prisma.user.create({
        data: {
          name: userData.name,
          email: userData.email,
          password: passwordHash,
          isAdmin: userData.isAdmin,
        },
      });
      delete user.password;
      delete user.isAdmin;
      delete user.refreshToken;
      const login = await this.login({
        email: userData.email,
        password: userData.password,
      });
      user = { ...user, ...login };
      return user;
    } catch (error) {
      httpErrorException(error);
    }
  }

  async continueWithGoogle(googleJWTToken: string): Promise<any> {
    const decodedToken = await this.verifyGoogleToken(googleJWTToken);
    try {
      const findUser = await this.prisma.user.findFirst({
        where: { email: decodedToken.email },
      });
      if (findUser === null) {
        return this.register({
          email: decodedToken.email,
          name: decodedToken.name,
          password: this.generateRandomPassword(5),
        });
      } else {
        return this.login(
          {
            email: decodedToken.email,
            password: '',
          },
          true,
        );
      }
    } catch (e) {
      console.log(e);
    }
  }

  generateRandomPassword(length: number) {
    const uppercaseChars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    const lowercaseChars = 'abcdefghijklmnopqrstuvwxyz';
    const numberChars = '0123456789';
    const specialChars = '!@#$%^&*()-=_+[]{}|;:,.<>?';

    const allChars =
      uppercaseChars + lowercaseChars + numberChars + specialChars;

    let password = '';

    for (let i = 0; i < length; i++) {
      const randomIndex = Math.floor(Math.random() * allChars.length);
      password += allChars.charAt(randomIndex);
    }

    return password;
  }
  async verifyGoogleToken(idToken: string): Promise<any> {
    const googleClientId = this.config.get('GOOGLE_CLIENT_ID');
    const client: OAuth2Client = new OAuth2Client(googleClientId);

    try {
      const ticket: LoginTicket = await client.verifyIdToken({
        idToken,
        audience: googleClientId,
      });

      return ticket.getPayload();
    } catch (error) {
      // Handle verification failure
      console.error('Google token verification failed:', error);
      throw new Error('Google token verification failed');
    }
  }

  async generateTokens(user: any): Promise<any> {
    delete user.password;
    delete user.isAdmin;
    delete user.updatedAt;
    delete user.refreshToken;
    const signToken = await this.jwt.signAsync(user, {
      expiresIn: '24h',
      secret: this.config.get('JWT_SECRET'),
    });
    const refreshToken = await this.jwt.signAsync(user, {
      expiresIn: '2days',
      secret: this.config.get('JWT_RefreshSecret'),
    });
    return {
      access_token: signToken,
      refresh_token: refreshToken,
    };
  }

  async login(loginData: LoginDTO, passwordlessLogin?: boolean) {
    let user: any;
    try {
      user = await this.prisma.user.findUnique({
        where: { email: loginData.email },
      });
    } catch (error) {
      throw new UnauthorizedException('User not found');
    }

    if (user?.isAdmin === true) {
      throw new ForbiddenException('You are not allowed to login here');
    }

    let isFavorite = false; // Initialize isFavorite as false

    if (user) {
      const password = await verify(user?.password, loginData.password);

      if (password || passwordlessLogin) {
        // Check if the user has a list of favorite ad IDs
        isFavorite =
          Array.isArray(user?.itFavorite) && user?.itFavorite.length > 0;

        const tokens = await this.generateTokens(user);
        await this.updateRefreshToken(user?.id, tokens.refresh_token);

        // Emit the UserLoginEvent when the user successfully logs in
        this.eventEmitter.emit('user?.login', user?.email);

        const currentDateAndTime = new Date();

        // Send the email to the user here using the MailerService
        // await this.mailerService.sendMail({
        //   from: 'test@softcode.ng',
        //   to: user?.email,
        //   subject: 'Login Successful',
        //   html: ` <p>Hello ${user?.email},</p>
        //
        //   <p>We're writing to confirm that a successful login was made to your account on Naiya at ${currentDateAndTime}.</p>
        //
        //   <p>If this login was made by you, no further action is needed. Your account is secure.</p>
        //
        //   <p>If you did not log in or believe this login was unauthorized, please take the following steps:</p>
        //
        //   <ol>
        //       <li>Change your password immediately by <a href='https://naiya-ng.web.app/auth/reset-pasword/${this.refreshToken}'></a>.</li>
        //       <li>Contact our support team at [Support Email Address] to report the unauthorized login.</li>
        //   </ol>
        //
        //   <p>We take the security of your account seriously and are here to assist you in any way we can.</p>
        //
        //   <p>Thank you for using Naiya.</p>
        //
        //   <p>Sincerely,<br>
        //   Naiya</p>`,
        // });

        // Return the isFavorite status along with tokens
        return {
          ...tokens,
          isFavorite,
          userName: user?.name,
          userId: user?.id,
        };
      } else {
        throw new ForbiddenException('Incorrect Password');
      }
    } else {
      throw new ForbiddenException('User Not found');
    }
  }

  async updateRefreshToken(userId: string, refreshToken: string) {
    const refreshTokenHash = await hash(refreshToken);

    await this.prisma.user.update({
      where: {
        id: userId,
      },
      data: {
        refreshToken: refreshTokenHash,
      },
    });
  }

  async refreshToken(refreshToken: string): Promise<any> {
    let userDetails: any;
    try {
      userDetails = await this.jwt.verifyAsync<any>(refreshToken, {
        secret: process.env.JWT_RefreshSecret,
      });
    } catch {
      httpErrorException('Your login session has timed out. Login again');
    }
    const user: any = await this.prisma.user.findUnique({
      where: {
        id: userDetails.id,
      },
    });

    if (!user.refreshToken) throw new ForbiddenException('Access Denied');

    const tokens = await this.generateTokens(user);
    await this.updateRefreshToken(user.id, tokens.refresh_token);
    return tokens;
  }

  async adminLogin(loginData: LoginDTO) {
    const user = await this.prisma.user.findUnique({
      where: { email: loginData.email },
    });

    if (!user) {
      throw new ForbiddenException('User Not found or not an admin');
    }

    if (user.isAdmin === true) {
      const password = await verify(user.password, loginData.password);

      if (password) {
        delete user.password;
        const signToken = await this.jwt.signAsync(user, {
          expiresIn: '2h',
          secret: this.config.get('JWT_SECRET'),
        });
        return {
          access_token: signToken,
        };
      } else {
        throw new ForbiddenException('Incorrect Password');
      }
    } else {
      throw new ForbiddenException('User Not found or not an admin');
    }
  }

  async registerAdmin(userData: RegisterDTO) {
    userData['isAdmin'] = true;
    let res: any;
    await this.register(userData).then((r) => {
      res = r;
    });
    return res;
  }

  async sendForgetPasswordEmail(email: string) {
    const user = await this.prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      throw new ForbiddenException('User not found');
    }

    const refreshToken = await this.jwt.signAsync(user, {
      expiresIn: '30m',
      secret: this.config.get('JWT_RefreshSecret'),
    });

    await this.updateRefreshToken(user.id, refreshToken);
    // Send the email with a link to reset the password
    await this.mailerService.sendMail({
      from: 'test@softcode.ng',
      to: email,
      subject: 'Password Reset Request',
      html: `
      <h1>You forgot your password</h1>
      <a href='https://naiya-ng.web.app/reset-password?token=${refreshToken}&email=${email}'>https://naiya-ng.web.app/auth/reset-pasword/${refreshToken}</a>
      `,
    });

    console.log('I am done');
  }

  async resetPassword(
    email: string,
    newPassword: string,
    refreshToken: string,
  ) {
    const user = await this.prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      throw new ForbiddenException('User not found');
    }

    const checkRefreshToken = await verify(user.refreshToken, refreshToken);

    if (!checkRefreshToken) throw new ForbiddenException('Access Denied');

    // Verify and hash the new password
    const newPasswordHash = await hash(newPassword);

    // Update the user's password
    await this.prisma.user.update({
      where: {
        email,
      },
      data: {
        password: newPasswordHash,
      },
    });

    // Send an email confirmation to the user
    await this.mailerService.sendMail({
      to: user.email,
      subject: 'Password Reset Successful',
      template: 'password-reset-success',
    });

    const tokens = await this.generateTokens(user);
    await this.updateRefreshToken(user.id, tokens.refresh_token);
    return tokens;
  }

  async getUserIdFromToken(token: string): Promise<string | null> {
    try {
      const decodedToken: any = this.jwtService.verify(token);
      // Assuming your JWT payload contains the user ID as 'sub'
      return decodedToken.sub;
    } catch (error) {
      throw new UnauthorizedException('Invalid token');
    }
  }
}
