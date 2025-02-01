export class JsonParser {
  description = `The JsonParser handles JSON values according to the [ECMA-404](http://www.ecma-international.org/publications/files/ECMA-ST/ECMA-404.pdf) standard.`;

  serialize(value: any): any {
    return JSON.stringify(value);
  }

  parseValue(value: any): any {
    if (typeof value === 'string') {
      try {
        return JSON.parse(value);
      } catch (error) {
        throw new Error('Invalid JSON string');
      }
    }
    return value;
  }

  validateJson(value: any): boolean {
    // Example validation logic if needed
    return (
      typeof value === 'object' ||
      typeof value === 'string' ||
      typeof value === 'number'
    );
  }
}
