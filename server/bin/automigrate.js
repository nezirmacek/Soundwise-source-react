/**
 * Created by developer on 07.09.17.
 */
var app = require('../server');
var ds = app.datasources.db;
ds.automigrate('listener');
ds.automigrate('soundcast');
ds.automigrate('episode');
ds.automigrate('listeningSession');
ds.automigrate('transaction');
ds.automigrate('payout');
ds.automigrate('publisher');
ds.automigrate('comment');
ds.automigrate('like');
ds.automigrate('announcement');