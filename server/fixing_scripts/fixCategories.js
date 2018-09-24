'use strict';

const database = require('../../database');
const { podcastCategories } = require('../scripts/utils')();
const categoriesIds = Object.keys(podcastCategories).map(i => podcastCategories[i]); // main 16 categories ('Arts', 'Comedy', ...)

module.exports = () =>
  setTimeout(async () => {
    try {
      const countList = await database.CategoryList.count();
      if (countList === 0) {
        for (const category of categoriesIds) {
          // fill up CategoryList
          await database.CategoryList.create({
            categoryId: category.id,
            name: category.name,
          });
        }
        const count = await database.Category.count();
        let i = 0;
        while (i <= count) {
          console.log(`Querying "Category" OFFSET ${i}`);
          const items = await database.Category.findAll({
            order: ['soundcastId'],
            offset: i,
            limit: 10000,
          });
          for (const item of items) {
            const categoryId = categoriesIds.find(i => i.name === item.name).id;
            if (categoryId) {
              await database.CategorySoundcast.create({
                categoryId,
                soundcastId: item.soundcastId,
              });
            } else {
              console.log(`Error categoryId not found ${JSON.stringify(item)}`);
            }
          }
          i += 10000;
        }
      }
    } catch (err) {
      console.log(`fixCategories err ${err}`);
    }
  }, 5000);
