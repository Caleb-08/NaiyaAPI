import { Injectable } from '@nestjs/common';
import * as AWS from 'aws-sdk';
import { compressImage } from './image-manipulation.service';
import { generateImageFileName } from './utility.service';
import { ConfigService } from '@nestjs/config';
import { videoManipulationService } from './video-manipulation.service';
import * as fs from 'fs';

@Injectable()
export class FileUploadService {
  spacesEndpoint: AWS.Endpoint = new AWS.Endpoint(
    this.config.get('DigitalOceanEndpoint'),
  );

  s3: AWS.S3 = new AWS.S3({
    endpoint: this.spacesEndpoint,
    accessKeyId: this.config.get('DigitalOceanAccessKey'),
    secretAccessKey: this.config.get('DigitalOceanSecretKey'),
  });
  constructor(private config: ConfigService) {}

  async uploadImage(file: any, uploadPath: string) {
    const fileName = generateImageFileName('webp');
    return compressImage(file.buffer).then((fileBuffer: any) => {
      const params: any = {
        Body: fileBuffer,
        Bucket: `${this.config.get('DigitalOceanSpaceName')}/${uploadPath}`,
        Key: fileName,
        ACL: 'public-read',
        ContentType: 'image/webp',
      };

      this.s3.putObject(params, function (err: any, data: any) {
        if (err) console.log(err, err.stack);
        else console.log(data);
      });

      return `https://${this.config.get(
        'DigitalOceanSpaceName',
      )}.${this.config.get(
        'DigitalOceanRegionName',
      )}.cdn.digitaloceanspaces.com/${uploadPath}/${fileName}`;
    });
  }

  async deleteFileFromDigitalOcean(fileName: string, uploadPath: string) {
    const params = {
      Bucket: `${this.config.get('DigitalOceanSpaceName')}/${uploadPath}`,
      Key: fileName,
    };

    this.s3.deleteObject(params, function (err, data) {
      if (err) {
        console.error('Error deleting file:', err);
      } else {
        console.log('File deleted successfully:', data);
      }
    });
  }

  async uploadVideo(file: any, uploadPath: string, currentVideoUrl?: any) {
    const spacesEndpoint: AWS.Endpoint = new AWS.Endpoint(
      this.config.get('DigitalOceanEndpoint'),
    );

    const s3: AWS.S3 = new AWS.S3({
      endpoint: spacesEndpoint,
      accessKeyId: this.config.get('DigitalOceanAccessKey'),
      secretAccessKey: this.config.get('DigitalOceanSecretKey'),
    });

    const fileName = generateImageFileName('mp4');
    const inputPath = `./temp/${fileName}`;
    const outputPath = `./temp/convertedVideos/${fileName}`;
    return await videoManipulationService(file, inputPath, outputPath).then(
      async (fileBuffer: any) => {
        if (currentVideoUrl) {
          await this.deleteFileFromDigitalOcean(
            currentVideoUrl.split('/').at(-1),
            uploadPath,
          );
        }

        const params: any = {
          Body: fileBuffer,
          Bucket: `${this.config.get('DigitalOceanSpaceName')}/${uploadPath}`,
          Key: fileName,
          ACL: 'public-read',
          ContentType: 'video/mp4',
        };

        s3.putObject(params, function (err: any, data: any) {
          if (err) console.log(err, err.stack);
          else console.log(data);
        });

        fs.unlink(inputPath, () => null);
        fs.unlink(outputPath, () => null);

        return `https://${this.config.get(
          'DigitalOceanSpaceName',
        )}.${this.config.get(
          'DigitalOceanRegionName',
        )}.cdn.digitaloceanspaces.com/${uploadPath}/${fileName}`;
      },
    );
  }
}
