import { Controller, Get, Put, Body, Req, Post, UseInterceptors, UploadedFile, BadRequestException } from '@nestjs/common';
import { ProfilesService } from './profiles.service';
import { FileInterceptor } from '@nestjs/platform-express';
import { Request } from 'express';

@Controller('profiles')
export class ProfilesController {
  constructor(private profilesService: ProfilesService) {}

  @Get('me')
  async getMyProfile(@Req() req: Request) {
    return this.profilesService.getProfile(req['user_id']);
  }

  @Put('me')
  async updateMyProfile(@Req() req: Request, @Body() body: any) {
    // Validate personality types if not done by DTO
    const validPersonalities = ['Professional', 'Friendly', 'Motivational', 'Calm', 'Direct'];
    if (body.personality_type && !validPersonalities.includes(body.personality_type)) {
       throw new BadRequestException('Invalid personality type');
    }
    return this.profilesService.updateProfile(req['user_id'], body);
  }

  @Post('avatar')
  @UseInterceptors(FileInterceptor('file', {
    limits: {
      fileSize: 2 * 1024 * 1024, // 2MB
    },
    fileFilter: (req, file, cb) => {
      if (!file.mimetype.match(/\/(jpg|jpeg|png|webp)$/)) {
        return cb(new BadRequestException('Unsupported file type'), false);
      }
      cb(null, true);
    }
  }))
  async uploadAvatar(@Req() req: Request, @UploadedFile() file: Express.Multer.File) {
    if (!file) {
      throw new BadRequestException('File is missing');
    }
    return this.profilesService.uploadAvatar(req['user_id'], file);
  }
}
