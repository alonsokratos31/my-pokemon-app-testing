import { Test, TestingModule } from '@nestjs/testing';
import { PokemonsService } from './pokemons.service';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { UpdatePokemonDto } from './dto/update-pokemon.dto';

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
    expect(result).toEqual({
      hp: 0,
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      id: expect.any(Number),
      name: 'Pikachu',
      sprites: [],
      type: 'Electric',
    });
  });

  it('should throw an error if pokemon exists', async () => {
    const data = { name: 'Charmander', type: 'Electric' };
    await service.create(data);

    try {
      await service.create(data);
      expect(true).toBeFalsy();
    } catch (error) {
      expect(error).toBeInstanceOf(BadRequestException);
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      expect(error.message).toBe(
        `Pokemon with name ${data.name} already exists`,
      );
    }
    //await expect(service.create(data)).rejects.toThrow(BadRequestException);
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

  it('should return a pokemon from cache', async () => {
    const cacheSpy = jest.spyOn(service.pokemonCache, 'get');
    const id = 1;
    await service.findOne(id);
    await service.findOne(id);
    expect(cacheSpy).toHaveBeenCalledTimes(1);
  });

  it('should find all pokemons and cache then', async () => {
    const pokemons = await service.findAll({ limit: 10, page: 1 });
    //console.log(pokemons);
    expect(pokemons).toBeInstanceOf(Array);
    expect(pokemons.length).toBe(10);
    expect(service.paginatedPokemonCache.has('10-1')).toBeTruthy();
    expect(service.paginatedPokemonCache.get('10-1')).toBe(pokemons);
  });

  it('should return pokemons from cache', async () => {
    const cacheSpy = jest.spyOn(service.paginatedPokemonCache, 'get');
    const fetchSpy = jest.spyOn(global, 'fetch');

    await service.findAll({ limit: 10, page: 1 });
    await service.findAll({ limit: 10, page: 1 });
    expect(cacheSpy).toHaveBeenCalledTimes(1);
    expect(cacheSpy).toHaveBeenLastCalledWith('10-1');

    expect(fetchSpy).toHaveBeenCalledTimes(11);
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

  it('should update a pokemon', async () => {
    const id = 1;
    const dto: UpdatePokemonDto = { name: 'Charmander2' };

    const updatedPokemon = await service.update(id, dto);

    expect(updatedPokemon).toEqual({
      id: 1,
      name: dto.name,
      type: 'grass',
      hp: 45,
      sprites: [
        'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/1.png',
        'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/back/1.png',
      ],
    });
  });
  it('should not update a pokemon if no exists', async () => {
    const id = 1000000;
    const dto: UpdatePokemonDto = { name: 'Charmander2' };

    try {
      await service.update(id, dto);
      expect(true).toBeFalsy();
    } catch (error) {
      expect(error).toBeInstanceOf(NotFoundException);
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      expect(error.message).toBe(`Pokemon with id ${id} not found`);
    }
  });
  it('should removed pokemon from cache', async () => {
    const id = 1;
    await service.findOne(1);
    await service.remove(id);
    expect(service.pokemonCache.get(id)).toBeUndefined();
  });
});
