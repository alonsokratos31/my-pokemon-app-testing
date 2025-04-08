import { Pokemon } from './pokemon.entity';

describe('PokemonEntity', () => {
  it('should create a Pokemon instance', () => {
    const pokemn = new Pokemon();
    expect(pokemn).toBeInstanceOf(Pokemon);
  });

  it('should have these properties', () => {
    const pokemon = new Pokemon();
    pokemon.id = 1;
    pokemon.name = '';
    pokemon.type = '';
    pokemon.hp = 10;
    pokemon.sprites = ['sprites.png', 'sprites2.png'];

    expect(JSON.stringify(pokemon)).toEqual(
      '{"id":1,"name":"","type":"","hp":10,"sprites":["sprites.png","sprites2.png"]}',
    );
  });
});
