import { validate } from 'class-validator';
import { CreatePokemonDto } from './create-pokemon.dto';

describe('CreateDto', () => {
  it('should be validate with correct data', async () => {
    const dto = new CreatePokemonDto();
    dto.name = 'Pikachu';
    dto.type = 'Electric';
    const errors = await validate(dto);
    expect(errors.length).toBe(0);
  });
  it('should be invalidate if name is not present', async () => {
    const dto = new CreatePokemonDto();
    //dto.name = 'Pikachu';
    dto.type = 'Electric';
    const errors = await validate(dto);
    const nameError = errors.find((error) => error.property === 'name');
    expect(nameError).toBeDefined();
  });
  it('should be invalidate if type is not present', async () => {
    const dto = new CreatePokemonDto();
    dto.name = 'Pikachu';
    //dto.type = 'Electric';
    const errors = await validate(dto);
    const typeError = errors.find((error) => error.property === 'type');
    expect(typeError).toBeDefined();
  });
  it('should hp must be positive number', async () => {
    const dto = new CreatePokemonDto();
    dto.name = 'Pikachu';
    dto.type = 'Electric';
    dto.hp = -1;
    const errors = await validate(dto);
    const hpError = errors.find((error) => error.property === 'hp');
    const constrains = hpError?.constraints;
    expect(hpError).toBeDefined();
    expect(constrains).toEqual({ min: 'hp must not be less than 0' });
  });
  it('should be invalidate with not string sprites', async () => {
    const dto = new CreatePokemonDto();
    dto.name = 'Pikachu';
    dto.type = 'Electric';
    dto.sprites = [123, 456] as unknown as string[];
    const errors = await validate(dto);
    const spritesError = errors.find((error) => error.property === 'sprites');
    expect(spritesError).toBeDefined();
  });
  it('should be validate with string sprites', async () => {
    const dto = new CreatePokemonDto();
    dto.name = 'Pikachu';
    dto.type = 'Electric';
    dto.sprites = ['123', '456'];
    const errors = await validate(dto);
    const spritesError = errors.find((error) => error.property === 'sprites');
    expect(spritesError).toBeUndefined();
  });
});
