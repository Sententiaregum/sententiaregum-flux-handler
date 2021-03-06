/*
 * This file is part of the Sententiaregum project.
 *
 * (c) Maximilian Bosch <maximilian.bosch.27@gmail.com>
 * (c) Ben Bieler <benjaminbieler2014@gmail.com>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import TestUtils from '../../src/testing/TestUtils';
import store from '../../src/store';
import { expect } from 'chai';
import runAction from '../../src/runAction';
import subscribe, { chain } from '../../src/subscribe';

describe('testing::TestUtils', () => {
  afterEach(() => TestUtils.clear);

  describe('action tests', () => {
    it('validates the payload', function () {
      this.expected = 3;
      const EVENT   = 'EVENT';
      const creator = () => {
        return {
          [EVENT]: (publish, form_data) => publish({ status: '000', data: form_data })
        };
      };

      TestUtils.executeAction(creator, EVENT, [{ foo: 'bar' }])({
        status: '000',
        data:   {
          foo: 'bar'
        }
      });
    });

    it('(validates multiple dispatched actions)', function () {
      this.expected = 3;
      const EVENT   = 'EVENT', OTHER = 'OTHER';
      const creator = () => {
        return {
          [OTHER]: () => runAction(EVENT, creator, [{ foo: 'bar' }]),
          [EVENT]: (publish, form_data) => publish({ status: '000', data: form_data })
        };
      };

      TestUtils.executeAction(creator, OTHER, [{ foo: 'bar' }])(null, [EVENT], {
        [EVENT]: {
          status: '000',
          data:   {
            foo: 'bar'
          }
        }
      });
    });
  });

  describe('integration tests', () => {
    it('asserts against the appropriate workflow', function () {
      this.expected   = 3;
      const EVENT     = 'EVENT';
      const testStore = store({
        [EVENT]: {
          function: ({ foo }) => ({ status: '00', data: foo })
        }
      }, {});

      const creator = () => ({
        [EVENT]: publish => publish({ foo: { data: [] } })
      });

      TestUtils.executeFullWorkflow(creator, EVENT, [])({
        status: '00',
        data:   {
          data: []
        }
      }, testStore);
    });

    it('asserts against multiple stores', function () {
      this.expected    = 3;
      const EVENT      = 'EVENT';
      const testStore  = store({
        [EVENT]: {
          params:   ['foo'],
          function: ({ foo }) => ({ data: foo })
        }
      }, {});
      const otherStore = store({
        [EVENT]: subscribe(chain()(({ bar }) => ({ bar })))
      });

      const creator = () => ({
        [EVENT]: publish => publish({ foo: { data: [] }, bar: 'data' })
      });

      TestUtils.executeFullWorkflow(creator, EVENT, [])([{ data: { data: [] } }, { bar: 'data' }], [testStore, otherStore]);
    });

    it('throws an error if expected values are not given as array', function () {
      this.expected    = 3;
      const EVENT      = 'EVENT';
      const testStore  = store({
        [EVENT]: {
          params:   ['foo'],
          function: ({ foo }) => ({ data: foo })
        }
      }, {});
      const otherStore = store({
        [EVENT]: { params: ['bar'] }
      });

      const creator = () => ({
        [EVENT]: publish => publish({ foo: { data: [] }, bar: 'data' })
      });

      expect(() => TestUtils.executeFullWorkflow(creator, EVENT, [])({ foo: { data: [] } }, [testStore, otherStore])).to.throw('A list of expected values is needed when asserting against multiple stores!');
    });
  });
});
