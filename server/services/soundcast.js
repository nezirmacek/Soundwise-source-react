'use strict';

const soundcastRepository = require('../repositories').soundcastRepository;
const database = require('../../database');

const createOrUpdate = data =>
  soundcastRepository
    .get(data.soundcastId)
    .then(obj => (obj ? obj.update(data) : soundcastRepository.create(data)));

const getRecommendations = async (req, res) => {
  const categories = await database.CategoryList.findAll({ raw: true });
  const promises = categories.map(async category => {
    const soundcasts = await database.db.query(`
      SELECT * FROM "Soundcasts" as "s" 
      LEFT JOIN "CategorySoundcasts" as "cs" ON "cs"."soundcastId"="s"."soundcastId" 
      WHERE "cs"."categoryId"='${category.categoryId}' AND "s"."forSale"
      ORDER BY "s"."rank" DESC LIMIT 10
    `);

    return Object.assign({}, category, { soundcasts: soundcasts[0] });
  });
  const recommendations = await Promise.all(promises);

  res.status(200).send(recommendations);
};

const getSoundcastsFromCategory = async (req, res) => {
  console.log(req.params.categoryId);
  const soundcasts = await database.db.query(`
      SELECT * FROM "Soundcasts" as "s" 
      LEFT JOIN "CategorySoundcasts" as "cs" ON "cs"."soundcastId"="s"."soundcastId" 
      WHERE "cs"."categoryId"='${req.params.categoryId}' AND "s"."forSale"
      ORDER BY "s"."rank" DESC LIMIT 100
    `);
  res.status(200).send(soundcasts[0]);
};

module.exports = {
  createOrUpdate,
  getRecommendations,
  getSoundcastsFromCategory,
};
