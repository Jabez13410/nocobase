import Database from '@nocobase/database';
import AuthPlugin from '@nocobase/plugin-auth';
import { mockServer, MockServer } from '@nocobase/test';
import PluginUsers from '..';
import { userPluginConfig } from './utils';

describe('actions', () => {
  let app: MockServer;
  let db: Database;
  let adminUser;
  let agent;
  let adminAgent;
  let pluginUser;

  beforeEach(async () => {
    app = mockServer();
    await app.cleanDb();
    process.env.INIT_ROOT_EMAIL = 'test@nocobase.com';
    process.env.INIT_ROOT_PASSWORD = '123456';
    process.env.INIT_ROOT_NICKNAME = 'Test';
    app.plugin(PluginUsers, userPluginConfig);
    app.plugin(AuthPlugin);
    await app.loadAndInstall();
    db = app.db;

    pluginUser = app.getPlugin('users');
    adminUser = await db.getRepository('users').findOne({
      filter: {
        email: process.env.INIT_ROOT_EMAIL,
      },
    });

    agent = app.agent();
    adminAgent = app.agent().login(adminUser);
  });

  afterEach(async () => {
    await app.destroy();
  });

  it('update profile', async () => {
    const res1 = await agent.resource('users').updateProfile({
      filterByTk: adminUser.id,
      values: {
        nickname: 'a',
      },
    });
    expect(res1.status).toBe(401);

    const res2 = await adminAgent.resource('users').updateProfile({
      filterByTk: adminUser.id,
      values: {
        nickname: 'a',
      },
    });
    expect(res2.status).toBe(200);
  });
});
