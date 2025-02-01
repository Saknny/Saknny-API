import {
  registerDecorator,
  ValidationArguments,
  ValidationOptions,
} from 'class-validator';

type ValidationOptionWithMessage<T> =
  | T
  | {
      message: string;
      value: T;
    };

interface CharSetOption {
  value: 'AR' | 'EN' | 'SPACES' | 'NUM' | 'SPECIAL';
  message?: string;
  exclude?: string[];
}

//TODO : remove the message field as we replace it with defaultMessage
interface ExtendedValidationOptions extends ValidationOptions {
  minLength?: ValidationOptionWithMessage<number>;
  maxLength?: ValidationOptionWithMessage<number>;
  allowed?: ValidationOptionWithMessage<
    ('AR' | 'EN' | 'SPACES' | 'NUM' | 'SPECIAL' | CharSetOption)[]
  >;
  regexPattern?: ValidationOptionWithMessage<RegExp>;
  specificAllowedChars?: ValidationOptionWithMessage<string[]>;
  defaultMessage?: string;
}

function isCharSetOption(
  value: string | CharSetOption,
): value is CharSetOption {
  return typeof value === 'object' && 'value' in value;
}

export function TextValidator(validationOptions?: ExtendedValidationOptions) {
  const extractOptionValue = <T>(
    option:
      | ValidationOptionWithMessage<T>
      | ValidationOptionWithMessage<T>[]
      | undefined,
    defaultValue: T,
  ): ValidationOptionWithMessage<T> | ValidationOptionWithMessage<T>[] => {
    const getValue = (opts: ValidationOptionWithMessage<T> | undefined) =>
      opts ?? defaultValue;

    return Array.isArray(option)
      ? option.map(getValue)
      : typeof option === 'object' && option !== null
        ? (option as any).value
        : getValue(option);
  };

  const extractOptionMessage = <T>(
    option: ValidationOptionWithMessage<T> | undefined,
    defaultMessage: string,
    validationArguments: ValidationArguments,
  ): string => {
    if (typeof option === 'object' && option !== null && 'message' in option) {
      return option.message;
    }
    return defaultMessage;
  };

  const minLength = extractOptionValue(
    validationOptions?.minLength,
    0,
  ) as number;
  const maxLength = extractOptionValue(
    validationOptions?.maxLength,
    undefined,
  ) as number;

  return function (object: object, propertyName: string) {
    registerDecorator({
      name: 'textValidator',
      target: object.constructor,
      propertyName: propertyName,
      constraints: [],
      options: validationOptions,
      validator: {
        validate(value: any, args: ValidationArguments) {
          if (typeof value !== 'string') return false;

          const allowedCharSets = extractOptionValue(
            validationOptions?.allowed,
            [],
          ) as ('AR' | 'EN' | 'SPACES' | 'NUM' | 'SPECIAL' | CharSetOption)[];
          const specificAllowedChars = extractOptionValue(
            validationOptions?.specificAllowedChars,
            [],
          ) as string[];
          const customRegexPattern = extractOptionValue(
            validationOptions?.regexPattern,
            undefined as RegExp | undefined,
          ) as RegExp | undefined;

          const charSets = {
            AR: '\u0621-\u0660\u066A-\u06FF\u0750–\u077F\u0870–\u089F\u08A0–\u08FF\uFB50–\uFDFF\uFE70–\uFEFF',
            EN: 'a-zA-Z',
            NUM: '0-9',
            AR_NUM:
              '\u0661-\u0669\u1EC70–\u1ECBF\u1ED00–\u1ED4F\u1EE00–\u1EEFF\u10E60–\u10E7F',
            SPACES: '\\s',
            SPECIAL: '\\x21-\\x2F\\x3A-\\x40\\x5B-\\x60\\x7B-\\x7E',
          };

          let includePattern = '^[';
          let excludePattern = '[';
          const excludedMessages: string[] = [];

          allowedCharSets?.forEach((charSetOption) => {
            if (typeof charSetOption === 'string') {
              if (charSets[charSetOption]) {
                includePattern += charSets[charSetOption];
              }
            } else if (isCharSetOption(charSetOption)) {
              const charSet = charSetOption.value;
              if (charSets[charSet]) {
                excludePattern += charSetOption?.exclude?.join('') || '';
                excludedMessages.push((charSetOption.message as string) || '');
                includePattern += charSets[charSet];
              }
            }
          });

          if (
            allowedCharSets.includes('NUM') &&
            allowedCharSets.includes('AR')
          ) {
            includePattern += charSets.AR_NUM;
            excludePattern += charSets.NUM;
          }
          specificAllowedChars.forEach((char) => {
            includePattern += char;
          });

          includePattern += ']*$';
          excludePattern += ']';

          const includeRegex = new RegExp(includePattern);
          const excludeRegex = new RegExp(excludePattern);
          if (value.trim().length < minLength) {
            args.constraints.push('minLength');
            return false;
          }

          if (maxLength && value.trim().length > maxLength) {
            args.constraints.push('maxLength');
            return false;
          }

          if (!includeRegex.test(value)) {
            args.constraints.push('allowed');
            return false;
          }

          if (excludeRegex.test(value)) {
            args.constraints.push('excluded');
            return false;
          }

          if (customRegexPattern && !(customRegexPattern instanceof RegExp)) {
            console.error('regexPattern must be an instance of RegExp');
            return false;
          }

          if (customRegexPattern && !customRegexPattern.test(value)) {
            args.constraints.push('regexPattern');
            return false;
          }
          return true;
        },
        defaultMessage(args: ValidationArguments) {
          const getDefaultMessage = (msg: string, defaultMsg?: string) =>
            msg || validationOptions.defaultMessage || defaultMsg;
          const displayName = propertyName
            .replace(/([A-Z])/g, ' $1')
            .toLowerCase();
          const formattedDisplayName =
            displayName.charAt(0).toUpperCase() + displayName.slice(1);

          if (args.constraints.includes('minLength')) {
            return extractOptionMessage(
              validationOptions?.minLength,
              getDefaultMessage(
                `${formattedDisplayName} must be at least ${minLength} characters long.`,
              ),
              args,
            );
          }

          if (args.constraints.includes('maxLength')) {
            return extractOptionMessage(
              validationOptions?.maxLength,
              getDefaultMessage(
                `${formattedDisplayName} must be at most ${maxLength} characters long.`,
              ),
              args,
            );
          }

          if (args.constraints.includes('allowed')) {
            const failedCharSetOption = Array.isArray(
              validationOptions?.allowed,
            )
              ? (validationOptions?.allowed.find(
                  (option) => typeof option === 'object' && !option.exclude,
                ) as CharSetOption)
              : undefined;
            const message = getDefaultMessage(
              failedCharSetOption?.message,
              `${formattedDisplayName} contains invalid characters.`,
            );
            return extractOptionMessage(
              { message, value: failedCharSetOption?.value },
              message as string,
              args,
            );
          }

          if (args.constraints.includes('excluded')) {
            const failedCharSetOption = Array.isArray(
              validationOptions?.allowed,
            )
              ? (validationOptions?.allowed.find(
                  (option) => typeof option === 'object' && option.exclude,
                ) as CharSetOption)
              : undefined;

            const message = getDefaultMessage(
              failedCharSetOption?.message,
              `${formattedDisplayName} contains excluded characters.`,
            );
            return extractOptionMessage(
              { message, value: failedCharSetOption?.value },
              message as string,
              args,
            );
          }

          if (args.constraints.includes('regexPattern')) {
            return extractOptionMessage(
              validationOptions?.regexPattern,
              getDefaultMessage(
                `${formattedDisplayName} does not match the required pattern.`,
              ),
              args,
            );
          }

          return extractOptionMessage(
            validationOptions,
            getDefaultMessage(
              `${formattedDisplayName} must be with a length between ${minLength} and ${maxLength} including only allowed characters and excluding specific characters.`,
            ),
            args,
          );
        },
      },
    });
  };
}
