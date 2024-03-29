const Page = require('./helpers/page');

let page;

beforeEach(async () => {
    page = await Page.build();
    await page.goto('http://localhost:3000');
});

afterEach(async () => {
    await page.close();
});

describe('User is logged in', () => {
    beforeEach(async () => {
        await page.login();
        await page.click('a.btn-floating');
    });

    test('Can see blog create form', async () => {
        const label = await page.getContentsOf('form label');
        expect(label).toEqual('Blog Title');
    });

    describe('And using valid inputs', () => {
        beforeEach(async () => {
            await page.type('.title input', 'My Title');
            await page.type('.content input', 'My Content');
            await page.click('form button');
        });

        test('Submitting takes user to review page', async () => {
            const text = await page.getContentsOf('h5');
            expect(text).toEqual('Please confirm your entries');
        });

        test('Submitting then saving adds blog to index page', async () => {
            await page.click('button.green');
            await page.waitFor('.card');
            const title = await page.getContentsOf('.card-title');
            const content = await page.getContentsOf('p');
            expect(title).toEqual('My Title');
            expect(content).toEqual('My Content');
        });
    });

    describe('And using invalid inputs', () => {
        beforeEach(async () => {
            await page.click('form button');
        });

        test('The form shows an error', async () => {
            const titleError = await page.getContentsOf('.title .red-text');
            const contentError = await page.getContentsOf('.content .red-text');
            expect(titleError).toEqual('You must provide a value');
            expect(contentError).toEqual('You must provide a value');
        });
    });
});

describe('User is not logged in', () => {
    // test('Cannot create blog posts', async () => {
    //     const result = await page.post('/api/blogs', { title: 'My Title', content: 'My Content' });
    //     expect(result).toEqual({ error: 'You must log in!' });
    // });

    // test('Cannot create blog posts', async () => {
    //     const result = await page.get('/api/blogs');
    //     expect(result).toEqual({ error: 'You must log in!' });
    // });

    actions = [
        {
            method: 'get',
            path: '/api/blogs'
        },
        {
            method: 'post',
            path: '/api/blogs',
            data: {
                title: 'My Title',
                content: 'My Content'
            }
        }
    ];

    test('Blog related actions not allowed', async () => {
        const results = await page.execRequests(actions);
        for (let result of results) {
            expect(result).toEqual({ error: 'You must log in!' });
        }
    });
});
