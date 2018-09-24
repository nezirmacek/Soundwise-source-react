'use strict';

const fs = require('fs');
const firebase = require('firebase-admin');
const database = require('../../database');
const moment = require('moment');
const { commentRepository } = require('../repositories');

const LOG_ERR = 'logErrsComments.txt';

const fixCategories = async () => {
  console.log('start');
  const Category = database.TempCategory;
  const SoundcastsCategory = database.Category;
  let categories = [];
  try {
    categories = await initializeCategories();
  } catch (err) {
    console.log('Failed to fetch categories', err);
    return;
  }

  for (const category of categories) {
    try {
      const res = await SoundcastsCategory.update(
        { categoryId: category.id },
        { where: { name: category.name } }
      );
      console.log(`Updated records of category ${category.name}`);
      console.log(res);
    } catch (e) {
      console.log(`Failed to update`, err);
    }
  }
};

const initializeCategories = async () => {
  const SoundcastsCategory = database.Category;
  const Category = database.TempCategory;

  const existingCategories = await Category.all();
  if (existingCategories.length) {
    return existingCategories;
  }

  const uniqueCategoriesEntries = await SoundcastsCategory.aggregate(
    'name',
    'distinct',
    { plain: false }
  );
  console.log(`${uniqueCategoriesEntries.length} nique category names found.`);

  const categories = uniqueCategoriesEntries.map((c, i) => {
    const category = Category.create({ id: i, name: c.distinct });
    return category;
  });
  return await Promise.all(categories);
};

fixCategories()
  .then(() => console.log('Finished'))
  .catch(err => console.log('Failed', err));
