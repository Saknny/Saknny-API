export class TimestampParser {
  description = 'A unix timestamp in milliseconds';

  serialize(value: any): number {
    let v = typeof value === 'string' ? parseInt(value) : value;

    if (!(v instanceof Date) && isNaN(parseInt(v))) {
      throw new TypeError(
        `Value is not an instance of Date or valid timestamp: ${v}`,
      );
    }

    if (v instanceof Date) v = v.getTime();
    if (Number.isNaN(v)) {
      throw new TypeError(`Value is not a valid Date: ${v}`);
    }

    return v;
  }

  parseValue(value: any): number {
    const v = Number(value);
    if (Number.isNaN(v)) {
      throw new TypeError(`Value is not a valid number: ${value}`);
    }
    return v;
  }
}
