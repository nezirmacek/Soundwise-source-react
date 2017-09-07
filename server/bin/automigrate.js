/**
 * Created by developer on 07.09.17.
 */
var app = require('../server');
var ds = app.datasources.db;
ds.automigrate('user');
ds.automigrate('soundcast');
ds.automigrate('episode');
ds.automigrate('listening_session');
