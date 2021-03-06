/*
 * This file is part of the Sententiaregum project.
 *
 * (c) Maximilian Bosch <maximilian.bosch.27@gmail.com>
 * (c) Ben Bieler <benjaminbieler2014@gmail.com>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

'use strict';

import runAction from './runAction';
import connector from './connector';
import store from './store';
import subscribe, { chain } from './subscribe';

subscribe.chain = chain;

export {
  runAction,
  connector,
  store,
  subscribe
};
