const router = require('express').Router();
const { Category, Product } = require('../../models');

// The `/api/categories` endpoint
router.get('/', async (req, res) => {
  try {
    const categories = await Category.findAll({ 
      include: [{model: Category}],
      attributes: {
      include: [
        [
          sequelize.literal(
            '(SELECT * FROM Category INNER JOIN Product ON Category.id = Product.category_id)'
          ),
          'categoryTotal',
        ],
      ],
    },
  });
  res.status(200).json(categories);
} catch (err) {
  res.status(500).json(err);
}
});
 

router.get('/:id', async (req, res) => {
    try {
      const category = await Category.findByPk(req.params.id,{ 
      include: [{model: Product}] [{model: Category}],
      attributes: {
      include: [
        [
          sequelize.literal(
            '(SELECT * FROM Category INNER JOIN Product ON Category.id = Product.category_id)'
          ),
          'category_ID',
        ],
      ],
    },
  });
      res.status(200).json(category);
      } catch (err) {
      res.status(500).json({ message: 'Internal server unable to find.' });
    }
  });
 
 // create a new category
router.post('/', async (req, res) => {
  try {
    const newCategory = await Category.create(req.body)({ 
      include: [{model: Product}],
      attributes: {
      include: [
        [
          sequelize.literal(
            '(INSERT FROM Category INNER JOIN Product ON Category.id = Product.category_id)'
          ),
          'category_new',
        ],
      ],
    },
  });
    res.status(200).json(category);
    } catch (err) {
    res.status(400).json({ message: 'Unable to create a category' });
  }
});


router.put('/:id', async (req, res) => {
  // update a category by its `id` value
  try {
    const updatedCategory = await Category.update(req.params.id, { 
      where: [{ id: req.params.id }, {model: Product}],
      attributes: {
      include: [
        [
          sequelize.literal(
            '(UPDATE FROM Category INNER JOIN Product ON Category.id = Product.category_id)'
          ),
          'category_update',
        ],
      ],
    },
  });

    res.status(500).json({ message: 'The category update was not successful.' });
  }
});


router.delete('/:category_id', async (req, res) => {
  Category.destroy({
    where: {
      category_id: req,params.category_id,
    }
  })
  .then((deletedCategory) => {
    res.json(deletedCategory);
  })
    catch (err) {
    res.status(500).json(err);
  }
});

module.exports = router;
