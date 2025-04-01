import { validate } from 'class-validator';
import { UpdatePokemonDto } from './update-pokemon.dto';

describe('UpdateDto', () => {
  it('should be validate with correct data', async () => {
    const dto = new UpdatePokemonDto();
    dto.name = 'Pikachu';
    dto.type = 'Electric';
    const errors = await validate(dto);
    expect(errors.length).toBe(0);
  });

  it('should hp must be positive number', async () => {
    const dto = new UpdatePokemonDto();
    dto.name = 'Pikachu';
    dto.type = 'Electric';
    dto.hp = -1;
    const errors = await validate(dto);
    const hpError = errors.find((error) => error.property === 'hp');
    const constrains = hpError?.constraints;
    expect(hpError).toBeDefined();
    expect(constrains).toEqual({ min: 'hp must not be less than 0' });
  });
});
