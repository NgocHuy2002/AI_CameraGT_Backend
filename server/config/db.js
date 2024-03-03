import mongoose from 'mongoose';
import { getConfig } from './config';
import { allWorkerInitData, onlyOneWorkerInitData } from '../api/seeder';
import { allWorkerJobs, onlyOneWorkerJobs } from '../api/seeder/job';

const config = getConfig(process.env.NODE_ENV);
mongoose.Promise = global.Promise;
export const connect = (isInitWorker) => {
  const options = { server: { socketOptions: { keepAlive: 1 } }, useUnifiedTopology: true }; // { useUnifiedTopology: true }
  mongoose.connect(config.MONGO_URI, options).then(async () => {
    console.log('Successfully connected to MongoDB');
    if (isInitWorker) {
      await onlyOneWorkerInitData();
      await onlyOneWorkerJobs();
    }
    await allWorkerInitData();
    await allWorkerJobs();
  }).catch(err => {
    console.log('Not connected to the database: ' + err);
  });
};
mongoose.set('useFindAndModify', false);
mongoose.connection.on('error', err => {
  let stack;
  if (err) {
    stack = err.stack;
  }
  console.log(err);
}); // eslint-disable-line no-console
mongoose.connection.on('disconnected', () => {
  setTimeout(connect, 5000);
});
