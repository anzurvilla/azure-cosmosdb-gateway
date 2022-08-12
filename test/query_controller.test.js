const { describe, it } = require('mocha');
const { assert, expect } = require('chai');

describe('Query Controller', () => {

    const queryController = require('../src/controller/query_controller');

    const queryBase = {
        id: 'test-01',
        business: 'corp',
        to: 'test',
        enabled: true,
        startAt: '2022-01-01 08:00:00',
        endAt: '2023-01-01 00:00:00',
        overwriteData: true,
        wipeData: false,
        sqlQuery: `DECLARE @variable1 VARCHAR(50) = 'something else.'; DECLARE @variable2 DATE = '2022-07-29'; SELECT @variable1 AS variable1, @variable2 AS variable2;`,
    }

    it(`notify() should notify the query result by Email`, async () => {
        const query = {
            ...queryBase,
            // notifyTo: 'avilla@gemso.com',
            executedAt: '2022-07-29 16:15:00.000',
            finishedAt: '2022-07-29 16:15:01.000',
            executionTime: '1 second',
            successful: true,
            executionResult: '0 Items updated (just testing).',
        }

        if (query.notifyTo) {
            const result = await queryController.notify(query);
            console.log('Notify result is type of', typeof result, result);
            if (query.notifyTo) assert.isTrue(result);
            else assert.isNotTrue(result);
        }
        else console.log(`query.notifyTo is unddefined`);

    });
    
    it('mustBeExecuted() should return true', async () => {
        const query = queryBase;

        const datetime_regex = /^([0-9]{4})-?(1[0-2]|0[1-9])-?(3[01]|0[1-9]|[12][0-9]) ([01][0-9]|2[0-3]):([0-5][0-9]):([0-5][0-9])$/;
        expect(datetime_regex.test(query.startAt)).to.be.true;
        expect(datetime_regex.test(query.endAt)).to.be.true;
        // const moment = require('moment');
        // const now = moment().format('YYYY-MM-DD HH:mm');
        // console.log('startAt vs now', moment(query.startAt).diff(now, 'minutes'),'mins')
        // console.log('endAt vs now', moment(query.endAt).diff(now, 'minutes'),'mins')

        assert.isObject(query);
        expect(query).to.have.property('business');
        expect(query).to.have.any.keys('endAt','cronExpression');
        expect(query).to.include.all.keys('id','business','to','startAt','sqlQuery');

        const result = await queryController.mustBeExecuted(query);
        // console.log('Must Be Executed result', result);

        assert.isBoolean(result);
        assert.isTrue(result);
        // expect(executeit).to.be.true;
        // expect(result).equals(true);
    });

    it('callSqlQuery() should return the result SQL query', async () => {
        const query = queryBase;

        const result = await queryController.callSqlQuery(query.sqlQuery);
        console.log('result (is type of', typeof(result), ') = ', result);
        
        assert.isNotNull(result);
        assert.isArray(result);
        expect(result).to.have.lengthOf.above(0);
    });

    it('executeQuery() should return the result SQL query', async () => {
        const query = queryBase;

        // Execute the Query
        const result = await queryController.executeQuery(query);
        // console.log('Query result:', result);
        
        assert.isNotNull(result);
        assert.isObject(result);
        expect(result).to.has.a.property('executionResult').that.is.a('string');
        expect(result.executionResult).to.has.lengthOf.above(0);
        // expect(result).to.has.any.keys('id','business','to','enabled','startAt','sqlQuery','executedAt','finishedAt','executionTime','successful','executionResult','updatedAt');
        expect(result).include.all.keys('id','business','to','enabled','startAt','sqlQuery','executedAt','finishedAt','executionTime','successful','executionResult','updatedAt');
        expect(result).to.has.a.property('successful').that.is.a('boolean');
        // assert.isTrue(result.successful);
    });

    it('scheduleQuery() should return an object with a scheduled property as true', async () => {
        const query = {
            ...queryBase,
            cronExpression: '20 */8 * * *',
        }
        
        const result = await queryController.scheduleQuery(query);
        // console.log('Schedule result', result.options);

        assert.isObject(result);
        assert.isObject(result.options);
        expect(result).to.has.a.property('options');
        expect(result.options).haveOwnProperty('scheduled');
        expect(result.options).to.has.a.property('scheduled').that.is.a('boolean');
        assert.isTrue(result.options.scheduled);

    });

    it('runProcessCloudQueries should return an Array containing some queries', async () => {
        const queries = await queryController.runProcessCloudQueries();
        assert.isArray(queries);
    });

});