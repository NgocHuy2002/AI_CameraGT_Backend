/* eslint consistent-return:0 import/order:0 */
import '@babel/polyfill';
import { connect } from '../config/db';
import '../server/api/common/prototype';

connect();

