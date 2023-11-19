const router = require('express').Router();
const { Category, Product } = require('../../models');

// The `/api/categories` endpoint
router.get('./', async (req, resp) => {
  try {
    const categories = await Category.findAll({ include: [{model: Product}] });
    res.status(200).json(categories);
  } catch (err) {
    res.status(500).json({ message: 'Internal server unable to find.'});
    }
  });

router.get('./:id', async (req, resp) => {
    try {
      const category = await Category.findByPk({ include: [{model: Product}] });
      if (!category) {
        res.status(404).json({ message: 'The ID was not found' });
        return;
      }
      res.status(200).json(category);
    } catch (err) {
      res.status(500).json({ message: 'Internal server unable to find.' });
    }
  });
 
 // create a new category
router.post('./', async (req, resp) => {
  try {
    const newCategory = await Category.create(req.body);
    res.status(200).json(category);
  } catch (err) {
    res.status(400).json({ message: 'Unable to create a category' });
  }
});


router.put('/:id', async (req, res) => {
  // update a category by its `id` value
  try {
    const updatedCategory = await Category.update(req.body, { where: { id: req.params.id } });

    !updatedCategory[0] ? res.status(404).json({ message: 'The cateogory id was not found.' }) : res.status(200).json(updated);
  } catch (err) {

    res.status(500).json({ message: 'The category update was not successful.' });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    const deleteCategory = await Category.destroy({ where: { id: req.params.id } });

    !deleteCategory ? res.status(404).json({ message: 'The category id was not found.' }) : res.status(200).json(deleted);
  } 
  catch (err) {
    res.status(500).json(err);
  }
});

module.exports = router;
