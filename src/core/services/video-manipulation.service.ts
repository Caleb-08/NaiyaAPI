import * as fs from 'fs';
import * as fsPromises from 'fs/promises'; // Import the fs.promises API

import { httpErrorException } from './utility.service';

export async function videoManipulationService(
  video: any,
  inputPath: string,
  outputPath: string,
): Promise<any> {
  if (!video || !video.buffer) {
    httpErrorException("You've selected an invalid image");
  }

  if (!fs.existsSync(`temp`)) {
    fs.mkdirSync(`temp/convertedVideos`, {
      recursive: true,
    });
  }

  const stream = fs.createWriteStream(inputPath);
  stream.write(video.buffer);
  stream.end();

  return await new Promise((resolve, reject) => {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const ffmpeg = require('fluent-ffmpeg');
    ffmpeg()
      .input(inputPath)
      .input('asset/images/naiyaLogo.png') // Path to the watermark image
      .complexFilter([
        // Overlay the watermark at a specific position (e.g., bottom right)
        '[0:v][1:v]overlay=W-w-10:H-h-10',
      ])
      .videoBitrate('1000k')
      .audioBitrate('64k')
      .videoCodec('libx264')
      .audioCodec('aac')
      .fps(24)
      .output(outputPath)
      .on('end', () => {
        console.log('I am done');
        // return the converted file buffer
        fsPromises
          .readFile(outputPath)
          .then((buffer) => {
            resolve(buffer);
          })
          .catch((err) => {
            reject(err);
          });
      })
      .on('error', () => {
        httpErrorException('An error occur during video conversion');
      })
      .run();
  });
}
