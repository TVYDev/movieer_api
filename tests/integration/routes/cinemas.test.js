const request = require('supertest');
const mongoose = require('mongoose');
const Cinema = require('../../../models/Cinema');
let server;

describe('/api/v1/cinemas', () => {
    beforeAll(() => {
        server = require('../../../server');
    });
    afterAll(async () => {
        await server.close();
    });
    afterEach(async () => {
        await Cinema.deleteMany();
    });

    describe('GET /', () => {
        it('should return 200, and return all cinemas', async () => {
            await Cinema.create([
                {
                    name: 'Delee Cinma Phnom Penh',
                    address: 'Toul Kork, Phnom Penh, Cambodia',
                    openingHours: '7AM - 10PM'
                },
                {
                    name: 'Delee Cinma Takmao',
                    address: 'Takhmao, Cambodia',
                    openingHours: '8AM - 9PM'
                }
            ]);

            const res = await request(server).get('/api/v1/cinemas');
            const items = res.body.data.items;

            expect(res.status).toBe(200);

            expect(
                items.some((g) => g.name === 'Delee Cinma Phnom Penh')
            ).toBeTruthy();
            expect(
                items.some((g) => g.name === 'Delee Cinma Takmao')
            ).toBeTruthy();

            expect(
                items.some(
                    (g) => g.address === 'Toul Kork, Phnom Penh, Cambodia'
                )
            ).toBeTruthy();
            expect(
                items.some((g) => g.address === 'Takhmao, Cambodia')
            ).toBeTruthy();

            expect(
                items.some((g) => g.openingHours === '7AM - 10PM')
            ).toBeTruthy();
            expect(
                items.some((g) => g.openingHours === '8AM - 9PM')
            ).toBeTruthy();

            expect(items.length).toBe(2);
        });
    });

    describe('POST /', () => {
        const data = {
            name: 'Delee Cinma Phnom Penh',
            address: 'Toul Kork, Phnom Penh, Cambodia',
            openingHours: '7AM - 10PM'
        };

        const exec = () => request(server).post('/api/v1/cinemas');

        it('should return 400 if name is not provided', async () => {
            const curData = { ...data };
            delete curData.name;

            const res = await exec().send(curData);

            expect(res.status).toBe(400);
        });

        it('should return 400 if name is less than 5 characters', async () => {
            const curData = { ...data };
            curData.name = 'aaaa';

            const res = await exec().send(curData);

            expect(res.status).toBe(400);
        });

        it('should return 400 if name is more than 100 characters', async () => {
            const curData = { ...data };
            curData.name = new Array(102).join('a'); // this will generate a string of 'a' with 101 characters

            const res = await exec().send(curData);

            expect(res.status).toBe(400);
        });

        it('should return 400 if name is duplicated', async () => {
            const res1 = await exec().send(data);
            const res2 = await exec().send(data);

            expect(res1.status).toBe(201);
            expect(res2.status).toBe(400);
        });

        it('should return 400 if address is not provided', async () => {
            const curData = { ...data };
            delete curData.address;

            const res = await exec().send(curData);

            expect(res.status).toBe(400);
        });

        it('should return 400 if openingHours is not provided', async () => {
            const curData = { ...data };
            delete curData.openingHours;

            const res = await exec().send(curData);

            expect(res.status).toBe(400);
        });

        it('should return 201, and save the cinema if request body is valid', async () => {
            const res = await exec().send(data);

            const cinema = await Cinema.find({
                name: 'Delee Cinma Phnom Penh'
            });

            expect(res.status).toBe(201);
            expect(cinema).not.toBeNull();
        });

        it('should return 201, and return cinema and status 200 if operation is successful', async () => {
            const res = await exec().send(data);

            expect(res.status).toBe(201);
            expect(res.body.data).toHaveProperty('_id');
            expect(res.body.data).toHaveProperty(
                'name',
                'Delee Cinma Phnom Penh'
            );
            expect(res.body.data).toHaveProperty(
                'address',
                'Toul Kork, Phnom Penh, Cambodia'
            );
            expect(res.body.data).toHaveProperty('openingHours', '7AM - 10PM');
            expect(res.body.data).toHaveProperty('location');
        });
    });

    describe('GET /:id', () => {
        it('should return 404 if object id is invalid', async () => {
            const res = await request(server).get('/api/v1/cinemas/1');
            expect(res.status).toBe(404);
        });

        it('should return 404 if id given does not exist', async () => {
            const id = mongoose.Types.ObjectId();
            const res = await request(server).get(`/api/v1/cinemas/${id}`);
            expect(res.status).toBe(404);
        });

        it('should return 200, and return a cinema if valid id is passed', async () => {
            const cinema = await Cinema.create({
                name: 'Delee Cinma Phnom Penh',
                address: 'Toul Kork, Phnom Penh, Cambodia',
                openingHours: '7AM - 10PM'
            });

            const res = await request(server).get(
                `/api/v1/cinemas/${cinema._id}`
            );

            expect(res.status).toBe(200);
            expect(res.body.data).toHaveProperty(
                '_id',
                cinema._id.toHexString()
            );
            expect(res.body.data).toHaveProperty(
                'name',
                'Delee Cinma Phnom Penh'
            );
            expect(res.body.data).toHaveProperty(
                'address',
                'Toul Kork, Phnom Penh, Cambodia'
            );
            expect(res.body.data).toHaveProperty('openingHours', '7AM - 10PM');
            expect(res.body.data).toHaveProperty('location');
        });
    });

    describe('PUT /:id', () => {
        let cinema;
        let cinemaId;

        beforeEach(async () => {
            cinema = await Cinema.create({
                name: 'Delee Cinma Phnom Penh',
                address: 'Toul Kork, Phnom Penh, Cambodia',
                openingHours: '7AM - 10PM'
            });

            cinemaId = cinema._id;
        });

        afterEach(async () => {
            await cinema.remove();
        });

        const exec = () => request(server).put(`/api/v1/cinemas/${cinemaId}`);

        it('should return 400 if name provided is less than 5 characters', async () => {
            const res = await exec().send({ name: 'aaaa' });

            expect(res.status).toBe(400);
        });

        it('should return 400 if name provided is more than 100 characters', async () => {
            const name = new Array(102).join('a');
            const res = await exec().send({ name });

            expect(res.status).toBe(400);
        });

        it('should return 404 if object id provided is invalid', async () => {
            cinemaId = 1;
            const res = await exec().send({});

            expect(res.status).toBe(404);
        });

        it('should return 404 if cinema id provided does not exist', async () => {
            cinemaId = mongoose.Types.ObjectId();
            const res = await exec().send({});

            expect(res.status).toBe(404);
        });

        it('should return 200, and update the cinema if request is valid', async () => {
            const res = await exec().send({
                name: 'test123',
                address: 'Takhmao, Cambodia',
                openingHours: '8AM - 9PM'
            });

            const cinemaInDb = await Cinema.findById(cinemaId);

            expect(res.status).toBe(200);
            expect(cinemaInDb.name).toBe('test123');
            expect(cinemaInDb.address).toBe('Takhmao, Cambodia');
            expect(cinemaInDb.openingHours).toBe('8AM - 9PM');
            expect(cinemaInDb.location).not.toEqual(res.body.data.location);
        });

        it('should return 200, and return the updated cinema if request is valid', async () => {
            const res = await exec().send({
                name: 'test123',
                address: 'Takhmao, Cambodia',
                openingHours: '8AM - 9PM'
            });

            expect(res.status).toBe(200);
            expect(res.body.data).toHaveProperty('name', 'test123');
            expect(res.body.data).toHaveProperty(
                'address',
                'Takhmao, Cambodia'
            );
            expect(res.body.data).toHaveProperty('openingHours', '8AM - 9PM');
        });
    });

    describe('DELETE /:id', () => {
        let cinemaId;

        beforeEach(async () => {
            cinema = await Cinema.create({
                name: 'Delee Cinma Phnom Penh',
                address: 'Toul Kork, Phnom Penh, Cambodia',
                openingHours: '7AM - 10PM'
            });

            cinemaId = cinema._id;
        });

        afterEach(async () => {
            await cinema.remove();
        });

        const exec = () =>
            request(server).delete(`/api/v1/cinemas/${cinemaId}`);

        it('should return 404 if object ID provided is invalid', async () => {
            cinemaId = 1;
            const res = await exec();

            expect(res.status).toBe(404);
        });

        it('should return 404 if cinema provided does not exist', async () => {
            cinemaId = mongoose.Types.ObjectId();
            const res = await exec();

            expect(res.status).toBe(404);
        });

        it('should return 200, and delete the cinema if ID provided is valid and exists', async () => {
            const res = await exec();

            const cinemaInDb = await Cinema.findById(cinemaId);

            expect(res.status).toBe(200);
            expect(cinemaInDb).toBeNull();
        });

        it('should return 200, and return the deleted cinema if ID provided is valid and exists', async () => {
            const res = await exec();

            expect(res.status).toBe(200);
            expect(res.body.data).toHaveProperty('_id', cinemaId.toHexString());
            expect(res.body.data).toHaveProperty(
                'name',
                'Delee Cinma Phnom Penh'
            );
        });
    });
});
