const request = require('supertest');
const { Movie } = require('../../../models/Movie');
const { Genre } = require('../../../models/Genre');
const { MovieType } = require('../../../models/MovieType');
const { Language } = require('../../../models/Language');
const { Country } = require('../../../models/Country');
const mongoose = require('mongoose');
let server;

describe('Movies', () => {
    beforeAll(() => {
        server = require('../../../server');
    });
    afterAll(async () => {
        await server.close();
    });
    afterEach(async () => {
        await Movie.deleteMany();
    });

    describe('GET /api/v1/movies', () => {
        it('should return 200, and return all the movies', async () => {
            await Movie.create([
                {
                    title: 'Spider man',
                    description: 'Superhero with climbing abilities',
                    releasedDate: '2020-01-23',
                    ticketPrice: 2.5,
                    durationInMinutes: 120,
                    genres: [
                        '5f85b4bb8be19d2788193471',
                        '5f85b58f15173c139c7476b7'
                    ],
                    movieType: '5f84030ea795143ed451ddbf',
                    trailerUrl: 'https://youtu.be/dR3cjXncoSk',
                    posterUrl:
                        'https://i.pinimg.com/originals/e6/a2/5a/e6a25a2855e741f7461fe1698db3153a.jpg',
                    spokenLanguage: mongoose.Types.ObjectId(),
                    subtitleLanguage: mongoose.Types.ObjectId(),
                    country: mongoose.Types.ObjectId()
                },
                {
                    title: 'Toy Story',
                    description: 'Animated toys of a boy',
                    releasedDate: '2019-10-01',
                    ticketPrice: 2,
                    durationInMinutes: 80,
                    genres: [
                        '5f85b59cca353939f0b98e78',
                        '5f85b58f15173c139c7476b7'
                    ],
                    movieType: '5f8409065fc86e09e4752519',
                    trailerUrl: 'https://youtu.be/wmiIUN-7qhE',
                    posterUrl:
                        'https://images-na.ssl-images-amazon.com/images/I/714hR8KCqaL._AC_SL1308_.jpg',
                    spokenLanguage: mongoose.Types.ObjectId(),
                    subtitleLanguage: mongoose.Types.ObjectId(),
                    country: mongoose.Types.ObjectId()
                }
            ]);

            const res = await request(server).get('/api/v1/movies');
            const { items } = res.body.data;

            expect(res.status).toBe(200);
            expect(items.some((m) => m.title === 'Spider man')).toBeTruthy();
            expect(items.some((m) => m.title === 'Toy Story')).toBeTruthy();
            expect(items.some((m) => m.genres !== undefined)).toBeTruthy();
            expect(items.some((m) => m.movieType !== undefined)).toBeTruthy();
            expect(
                items.some((m) => m.spokenLanguage !== undefined)
            ).toBeTruthy();
            expect(
                items.some((m) => m.subtitleLanguage !== undefined)
            ).toBeTruthy();
            expect(items.some((m) => m.country !== undefined)).toBeTruthy();
            expect(items).toHaveLength(2);
        });
    });

    describe('GET /api/v1/genres/:genreId/movies', () => {
        let genre;
        let genreId;

        beforeEach(async () => {
            genre = await Genre.create({
                name: 'Action',
                description: 'Fighting scenes'
            });

            genreId = genre._id;
        });
        afterEach(async () => {
            await genre.remove();
        });

        const exec = () =>
            request(server).get(`/api/v1/genres/${genreId}/movies`);

        it('should return 404 if object ID of genre is not valid', async () => {
            genreId = 1;
            const res = await exec();

            expect(res.status).toBe(404);
        });

        it('should return 404 if object ID of genre does not exist', async () => {
            genreId = mongoose.Types.ObjectId();
            const res = await exec();

            expect(res.status).toBe(404);
        });

        it('should return 200, and all the movies of the genre if the request is valid', async () => {
            await Movie.create([
                {
                    _id: '5f867dafee5d303788cfbb90',
                    title: 'Spider man',
                    description: 'Superhero with climbing abilities',
                    releasedDate: '2020-01-23',
                    ticketPrice: 2.5,
                    durationInMinutes: 120,
                    genres: [genreId],
                    movieType: '5f84030ea795143ed451ddbf',
                    trailerUrl: 'https://youtu.be/dR3cjXncoSk',
                    posterUrl:
                        'https://i.pinimg.com/originals/e6/a2/5a/e6a25a2855e741f7461fe1698db3153a.jpg',
                    spokenLanguage: mongoose.Types.ObjectId(),
                    subtitleLanguage: mongoose.Types.ObjectId(),
                    country: mongoose.Types.ObjectId()
                },
                {
                    _id: '5f867f6526b4c50090a9cf83',
                    title: 'Toy Story',
                    description: 'Animated toys of a boy',
                    releasedDate: '2019-10-01',
                    ticketPrice: 2,
                    durationInMinutes: 80,
                    genres: [genreId, mongoose.Types.ObjectId()],
                    movieType: '5f8409065fc86e09e4752519',
                    trailerUrl: 'https://youtu.be/wmiIUN-7qhE',
                    posterUrl:
                        'https://images-na.ssl-images-amazon.com/images/I/714hR8KCqaL._AC_SL1308_.jpg',
                    spokenLanguage: mongoose.Types.ObjectId(),
                    subtitleLanguage: mongoose.Types.ObjectId(),
                    country: mongoose.Types.ObjectId()
                }
            ]);

            const res = await exec();
            const { items } = res.body.data;

            expect(res.status).toBe(200);
            expect(
                items.some((m) => m._id === '5f867dafee5d303788cfbb90')
            ).toBeTruthy();
            expect(
                items.some((m) => m._id === '5f867f6526b4c50090a9cf83')
            ).toBeTruthy();
            expect(items.some((m) => m.title === 'Spider man')).toBeTruthy();
            expect(items.some((m) => m.title === 'Toy Story')).toBeTruthy();
            expect(items.some((m) => m.genres !== undefined)).toBeTruthy();
            expect(items.some((m) => m.movieType !== undefined)).toBeTruthy();
            expect(
                items.some((m) => m.spokenLanguage !== undefined)
            ).toBeTruthy();
            expect(
                items.some((m) => m.subtitleLanguage !== undefined)
            ).toBeTruthy();
            expect(items.some((m) => m.country !== undefined)).toBeTruthy();
            expect(items).toHaveLength(2);
        });
    });

    describe('GET /api/v1/movie-types/:movieTypeId/movies', () => {
        let movieType;
        let movieTypeId;

        beforeEach(async () => {
            movieType = await MovieType.create({
                name: '2D',
                description: 'Simple 2D technology'
            });

            movieTypeId = movieType._id;
        });
        afterEach(async () => {
            await movieType.remove();
        });

        const exec = () =>
            request(server).get(`/api/v1/movie-types/${movieTypeId}/movies`);

        it('should return 404 if object ID of movie type is not valid', async () => {
            movieTypeId = 1;
            const res = await exec();

            expect(res.status).toBe(404);
        });

        it('should return 404 if object ID of movie type does not exist', async () => {
            movieTypeId = mongoose.Types.ObjectId();
            const res = await exec();

            expect(res.status).toBe(404);
        });

        it('should return 200, and all the movies of the movie type if the request is valid', async () => {
            await Movie.create([
                {
                    _id: '5f867dafee5d303788cfbb90',
                    title: 'Spider man',
                    description: 'Superhero with climbing abilities',
                    releasedDate: '2020-01-23',
                    ticketPrice: 2.5,
                    durationInMinutes: 120,
                    genres: [mongoose.Types.ObjectId()],
                    movieType: movieTypeId,
                    trailerUrl: 'https://youtu.be/dR3cjXncoSk',
                    posterUrl:
                        'https://i.pinimg.com/originals/e6/a2/5a/e6a25a2855e741f7461fe1698db3153a.jpg',
                    spokenLanguage: mongoose.Types.ObjectId(),
                    subtitleLanguage: mongoose.Types.ObjectId(),
                    country: mongoose.Types.ObjectId()
                },
                {
                    _id: '5f867f6526b4c50090a9cf83',
                    title: 'Toy Story',
                    description: 'Animated toys of a boy',
                    releasedDate: '2019-10-01',
                    ticketPrice: 2,
                    durationInMinutes: 80,
                    genres: [mongoose.Types.ObjectId()],
                    movieType: movieTypeId,
                    trailerUrl: 'https://youtu.be/wmiIUN-7qhE',
                    posterUrl:
                        'https://images-na.ssl-images-amazon.com/images/I/714hR8KCqaL._AC_SL1308_.jpg',
                    spokenLanguage: mongoose.Types.ObjectId(),
                    subtitleLanguage: mongoose.Types.ObjectId(),
                    country: mongoose.Types.ObjectId()
                },
                {
                    _id: '5f8680aafc113a4648914a84',
                    title: 'Ralph Breaks the Internet',
                    description: 'Fantasy video games characters',
                    releasedDate: '2020-08-10',
                    ticketPrice: 3,
                    durationInMinutes: 130,
                    genres: [mongoose.Types.ObjectId()],
                    movieType: mongoose.Types.ObjectId(),
                    trailerUrl: 'https://youtu.be/_BcYBFC6zfY',
                    posterUrl:
                        'https://images-na.ssl-images-amazon.com/images/I/71sAwnr37AL._AC_SL1069_.jpg',
                    spokenLanguage: mongoose.Types.ObjectId(),
                    subtitleLanguage: mongoose.Types.ObjectId(),
                    country: mongoose.Types.ObjectId()
                }
            ]);

            const res = await exec();
            const { items } = res.body.data;

            expect(res.status).toBe(200);
            expect(
                items.some((m) => m._id === '5f867dafee5d303788cfbb90')
            ).toBeTruthy();
            expect(
                items.some((m) => m._id === '5f867f6526b4c50090a9cf83')
            ).toBeTruthy();
            expect(items.some((m) => m.title === 'Spider man')).toBeTruthy();
            expect(items.some((m) => m.title === 'Toy Story')).toBeTruthy();
            expect(items.some((m) => m.genres !== undefined)).toBeTruthy();
            expect(items.some((m) => m.movieType !== undefined)).toBeTruthy();
            expect(
                items.some((m) => m.spokenLanguage !== undefined)
            ).toBeTruthy();
            expect(
                items.some((m) => m.subtitleLanguage !== undefined)
            ).toBeTruthy();
            expect(items.some((m) => m.country !== undefined)).toBeTruthy();
            expect(items).toHaveLength(2);
        });
    });

    describe('GET /api/v1/languages/spoken/:spokenLanguageId/movies', () => {
        let language;
        let languageId;

        beforeEach(async () => {
            language = await Language.create({ name: 'Khmer' });

            languageId = language._id;
        });
        afterEach(async () => {
            await language.remove();
        });

        const exec = () =>
            request(server).get(
                `/api/v1/languages/spoken/${languageId}/movies`
            );

        it('should return 404 if object ID of spoken language ID is not valid', async () => {
            languageId = 1;
            const res = await exec();

            expect(res.status).toBe(404);
        });

        it('should return 404 if object ID of spoken language ID does not exist', async () => {
            languageId = mongoose.Types.ObjectId();
            const res = await exec();

            expect(res.status).toBe(404);
        });

        it('should return 200, and return the movies of the spoken language if request is valid', async () => {
            await Movie.create([
                {
                    _id: '5f867dafee5d303788cfbb90',
                    title: 'Spider man',
                    description: 'Superhero with climbing abilities',
                    releasedDate: '2020-01-23',
                    ticketPrice: 2.5,
                    durationInMinutes: 120,
                    genres: [mongoose.Types.ObjectId()],
                    movieType: mongoose.Types.ObjectId(),
                    trailerUrl: 'https://youtu.be/dR3cjXncoSk',
                    posterUrl:
                        'https://i.pinimg.com/originals/e6/a2/5a/e6a25a2855e741f7461fe1698db3153a.jpg',
                    spokenLanguage: languageId,
                    subtitleLanguage: mongoose.Types.ObjectId(),
                    country: mongoose.Types.ObjectId()
                },
                {
                    _id: '5f867f6526b4c50090a9cf83',
                    title: 'Toy Story',
                    description: 'Animated toys of a boy',
                    releasedDate: '2019-10-01',
                    ticketPrice: 2,
                    durationInMinutes: 80,
                    genres: [mongoose.Types.ObjectId()],
                    movieType: mongoose.Types.ObjectId(),
                    trailerUrl: 'https://youtu.be/wmiIUN-7qhE',
                    posterUrl:
                        'https://images-na.ssl-images-amazon.com/images/I/714hR8KCqaL._AC_SL1308_.jpg',
                    spokenLanguage: languageId,
                    subtitleLanguage: mongoose.Types.ObjectId(),
                    country: mongoose.Types.ObjectId()
                }
            ]);

            const res = await exec();
            const { items } = res.body.data;

            expect(res.status).toBe(200);
            expect(
                items.some((m) => m._id === '5f867dafee5d303788cfbb90')
            ).toBeTruthy();
            expect(
                items.some((m) => m._id === '5f867f6526b4c50090a9cf83')
            ).toBeTruthy();
            expect(items.some((m) => m.title === 'Spider man')).toBeTruthy();
            expect(items.some((m) => m.title === 'Toy Story')).toBeTruthy();
            expect(items.some((m) => m.genres !== undefined)).toBeTruthy();
            expect(items.some((m) => m.movieType !== undefined)).toBeTruthy();
            expect(
                items.some((m) => m.spokenLanguage !== undefined)
            ).toBeTruthy();
            expect(
                items.some((m) => m.subtitleLanguage !== undefined)
            ).toBeTruthy();
            expect(items.some((m) => m.country !== undefined)).toBeTruthy();
            expect(items).toHaveLength(2);
        });
    });

    describe('GET /api/v1/languages/subtitle/:subtitleLanguageId/movies', () => {
        let language;
        let languageId;

        beforeEach(async () => {
            language = await Language.create({ name: 'Khmer' });

            languageId = language._id;
        });
        afterEach(async () => {
            await language.remove();
        });

        const exec = () =>
            request(server).get(
                `/api/v1/languages/subtitle/${languageId}/movies`
            );

        it('should return 404 if object ID of subtitle language ID is not valid', async () => {
            languageId = 1;
            const res = await exec();

            expect(res.status).toBe(404);
        });

        it('should return 404 if object ID of subtitle language ID does not exist', async () => {
            languageId = mongoose.Types.ObjectId();
            const res = await exec();

            expect(res.status).toBe(404);
        });

        it('should return 200, and return the movies of the subtitle language if request is valid', async () => {
            await Movie.create([
                {
                    _id: '5f867dafee5d303788cfbb90',
                    title: 'Spider man',
                    description: 'Superhero with climbing abilities',
                    releasedDate: '2020-01-23',
                    ticketPrice: 2.5,
                    durationInMinutes: 120,
                    genres: [mongoose.Types.ObjectId()],
                    movieType: mongoose.Types.ObjectId(),
                    trailerUrl: 'https://youtu.be/dR3cjXncoSk',
                    posterUrl:
                        'https://i.pinimg.com/originals/e6/a2/5a/e6a25a2855e741f7461fe1698db3153a.jpg',
                    spokenLanguage: mongoose.Types.ObjectId(),
                    subtitleLanguage: languageId,
                    country: mongoose.Types.ObjectId()
                },
                {
                    _id: '5f867f6526b4c50090a9cf83',
                    title: 'Toy Story',
                    description: 'Animated toys of a boy',
                    releasedDate: '2019-10-01',
                    ticketPrice: 2,
                    durationInMinutes: 80,
                    genres: [mongoose.Types.ObjectId()],
                    movieType: mongoose.Types.ObjectId(),
                    trailerUrl: 'https://youtu.be/wmiIUN-7qhE',
                    posterUrl:
                        'https://images-na.ssl-images-amazon.com/images/I/714hR8KCqaL._AC_SL1308_.jpg',
                    spokenLanguage: mongoose.Types.ObjectId(),
                    subtitleLanguage: languageId,
                    country: mongoose.Types.ObjectId()
                }
            ]);

            const res = await exec();
            const { items } = res.body.data;

            expect(res.status).toBe(200);
            expect(
                items.some((m) => m._id === '5f867dafee5d303788cfbb90')
            ).toBeTruthy();
            expect(
                items.some((m) => m._id === '5f867f6526b4c50090a9cf83')
            ).toBeTruthy();
            expect(items.some((m) => m.title === 'Spider man')).toBeTruthy();
            expect(items.some((m) => m.title === 'Toy Story')).toBeTruthy();
            expect(items.some((m) => m.genres !== undefined)).toBeTruthy();
            expect(items.some((m) => m.movieType !== undefined)).toBeTruthy();
            expect(
                items.some((m) => m.spokenLanguage !== undefined)
            ).toBeTruthy();
            expect(
                items.some((m) => m.subtitleLanguage !== undefined)
            ).toBeTruthy();
            expect(items.some((m) => m.country !== undefined)).toBeTruthy();
            expect(items).toHaveLength(2);
        });
    });

    describe('GET /api/v1/countries/:countryId/movies', () => {
        let country;
        let countryId;

        beforeEach(async () => {
            country = await Country.create({ name: 'Cambodai', code: 'KH' });

            countryId = country._id;
        });
        afterEach(async () => {
            await country.remove();
        });

        const exec = () =>
            request(server).get(`/api/v1/countries/${countryId}/movies`);

        it('should return 404 if object ID of country ID is not valid', async () => {
            countryId = 1;
            const res = await exec();

            expect(res.status).toBe(404);
        });

        it('should return 404 if object ID of country ID does not exist', async () => {
            countryId = mongoose.Types.ObjectId();
            const res = await exec();

            expect(res.status).toBe(404);
        });

        it('should return 200, and return the movies of the country if request is valid', async () => {
            await Movie.create([
                {
                    _id: '5f867dafee5d303788cfbb90',
                    title: 'Spider man',
                    description: 'Superhero with climbing abilities',
                    releasedDate: '2020-01-23',
                    ticketPrice: 2.5,
                    durationInMinutes: 120,
                    genres: [mongoose.Types.ObjectId()],
                    movieType: mongoose.Types.ObjectId(),
                    trailerUrl: 'https://youtu.be/dR3cjXncoSk',
                    posterUrl:
                        'https://i.pinimg.com/originals/e6/a2/5a/e6a25a2855e741f7461fe1698db3153a.jpg',
                    spokenLanguage: mongoose.Types.ObjectId(),
                    subtitleLanguage: mongoose.Types.ObjectId(),
                    country: countryId
                },
                {
                    _id: '5f867f6526b4c50090a9cf83',
                    title: 'Toy Story',
                    description: 'Animated toys of a boy',
                    releasedDate: '2019-10-01',
                    ticketPrice: 2,
                    durationInMinutes: 80,
                    genres: [mongoose.Types.ObjectId()],
                    movieType: mongoose.Types.ObjectId(),
                    trailerUrl: 'https://youtu.be/wmiIUN-7qhE',
                    posterUrl:
                        'https://images-na.ssl-images-amazon.com/images/I/714hR8KCqaL._AC_SL1308_.jpg',
                    spokenLanguage: mongoose.Types.ObjectId(),
                    subtitleLanguage: mongoose.Types.ObjectId(),
                    country: countryId
                }
            ]);

            const res = await exec();
            const { items } = res.body.data;

            expect(res.status).toBe(200);
            expect(
                items.some((m) => m._id === '5f867dafee5d303788cfbb90')
            ).toBeTruthy();
            expect(
                items.some((m) => m._id === '5f867f6526b4c50090a9cf83')
            ).toBeTruthy();
            expect(items.some((m) => m.title === 'Spider man')).toBeTruthy();
            expect(items.some((m) => m.title === 'Toy Story')).toBeTruthy();
            expect(items.some((m) => m.genres !== undefined)).toBeTruthy();
            expect(items.some((m) => m.movieType !== undefined)).toBeTruthy();
            expect(
                items.some((m) => m.spokenLanguage !== undefined)
            ).toBeTruthy();
            expect(
                items.some((m) => m.subtitleLanguage !== undefined)
            ).toBeTruthy();
            expect(items.some((m) => m.country !== undefined)).toBeTruthy();
            expect(items).toHaveLength(2);
        });
    });

    describe('GET /api/v1/movies/:id', () => {
        let movie;
        let movieId;

        beforeEach(async () => {
            movie = await Movie.create({
                title: 'Spider man',
                description: 'Superhero with climbing abilities',
                releasedDate: '2020-01-23',
                ticketPrice: 2.5,
                durationInMinutes: 120,
                trailerUrl: 'https://youtu.be/dR3cjXncoSk',
                posterUrl:
                    'https://i.pinimg.com/originals/e6/a2/5a/e6a25a2855e741f7461fe1698db3153a.jpg',
                genres: [
                    '5f85b4bb8be19d2788193471',
                    '5f85b58f15173c139c7476b7'
                ],
                movieType: '5f84030ea795143ed451ddbf',
                spokenLanguage: mongoose.Types.ObjectId(),
                subtitleLanguage: mongoose.Types.ObjectId(),
                country: mongoose.Types.ObjectId()
            });

            movieId = movie._id;
        });
        afterEach(async () => {
            await movie.remove();
        });

        const exec = () => request(server).get(`/api/v1/movies/${movieId}`);

        it('should return 404 if object ID is not valid', async () => {
            movieId = 1;
            const res = await exec();

            expect(res.status).toBe(404);
        });

        it('should return 404 if object ID of movie does not exist', async () => {
            movieId = mongoose.Types.ObjectId();
            const res = await exec();

            expect(res.status).toBe(404);
        });

        it('should return 200, and return the movie if the request is valid', async () => {
            const res = await exec();

            expect(res.status).toBe(200);
            expect(res.body.data).toHaveProperty('_id', movieId.toHexString());
            expect(res.body.data).toHaveProperty('title', 'Spider man');
            expect(res.body.data).toHaveProperty(
                'description',
                'Superhero with climbing abilities'
            );
            expect(res.body.data).toHaveProperty('genres');
            expect(res.body.data).toHaveProperty('movieType');
            expect(res.body.data).toHaveProperty('spokenLanguage');
            expect(res.body.data).toHaveProperty('subtitleLanguage');
            expect(res.body.data).toHaveProperty('country');
            expect(res.body.data).toHaveProperty('createdAt');
        });
    });

    describe('POST /api/v1/movies', () => {
        let genreAction;
        let genreHorror;
        let movieType;
        let spokenLanguage;
        let subtitleLanguage;
        let country;

        const data = {
            title: 'Spider man',
            description: 'Superhero with climbing abilities',
            releasedDate: '2020-01-23',
            ticketPrice: 2.5,
            durationInMinutes: 120,
            trailerUrl: 'https://youtu.be/dR3cjXncoSk',
            posterUrl:
                'https://i.pinimg.com/originals/e6/a2/5a/e6a25a2855e741f7461fe1698db3153a.jpg'
        };

        beforeEach(async () => {
            genreAction = await Genre.create({
                name: 'Action',
                description: 'Fighting scenes'
            });

            genreHorror = await Genre.create({
                name: 'Horror',
                description: 'Ghosts, scary things'
            });

            movieType = await MovieType.create({
                name: '2D',
                description: 'Simple 2D technology'
            });

            spokenLanguage = await Language.create({ name: 'Khmer' });
            subtitleLanguage = await Language.create({ name: 'English' });

            country = await Country.create({ name: 'Cambodia', code: 'KH' });

            data.genreIds = [genreAction._id, genreHorror._id];
            data.movieTypeId = movieType._id;
            data.spokenLanguageId = spokenLanguage._id;
            data.subtitleLanguageId = subtitleLanguage._id;
            data.countryId = country._id;
        });

        afterEach(async () => {
            await MovieType.deleteMany();
            await Genre.deleteMany();
            await Language.deleteMany();
            await Country.deleteMany();
        });

        const exec = () => request(server).post('/api/v1/movies');

        it('should return 400 if title is not provided', async () => {
            const curData = { ...data };
            delete curData.title;

            const res = await exec().send(curData);

            expect(res.status).toBe(400);
        });

        it('should return 400 if title is not a string', async () => {
            const curData = { ...data };
            curData.title = true;

            const res = await exec().send(curData);

            expect(res.status).toBe(400);
        });

        it('should return 400 if title is an empty string', async () => {
            const curData = { ...data };
            curData.title = '';

            const res = await exec().send(curData);

            expect(res.status).toBe(400);
        });

        it('should return 400 if title is more than 100 characters', async () => {
            const curData = { ...data };
            const title = new Array(102).join('a');
            curData.title = title;

            const res = await exec().send(curData);

            expect(res.status).toBe(400);
        });

        it('should return 400 if description is not provided', async () => {
            const curData = { ...data };
            delete curData.description;

            const res = await exec().send(curData);

            expect(res.status).toBe(400);
        });

        it('should return 400 if description is not a string', async () => {
            const curData = { ...data };
            curData.description = true;

            const res = await exec().send(curData);

            expect(res.status).toBe(400);
        });

        it('should return 400 if description is an empty string', async () => {
            const curData = { ...data };
            curData.description = '';

            const res = await exec().send(curData);

            expect(res.status).toBe(400);
        });

        it('should return 400 if ticketPrice is not provided', async () => {
            const curData = { ...data };
            delete curData.ticketPrice;

            const res = await exec().send(curData);

            expect(res.status).toBe(400);
        });

        it('should return 400 if ticketPrice is not a number', async () => {
            const curData = { ...data };
            curData.ticketPrice = true;

            const res = await exec().send(curData);

            expect(res.status).toBe(400);
        });

        it('should return 400 if ticketPrice is less than zero', async () => {
            const curData = { ...data };
            curData.ticketPrice = -1;

            const res = await exec().send(curData);

            expect(res.status).toBe(400);
        });

        it('should return 400 if durationInMinutes is not provided', async () => {
            const curData = { ...data };
            delete curData.durationInMinutes;

            const res = await exec().send(curData);

            expect(res.status).toBe(400);
        });

        it('should return 400 if durationInMinutes is not a number', async () => {
            const curData = { ...data };
            curData.durationInMinutes = true;

            const res = await exec().send(curData);

            expect(res.status).toBe(400);
        });

        it('should return 400 if durationInMinutes is not an integer', async () => {
            const curData = { ...data };
            curData.durationInMinutes = 2.2;

            const res = await exec().send(curData);

            expect(res.status).toBe(400);
        });

        it('should return 400 if durationInMinutes is less than zero', async () => {
            const curData = { ...data };
            curData.durationInMinutes = -1;

            const res = await exec().send(curData);

            expect(res.status).toBe(400);
        });

        it('should return 400 if releasedDate is not provided', async () => {
            const curData = { ...data };
            delete curData.releasedDate;

            const res = await exec().send(curData);

            expect(res.status).toBe(400);
        });

        it('should return 400 if releasedDate is not a date string', async () => {
            const curData = { ...data };
            curData.releasedDate = true;

            const res = await exec().send(curData);

            expect(res.status).toBe(400);
        });

        it('should return 400 if releasedDate is not a valid date string', async () => {
            const curData = { ...data };
            curData.releasedDate = '10-10-10';

            const res = await exec().send(curData);

            expect(res.status).toBe(400);
        });

        it('should return 400 if trailerUrl is not a valid URL', async () => {
            const curData = { ...data };
            curData.trailerUrl = 'qwe';

            const res = await exec().send(curData);

            expect(res.status).toBe(400);
        });

        it('should return 400 if posterUrl is not a valid URL', async () => {
            const curData = { ...data };
            curData.posterUrl = 'qwe';

            const res = await exec().send(curData);

            expect(res.status).toBe(400);
        });

        it('should return 400 if genreIds is not provided', async () => {
            const curData = { ...data };
            delete curData.genreIds;

            const res = await exec().send(curData);

            expect(res.status).toBe(400);
        });

        it('should return 400 if genreIds is not an array', async () => {
            const curData = { ...data };
            curData.genreIds = true;

            const res = await exec().send(curData);

            expect(res.status).toBe(400);
        });

        it('should return 400 if genreIds is an empty array', async () => {
            const curData = { ...data };
            curData.genreIds = [];

            const res = await exec().send(curData);

            expect(res.status).toBe(400);
        });

        it('should return 400 if genreIds is not an array of valid object ID', async () => {
            const curData = { ...data };
            curData.genreIds = [mongoose.Types.ObjectId(), 1];

            const res = await exec().send(curData);

            expect(res.status).toBe(400);
        });

        it('should return 404 if any genreId of genreIds array does not exist', async () => {
            const curData = { ...data };
            curData.genreIds = [mongoose.Types.ObjectId()];

            const res = await exec().send(curData);

            expect(res.status).toBe(404);
        });

        it('should return 400 if movieTypeId is not provided', async () => {
            const curData = { ...data };
            delete curData.movieTypeId;

            const res = await exec().send(curData);

            expect(res.status).toBe(400);
        });

        it('should return 400 if movieTypeId is not a valid object Id', async () => {
            const curData = { ...data };
            curData.movieTypeId = 1;

            const res = await exec().send(curData);

            expect(res.status).toBe(400);
        });

        it('should return 404 if movieTypeId does not exist', async () => {
            const curData = { ...data };
            curData.movieTypeId = mongoose.Types.ObjectId();

            const res = await exec().send(curData);

            expect(res.status).toBe(404);
        });

        it('should return 400 if spokenLanguageId is not provided', async () => {
            const curData = { ...data };
            delete curData.spokenLanguageId;

            const res = await exec().send(curData);

            expect(res.status).toBe(400);
        });

        it('should return 400 if spokenLanguageId is not a valid object Id', async () => {
            const curData = { ...data };
            curData.spokenLanguageId = 1;

            const res = await exec().send(curData);

            expect(res.status).toBe(400);
        });

        it('should return 404 if spokenLanguageId does not exist', async () => {
            const curData = { ...data };
            curData.spokenLanguageId = mongoose.Types.ObjectId();

            const res = await exec().send(curData);

            expect(res.status).toBe(404);
        });

        it('should return 400 if subtitleLanguageId is not provided', async () => {
            const curData = { ...data };
            delete curData.subtitleLanguageId;

            const res = await exec().send(curData);

            expect(res.status).toBe(400);
        });

        it('should return 400 if subtitleLanguageId is not a valid object Id', async () => {
            const curData = { ...data };
            curData.subtitleLanguageId = 1;

            const res = await exec().send(curData);

            expect(res.status).toBe(400);
        });

        it('should return 404 if subtitleLanguageId does not exist', async () => {
            const curData = { ...data };
            curData.subtitleLanguageId = mongoose.Types.ObjectId();

            const res = await exec().send(curData);

            expect(res.status).toBe(404);
        });

        it('should return 400 if countryId is not provided', async () => {
            const curData = { ...data };
            delete curData.countryId;

            const res = await exec().send(curData);

            expect(res.status).toBe(400);
        });

        it('should return 400 if countryId is not a valid object Id', async () => {
            const curData = { ...data };
            curData.countryId = 1;

            const res = await exec().send(curData);

            expect(res.status).toBe(400);
        });

        it('should return 404 if countryId does not exist', async () => {
            const curData = { ...data };
            curData.countryId = mongoose.Types.ObjectId();

            const res = await exec().send(curData);

            expect(res.status).toBe(404);
        });

        it('should return 201, and create the movie if the request is valid', async () => {
            const res = await exec().send(data);

            const movieInDb = await Movie.find({
                name: 'Spider man',
                movieTypes: movieType._id,
                genres: [genreAction._id, genreHorror._id],
                spokenLanguage: spokenLanguage._id,
                subtitleLanguage: subtitleLanguage._id,
                country: country._id
            });

            expect(res.status).toBe(201);
            expect(movieInDb).not.toBeNull();
        });

        it('should return 201, and return the created movie if the request is valid', async () => {
            const res = await exec().send(data);
            const { data: dt } = res.body;

            expect(res.status).toBe(201);
            expect(dt).toHaveProperty('_id');
            expect(dt).toHaveProperty('title', 'Spider man');
            expect(dt).toHaveProperty(
                'description',
                'Superhero with climbing abilities'
            );
            expect(dt).toHaveProperty('releasedDate');
            expect(dt).toHaveProperty('ticketPrice', 2.5);
            expect(dt).toHaveProperty('durationInMinutes', 120);
            expect(dt).toHaveProperty(
                'trailerUrl',
                'https://youtu.be/dR3cjXncoSk'
            );
            expect(dt).toHaveProperty(
                'posterUrl',
                'https://i.pinimg.com/originals/e6/a2/5a/e6a25a2855e741f7461fe1698db3153a.jpg'
            );
            expect(dt).toHaveProperty('createdAt');

            expect(dt).toHaveProperty('movieType', movieType._id.toHexString());

            expect(dt).toHaveProperty('genres');
            expect(dt.genres).toContain(genreAction._id.toHexString());
            expect(dt.genres).toContain(genreHorror._id.toHexString());
            expect(dt.genres).toHaveLength(2);

            expect(dt).toHaveProperty(
                'spokenLanguage',
                spokenLanguage._id.toHexString()
            );

            expect(dt).toHaveProperty(
                'subtitleLanguage',
                subtitleLanguage._id.toHexString()
            );

            expect(dt).toHaveProperty('country', country._id.toHexString());
        });
    });

    describe('PUT /api/v1/movies/:id', () => {
        let movie;
        let movieId;
        let genre;
        let genreId;
        let movieType;
        let movieTypeId;
        let spokenLanguage;
        let spokenLanguageId;
        let subtitleLanguage;
        let subtitleLanguageId;
        let country;
        let countryId;

        beforeEach(async () => {
            movie = await Movie.create({
                title: 'Spider man',
                description: 'Superhero with climbing abilities',
                releasedDate: '2020-01-23',
                ticketPrice: 2.5,
                durationInMinutes: 120,
                trailerUrl: 'https://youtu.be/dR3cjXncoSk',
                posterUrl:
                    'https://i.pinimg.com/originals/e6/a2/5a/e6a25a2855e741f7461fe1698db3153a.jpg',
                genres: [
                    '5f85b4bb8be19d2788193471',
                    '5f85b58f15173c139c7476b7'
                ],
                movieType: '5f84030ea795143ed451ddbf',
                spokenLanguage: mongoose.Types.ObjectId(),
                subtitleLanguage: mongoose.Types.ObjectId(),
                country: mongoose.Types.ObjectId()
            });

            movieId = movie._id;

            genre = await Genre.create({
                name: 'Action',
                description: 'Fighting scenes'
            });

            genreId = genre._id;

            movieType = await MovieType.create({
                name: '2D',
                description: 'Simple 2D technology'
            });

            movieTypeId = movieType._id;

            spokenLanguage = await Language.create({ name: 'Khmer' });
            spokenLanguageId = spokenLanguage._id;

            subtitleLanguage = await Language.create({ name: 'English' });
            subtitleLanguageId = subtitleLanguage._id;

            country = await Country.create({ name: 'Cambodia', code: 'Kh' });
            countryId = country._id;
        });
        afterEach(async () => {
            await movie.remove();
            await genre.remove();
            await movieType.remove();
            await spokenLanguage.remove();
            await subtitleLanguage.remove();
            await country.remove();
        });

        const exec = () => request(server).put(`/api/v1/movies/${movieId}`);

        it('should return 400 if title is not a string', async () => {
            const res = await exec().send({ title: true });

            expect(res.status).toBe(400);
        });

        it('should return 400 if title is an empty string', async () => {
            const res = await exec().send({ title: '' });

            expect(res.status).toBe(400);
        });

        it('should return 400 if title is more than 100 characters', async () => {
            const title = new Array(102).join('a');
            const res = await exec().send({ title });

            expect(res.status).toBe(400);
        });

        it('should return 400 if description is not a string', async () => {
            const res = await exec().send({ description: true });

            expect(res.status).toBe(400);
        });

        it('should return 400 if description is an empty string', async () => {
            const res = await exec().send({ description: '' });

            expect(res.status).toBe(400);
        });

        it('should return 400 if ticketPrice is not a number', async () => {
            const res = await exec().send({ ticketPrice: true });

            expect(res.status).toBe(400);
        });

        it('should return 400 if ticketPrice is less than zero', async () => {
            const res = await exec().send({ ticketPrice: -1 });

            expect(res.status).toBe(400);
        });

        it('should return 400 if durationInMinutes is not a number', async () => {
            const res = await exec().send({ durationInMinutes: true });

            expect(res.status).toBe(400);
        });

        it('should return 400 if durationInMinutes is not an integer', async () => {
            const res = await exec().send({ durationInMinutes: 2.2 });

            expect(res.status).toBe(400);
        });

        it('should return 400 if durationInMinutes is less than zero', async () => {
            const res = await exec().send({ durationInMinutes: -1 });

            expect(res.status).toBe(400);
        });

        it('should return 400 if releasedDate is not a date string', async () => {
            const res = await exec().send({ releasedDate: true });

            expect(res.status).toBe(400);
        });

        it('should return 400 if releasedDate is not a valid date string', async () => {
            const res = await exec().send({ releasedDate: '10-10-10' });

            expect(res.status).toBe(400);
        });

        it('should return 400 if trailerUrl is not a valid URL', async () => {
            const res = await exec().send({ trailerUrl: 'qwe' });

            expect(res.status).toBe(400);
        });

        it('should return 400 if posterUrl is not a valid URL', async () => {
            const res = await exec().send({ posterUrl: 'qwe' });

            expect(res.status).toBe(400);
        });

        it('should return 400 if genreIds is not an array', async () => {
            const res = await exec().send({ genreIds: true });

            expect(res.status).toBe(400);
        });

        it('should return 400 if genreIds is an empty array', async () => {
            const res = await exec().send({ genreIds: [] });

            expect(res.status).toBe(400);
        });

        it('should return 400 if genreIds is not an array of valid object ID', async () => {
            const res = await exec().send({
                genreIds: [mongoose.Types.ObjectId(), 1]
            });

            expect(res.status).toBe(400);
        });

        it('should return 404 if any genreId of genreIds array does not exist', async () => {
            const res = await exec().send({
                genreIds: [mongoose.Types.ObjectId()]
            });

            expect(res.status).toBe(404);
        });

        it('should return 400 if movieTypeId is not a valid object Id', async () => {
            const res = await exec().send({ movieTypeId: 1 });

            expect(res.status).toBe(400);
        });

        it('should return 404 if movieTypeId does not exist', async () => {
            const res = await exec().send({
                movieTypeId: mongoose.Types.ObjectId()
            });

            expect(res.status).toBe(404);
        });

        it('should return 404 if object ID of movie is not valid', async () => {
            movieId = 1;
            const res = await exec().send({});

            expect(res.status).toBe(404);
        });

        it('should return 404 if object ID of movie does not exist', async () => {
            movieId = mongoose.Types.ObjectId();
            const res = await exec().send({});

            expect(res.status).toBe(404);
        });

        it('should return 400 if spokenLanguageId is not a valid object Id', async () => {
            const res = await exec().send({ spokenLanguageId: 1 });

            expect(res.status).toBe(400);
        });

        it('should return 404 if spokenLanguageId does not exist', async () => {
            const res = await exec().send({
                spokenLanguageId: mongoose.Types.ObjectId()
            });

            expect(res.status).toBe(404);
        });

        it('should return 400 if subtitleLanguageId is not a valid object Id', async () => {
            const res = await exec().send({ subtitleLanguageId: 1 });

            expect(res.status).toBe(400);
        });

        it('should return 404 if subtitleLanguageId does not exist', async () => {
            const res = await exec().send({
                subtitleLanguageId: mongoose.Types.ObjectId()
            });

            expect(res.status).toBe(404);
        });

        it('should return 400 if countryId is not a valid object Id', async () => {
            const res = await exec().send({ countryId: 1 });

            expect(res.status).toBe(400);
        });

        it('should return 404 if countryId does not exist', async () => {
            const res = await exec().send({
                countryId: mongoose.Types.ObjectId()
            });

            expect(res.status).toBe(404);
        });

        it('should return 200, and update the movie if request is valid', async () => {
            const res = await exec().send({
                title: 'qwe',
                description: 'test qwe',
                genreIds: [genreId],
                movieTypeId,
                spokenLanguageId,
                subtitleLanguageId,
                countryId
            });

            const movieInDb = await Movie.findById(movieId);

            expect(res.status).toBe(200);
            expect(movieInDb.title).toBe('qwe');
            expect(movieInDb.description).toBe('test qwe');

            expect(movieInDb.genres).toHaveLength(1);
            expect(movieInDb.genres[0].toHexString()).toBe(
                genreId.toHexString()
            );

            expect(movieInDb.movieType.toHexString()).toBe(
                movieTypeId.toHexString()
            );

            expect(movieInDb.spokenLanguage.toHexString()).toBe(
                spokenLanguageId.toHexString()
            );

            expect(movieInDb.subtitleLanguage.toHexString()).toBe(
                subtitleLanguageId.toHexString()
            );

            expect(movieInDb.country.toHexString()).toBe(
                countryId.toHexString()
            );

            expect(movieInDb.updatedAt).not.toBeNull();
        });

        it('should return 200, and return the updated movie if request is valid', async () => {
            const res = await exec().send({
                title: 'qwe',
                description: 'test qwe',
                genreIds: [genreId],
                movieTypeId,
                spokenLanguageId,
                subtitleLanguageId,
                countryId
            });

            const { data } = res.body;

            expect(res.status).toBe(200);
            expect(data).toHaveProperty('_id', movieId.toHexString());
            expect(data).toHaveProperty('title', 'qwe');
            expect(data).toHaveProperty('description', 'test qwe');
            expect(data).toHaveProperty('genres');
            expect(data).toHaveProperty('movieType');
            expect(data).toHaveProperty('spokenLanguage');
            expect(data).toHaveProperty('subtitleLanguage');
            expect(data).toHaveProperty('country');
            expect(data).toHaveProperty('updatedAt');
        });
    });

    describe('DELETE /api/v1/movies/:id', () => {
        let movie;
        let movieId;

        beforeEach(async () => {
            movie = await Movie.create({
                title: 'Spider man',
                description: 'Superhero with climbing abilities',
                releasedDate: '2020-01-23',
                ticketPrice: 2.5,
                durationInMinutes: 120,
                trailerUrl: 'https://youtu.be/dR3cjXncoSk',
                posterUrl:
                    'https://i.pinimg.com/originals/e6/a2/5a/e6a25a2855e741f7461fe1698db3153a.jpg',
                genres: [
                    '5f85b4bb8be19d2788193471',
                    '5f85b58f15173c139c7476b7'
                ],
                movieType: '5f84030ea795143ed451ddbf',
                spokenLanguage: mongoose.Types.ObjectId(),
                subtitleLanguage: mongoose.Types.ObjectId(),
                country: mongoose.Types.ObjectId()
            });

            movieId = movie._id;
        });
        afterEach(async () => {
            await movie.remove();
        });

        const exec = () => request(server).delete(`/api/v1/movies/${movieId}`);

        it('should return 404 if object ID is not valid', async () => {
            movieId = 1;
            const res = await exec();

            expect(res.status).toBe(404);
        });

        it('should return 404 if object ID of movie does not exist', async () => {
            movieId = mongoose.Types.ObjectId();
            const res = await exec();

            expect(res.status).toBe(404);
        });

        it('should return 200, and delete the movie if request is valid', async () => {
            const res = await exec();

            const movieInDb = await Movie.findById(movieId);

            expect(res.status).toBe(200);
            expect(movieInDb).toBeNull();
        });

        it('should return 200, and return the deleted movie if request is valid', async () => {
            const res = await exec();

            expect(res.status).toBe(200);
            expect(res.body.data).toHaveProperty('_id', movieId.toHexString());
            expect(res.body.data).toHaveProperty('title', 'Spider man');
        });
    });
});
