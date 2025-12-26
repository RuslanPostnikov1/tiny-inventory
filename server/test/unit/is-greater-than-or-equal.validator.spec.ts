import { validate } from 'class-validator';
import { IsGreaterThanOrEqual } from '../../src/common/validators/is-greater-than-or-equal.validator';

class TestClass {
  minValue?: number;

  @IsGreaterThanOrEqual('minValue', {
    message: 'maxValue must be >= minValue',
  })
  maxValue?: number;
}

describe('IsGreaterThanOrEqual', () => {
  it('should pass when maxValue >= minValue', async () => {
    const obj = new TestClass();
    obj.minValue = 10;
    obj.maxValue = 20;

    const errors = await validate(obj);
    expect(errors.length).toBe(0);
  });

  it('should pass when values are equal', async () => {
    const obj = new TestClass();
    obj.minValue = 10;
    obj.maxValue = 10;

    const errors = await validate(obj);
    expect(errors.length).toBe(0);
  });

  it('should fail when maxValue < minValue', async () => {
    const obj = new TestClass();
    obj.minValue = 20;
    obj.maxValue = 10;

    const errors = await validate(obj);
    expect(errors.length).toBe(1);
    expect(errors[0].constraints).toHaveProperty('isGreaterThanOrEqual');
    expect(errors[0].constraints?.isGreaterThanOrEqual).toBe(
      'maxValue must be >= minValue',
    );
  });

  it('should pass when minValue is undefined', async () => {
    const obj = new TestClass();
    obj.maxValue = 10;

    const errors = await validate(obj);
    expect(errors.length).toBe(0);
  });

  it('should pass when maxValue is undefined', async () => {
    const obj = new TestClass();
    obj.minValue = 10;

    const errors = await validate(obj);
    expect(errors.length).toBe(0);
  });

  it('should pass when both values are undefined', async () => {
    const obj = new TestClass();

    const errors = await validate(obj);
    expect(errors.length).toBe(0);
  });

  it('should pass when related value is not a number', async () => {
    const obj = new TestClass();
    (obj as unknown as { minValue: string }).minValue = 'not a number';
    obj.maxValue = 10;

    const errors = await validate(obj);
    // Should pass because non-number values are skipped
    expect(errors.length).toBe(0);
  });

  it('should use default message when custom message is not provided', async () => {
    class TestClassDefault {
      minValue?: number;

      @IsGreaterThanOrEqual('minValue')
      maxValue?: number;
    }

    const obj = new TestClassDefault();
    obj.minValue = 20;
    obj.maxValue = 10;

    const errors = await validate(obj);
    expect(errors.length).toBe(1);
    expect(errors[0].constraints?.isGreaterThanOrEqual).toBe(
      'maxValue must be greater than or equal to minValue',
    );
  });
});
