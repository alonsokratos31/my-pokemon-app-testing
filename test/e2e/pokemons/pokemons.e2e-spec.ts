import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { App } from 'supertest/types';
import { AppModule } from '../../../src/app.module';
import { Pokemon } from 'src/pokemons/entities/pokemon.entity';

describe('Pokemons (e2e)', () => {
  let app: INestApplication<App>;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();

    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
      }),
    );
    await app.init();
  });

  it('/ (POST) - with no body', async () => {
    const response = await request(app.getHttpServer()).post('/pokemons');

    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
    const messageArray = response.body.message ?? [];
    expect(response.status).toBe(400);

    expect(messageArray).toContain('name must be a string');
    expect(messageArray).toContain('name should not be empty');
    expect(messageArray).toContain('type must be a string');
    expect(messageArray).toContain('type should not be empty');
  });
  it('/ (POST) - with valid body', async () => {
    const response = await request(app.getHttpServer()).post('/pokemons').send({
      name: 'Pikachu',
      type: 'Electric',
    });
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
    expect(response.status).toBe(201);
    expect(response.body).toEqual({
      name: 'Pikachu',
      type: 'Electric',
      hp: 0,
      sprites: [],
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      id: expect.any(Number),
    });
  });

  it('/pokemons (GET) shuld return paginated list of pokemons', async () => {
    const response = await request(app.getHttpServer())
      .get('/pokemons')
      .query({ limit: 5, page: 1 });

    expect(response.status).toBe(200);
    expect(response.body).toBeInstanceOf(Array);
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    expect(response.body.length).toBe(5);
    (response.body as Pokemon[]).forEach((pokemon) => {
      expect(pokemon).toHaveProperty('id');
      expect(pokemon).toHaveProperty('name');
      expect(pokemon).toHaveProperty('type');
      expect(pokemon).toHaveProperty('hp');
      expect(pokemon).toHaveProperty('sprites');
    });
    //console.log(response);
  });

  it('/pokemons/:id (GET) should return a Pokemon by ID', async () => {
    const response = await request(app.getHttpServer()).get('/pokemons/1');

    const pokemon = response.body as Pokemon;
    expect(response.status).toBe(200);
    expect(pokemon).toEqual({
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
  it('/pokemons/:id (GET) should return Not Found', async () => {
    const pokemonId = 9999;
    const response = await request(app.getHttpServer()).get(
      `/pokemons/${pokemonId}`,
    );

    expect(response.status).toBe(404);
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
    expect(response.body.message).toBe(
      `Pokemon with id ${pokemonId} not found`,
    );
    expect(response.body).toEqual({
      message: `Pokemon with id ${pokemonId} not found`,
      error: 'Not Found',
      statusCode: 404,
    });
  });

  it('/pokemons/:id (PATCH) should update a Pokemon', async () => {
    const pokemonId = 1;
    const dto = { name: 'Pikachu', type: 'Electric' };
    const currentPokemon = await request(app.getHttpServer()).get(
      `/pokemons/${pokemonId}`,
    );
    const bulbasur = currentPokemon.body as Pokemon;
    const response = await request(app.getHttpServer())
      .patch(`/pokemons/${pokemonId}`)
      .send(dto);
    const updatedPokemon = response.body as Pokemon;
    expect(bulbasur.hp).toEqual(updatedPokemon.hp);
    expect(bulbasur.id).toBe(updatedPokemon.id);
    expect(bulbasur.sprites).toEqual(updatedPokemon.sprites);
  });

  it('/pokemons/:id (PATCH) should throw an 404', async () => {
    const pokemonId = 40000;
    const currentPokemon = await request(app.getHttpServer())
      .patch(`/pokemons/${pokemonId}`)
      .send({});
    expect(currentPokemon.status).toBe(404);
  });

  it('/pokemons/:id (DELETE) should delete a Pokemon', async () => {
    const pokemonId = 1;
    const response = await request(app.getHttpServer()).delete(
      `/pokemons/${pokemonId}`,
    );
    expect(response.status).toBe(200);
  });

  it('/pokemons/:id (DELETE) should throw an 404', async () => {
    const pokemonId = 40000;
    const currentPokemon = await request(app.getHttpServer()).delete(
      `/pokemons/${pokemonId}`,
    );
    expect(currentPokemon.status).toBe(404);
  });
});
