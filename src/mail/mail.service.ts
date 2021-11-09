import { MailerService } from '@nestjs-modules/mailer';
import { Injectable } from '@nestjs/common';

@Injectable()
export class MailService {
  constructor(private mailerService: MailerService) { }

  async sendUserMail(options) {

    await this.mailerService.sendMail({

      to: options.email,
      from: 'Saleh Ghezelbash <hello@saleh.io>',
      subject: options.subject,
      text: options.message,
      // from: '"Support Team" <support@example.com>', // override default from
      //   template: './confirmation', // `.hbs` extension is appended automatically
      //   context: { // ✏️ filling curly brackets with content
      //     name: user.name,
      //     url,
      //   },
    });
  }

}
