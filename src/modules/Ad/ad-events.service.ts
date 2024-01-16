import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { OnEvent } from '@nestjs/event-emitter';
import { MailerService } from '@nestjs-modules/mailer';

@Injectable()
export class AdEventsService {
  constructor(
    private prisma: PrismaService,
    private mailerService: MailerService,
  ) {}

  @OnEvent('ad.staledAdDeletedEmailMessage', { async: true })
  async staledAdDeletedEmailMessage(payload: any): Promise<any> {
    await this.mailerService.sendMail({
      from: 'test@softcode.ng',
      to: payload.storeEmail,
      subject: 'Important Update: Ad Deletion Notification',
      html: `
      <!DOCTYPE html>
      <html lang='en'>
      <head>
          <title>Important Update: Ad Deletion Notification</title>
      </head>
      <body>
          <h1>Dear ${payload.storeName},</h1>
          <p>We hope this message finds you well. We wanted to bring to your attention an important update regarding one of your ads on Naiya.</p>
          <p>Based on our previous communication about the need to update your ad to keep it active on Naiya, we regret to inform you that your ad, "${payload.adName}," has been permanently deleted from Naiya.</p>
          <p>This step has been taken to ensure that Naiya remains free from stale and outdated ads, providing a better experience for all our users.</p>
          <p>If this decision is not acceptable to you, we encourage you to recreate the ad, ensuring that you keep it updated regularly to prevent future removal.</p>
          <p>Rest assured, we are committed to improving our communication and reminders to help you keep your ads up-to-date in the future.</p>
          <p>Thank you for your understanding and cooperation.</p>
          <br>
          <p>Regards,</p>
          <p>Esther from Naiya</p>
      </body>
      </html>`,
    });
  }

  @OnEvent('ad.noticeToUpdateAd', { async: true })
  async noticeToUpdateAd(payload: any): Promise<any> {
    await this.mailerService.sendMail({
      from: 'test@softcode.ng',
      to: payload.storeEmail,
      subject: 'Important: Your action is required - Update Your Ad on Naiya',
      html: `
      <!DOCTYPE html>
      <html lang="en">
      <head>
          <title>Update Your Ad on Naiya</title>
      </head>
      <body>
          <h1>Dear ${payload.storeName},</h1>
          <p>We hope this message finds you well. Your ad, "${payload.adName}," has not been updated in a while.</p>
          <p>To keep it active on Naiya, please update your ad within the next 7 days. Otherwise, it will be unpublished from Naiya.</p>
          <p>Thank you for choosing Naiya.</p>
          <br>
          <p>Regards,</p>
          <p>Esther from Naiya</p>
      </body>
      </html>
      `,
    });
  }

  @OnEvent('ad.unPublishOldAdsEmailMessage', { async: true })
  async unPublishOldAdsEmailMessage(payload: any): Promise<any> {
    await this.mailerService.sendMail({
      from: 'test@softcode.ng',
      to: payload.storeEmail,
      subject: 'Important: Your action is required - Update Your Ad on Naiya',
      html: `
      <!DOCTYPE html>
      <html lang="en">
      <head>
          <title>Your Ad Has Been Unpublished</title>
      </head>
      <body>
          <h1>Dear ${payload.storeName},</h1>
          <p>We regret to inform you that your ad, "${payload.adName}," has been unpublished from Naiya.</p>
          <p>Our commitment to providing our customers with the best experience drives us to maintain a platform filled with up-to-date and relevant ads. To ensure this, we periodically review and update our ad listings.</p>
          <p>If you wish to republish your ad, please review and update it to ensure it complies with our platform policies and remains relevant to our users. After making the necessary changes, you can republish it to regain visibility.</p>
          <p>Your contributions to keeping our platform vibrant and valuable are greatly appreciated. If you have any questions or need assistance, please don't hesitate to reach out to our support team.</p>
          <br>
          <p>Thank you for your understanding and commitment to delivering quality ads.</p>
          <br>
          <p>Regards,</p>
          <p>Esther from Naiya</p>
      </body>
      </html>
      `,
    });
  }
}
