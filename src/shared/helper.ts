import { BadRequestException } from "@nestjs/common";

export class Helper {
    static multerFilter(req, file, cb) {
        if (file.mimetype.startsWith('image')) {
            cb(null, true);
        } else {
            cb(new BadRequestException('Not an image! Please upload only images!'), false);
        }
    };
    
    static userProfileCustomFileName(req, file, cb) {
        const ext = file.mimetype.split('/')[1];
        cb(null, `user-${req.user.id}-${Date.now()}.${ext}`);
    }

    static userProfileDestinationPath(req, file, cb) {
        cb(null, './files/images/users/photos')
    }
}