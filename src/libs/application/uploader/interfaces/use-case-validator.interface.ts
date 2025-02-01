import { FileHandlingInput } from '../inputs/upload-file.input';

export interface IUseCaseValidator {
  isFileValidToUseCase(input: FileHandlingInput): Promise<boolean>;
}
