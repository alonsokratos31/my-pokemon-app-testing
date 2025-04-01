import { Test, TestingModule } from '@nestjs/testing';
import { PokemonsService } from './pokemons.service';
import { NotFoundException } from '@nestjs/common';

describe('PokemonsService', () => {
  let service: PokemonsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [PokemonsService],
    }).compile();

    service = module.get<PokemonsService>(PokemonsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should create a pokemon', async () => {
    const data = { name: 'Pikachu', type: 'Electric' };
    const result = await service.create(data);
    expect(result).toBe(`This action adds a ${data.name}`);
  });

  it('should return a pokemon if exist', async () => {
    const id = 1;
    const result = await service.findOne(id);
    expect(result).toEqual({
      id: 1,
      name: 'bulbasaur',
      type: 'grass',
      hp: 45,
      sprites: [
        'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/1.png',
        'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/back/1.png',
      ],
    });
  });

  it('should return 404 error if pokemon does not exist', async () => {
    const id = 7888888;
    await expect(service.findOne(id)).rejects.toThrow(NotFoundException);
    await expect(service.findOne(id)).rejects.toThrow(
      `Pokemon with id ${id} not found`,
    );
  });

  it('should find all pokemons and cache then', async () => {
    const pokemons = await service.findAll({ limit: 10, page: 1 });
    //console.log(pokemons);
    expect(pokemons).toBeInstanceOf(Array);
    expect(pokemons.length).toBe(10);
    expect(service.paginatedPokemonCache.has('10-1')).toBeTruthy();
    expect(service.paginatedPokemonCache.get('10-1')).toBe(pokemons);
  });

  it('should check propierty of the pokemon', async () => {
    const id = 4;
    const pokemon = await service.findOne(id);
    expect(pokemon).toHaveProperty('id');
    expect(pokemon).toHaveProperty('name');

    expect(pokemon).toEqual(
      expect.objectContaining({
        id: id,
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        hp: expect.any(Number),
      }),
    );
  });
});
