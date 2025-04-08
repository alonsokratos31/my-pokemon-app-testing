import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreatePokemonDto } from './dto/create-pokemon.dto';
import { UpdatePokemonDto } from './dto/update-pokemon.dto';
import { PaginationDto } from 'src/shared/dtos/pagination.dto';
import { PokeapiResponse } from './interfaces/pokeapi.response';
import { Pokemon } from './entities/pokemon.entity';
import { PokeapiPokemonResponse } from './interfaces/pokeapi-pokemon.response';

@Injectable()
export class PokemonsService {
  paginatedPokemonCache = new Map<string, Pokemon[]>();
  pokemonCache = new Map<number, Pokemon>();

  create(createPokemonDto: CreatePokemonDto) {
    const pokemon: Pokemon = {
      ...createPokemonDto,
      id: new Date().getTime(),
      hp: createPokemonDto.hp ?? 0,
      sprites: createPokemonDto.sprites ?? [],
    };

    this.pokemonCache.forEach((storedPokemon) => {
      if (pokemon.name === storedPokemon.name) {
        throw new BadRequestException(
          `Pokemon with name ${pokemon.name} already exists`,
        );
      }
    });

    this.pokemonCache.set(pokemon.id, pokemon);

    return Promise.resolve(pokemon);
  }

  async findAll(paginationDto: PaginationDto): Promise<Pokemon[]> {
    const { limit = 10, page = 1 } = paginationDto;
    const offset = (page - 1) * limit;
    const cacheKey = `${limit}-${page}`;
    if (this.paginatedPokemonCache.has(cacheKey)) {
      return this.paginatedPokemonCache.get(cacheKey)!;
    }

    const url = `https://pokeapi.co/api/v2/pokemon?limit=${limit}&offset=${offset}`;
    const response = await fetch(url);
    const data = (await response.json()) as PokeapiResponse;

    const pokemonPromises = data.results.map((result) => {
      const url = result.url;
      const id = url.split('/').at(-2)!;
      return this.getpPokemonInformation(+id);
    });
    const pokemons = await Promise.all(pokemonPromises);
    this.paginatedPokemonCache.set(cacheKey, pokemons);
    return pokemons;
  }

  async findOne(id: number) {
    if (this.pokemonCache.has(id)) {
      return this.pokemonCache.get(id);
    }
    const pokemon = await this.getpPokemonInformation(id);
    this.pokemonCache.set(id, pokemon);
    return pokemon;
  }

  async update(id: number, updatePokemonDto: UpdatePokemonDto) {
    const pokemon = await this.findOne(id);

    const updatedPokemon = {
      ...pokemon,
      ...updatePokemonDto,
    };

    return Promise.resolve(updatedPokemon);
  }

  async remove(id: number) {
    const pokemon = await this.findOne(id);
    this.pokemonCache.delete(id);
    return Promise.resolve(`This action removes a #${pokemon?.name} pokemon`);
  }

  private async getpPokemonInformation(id: number): Promise<Pokemon> {
    const response = await fetch(`https://pokeapi.co/api/v2/pokemon/${id}`);

    if (response.status === 404) {
      throw new NotFoundException(`Pokemon with id ${id} not found`);
    }
    const data = (await response.json()) as PokeapiPokemonResponse;

    return {
      id: data.id,
      name: data.name,
      type: data.types[0].type.name,
      hp: data.stats[0].base_stat,
      sprites: [data.sprites.front_default, data.sprites.back_default],
    };
  }
}
