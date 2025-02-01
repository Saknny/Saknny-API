import { ReadStream } from 'fs';

export class Upload {
  constructor() {
    this.promise = new Promise((resolve, reject) => {
      this.resolve = (file) => {
        this.file = file;
        resolve(file);
      };
      this.reject = reject;
    });
    // Prevent errors crashing Node.js, see:
    // https://github.com/nodejs/node/issues/20392
    this.promise.catch(() => {});
  }
  promise: Promise<any>;
  resolve: (file: any) => void;
  file: UploadFile;
  reject: any;
}

export interface UploadFile {
  filename: string;
  mimetype: string;
  encoding: string;
  createReadStream: () => ReadStream;
}

export interface UploadedFile {
  filename: string;
  originalname: string;
  path: string;
  mimetype: string;
  size: number;
  buffer?: Buffer;
}

export interface ModelWhichUploadedFor {
  modelName: string;
  modelDestination: string;
  modelId: string;
}
