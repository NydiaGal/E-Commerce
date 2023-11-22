const router = require('express').Router();
const { Product, Category, Tag, ProductTag } = require('../../models');

// The `/api/products` endpoint
// get all products
router.get('/', async (req, res) => {
  try {
    const products = await Product.findAll({
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
    res.status(200).json(products);
  } catch (err) {
    res.status(500).json({ message: 'Internal server unable to find the products.'});
  }
});

// get one product
router.get('/:id', async (req, res) => {
  try {
    const product = await Product.findByPk(req.params.id, {
      include: [{ model: Category }, { model: Tag }],
    });
    !product
      ? res.status(404).json({ message: 'The product requested was not found.' })
      : res.status(200).json(product);
  } catch (err) {
    res.status(500).json({ message: 'Internal server unable to locate the product requested.' });
  }
});
// create new product
router.post('/', (req, res) => {
  Product.create(req.body)
    .then((product) => {
      if (req.body.tagIds.length) {
        const newProduct = req.body.tagIds.map((tag_id) => {
          return {
            product_id: product.id,tag_id,
            };
          });
          return ProductTag.bulkCreate(newProduct);
        }
        res.status(200).json(product);
      })
      .then((newProduct) => res.status(200).json(newProduct))
      .catch((err) => {
        res.status(400).json({ message: 'Unable to create a new product', error: err });
      });
    });

  /* req.body should look like this...
    {
      product_name: "Basketball",
      price: 200.00,
      stock: 3,
      tagIds: [1, 2, 3, 4]
    }
  */
    router.post('/', (req, res) => {
      Product.create(req.body)
        .then((product) => {
          if (req.body.tagIds.length) {
            const productTagIds = req.body.tagIds.map((tag_id) => {
              return {
                product_id: product.id,
                tag_id,
              };
            });
            return ProductTag.bulkCreate(productTagIds);
          }
          res.status(200).json(product);
        })
        .then((productTagIds) => res.status(200).json(productTagIds))
        .catch((err) => {
          res.status(400).json({ message: 'Unable to create a new product.', error: err });
        });
    });

// update product
router.put('/:id', async (req, res) => {
  try {
    await Product.update(req.body, { where: { id: req.params.id } });

    // Check if req.body.tags exists and has some length
    if (req.body.tags && req.body.tags.length > 0) {
      // Retrieve product tags and their IDs
      const productTags = await ProductTag.findAll({ where: { product_id: req.params.id } });
      const productTagIds = productTags.map(({ tag_id }) => tag_id);

      // Filter new product tags and create new ones
      const newProductTags = req.body.tags
        .filter((tag_id) => !productTagIds.includes(tag_id))
        .map((tag_id) => {
          return {
            product_id: req.params.id,tag_id,
          };
        });
         // Filter product tags to remove and delete them
      const productTagsToRemove = productTags
      .filter(({ tag_id }) => !req.body.tags.includes(tag_id))
      .map(({ id }) => id);

    await Promise.all([
      ProductTag.destroy({ where: { id: productTagsToRemove } }),
      ProductTag.bulkCreate(newProductTags),
    ]);
  }

  // Respond with updated product
  const productUpdate = await Product.findByPk(req.params.id, { include: [{ model: Tag }] });
  return res.json(productUpdate);
} catch (error) {
  console.log(error);
  return res.status(500).json({ message: 'Product was not updated. Try again.', error: err });
}
});

router.delete('/:id', async (req, res) => {
  try {
    const deleteProduct = await Product.destroy({ where: { id: req.params.id } });
    !deleteProduct
      ? res.status(404).json({ message: 'Product Id was not found.' })
      : res.status(200).json(deleteProduct);
  } catch (err) {
    res.status(500).json({ message: 'Product was not deleted. Try again.', error: err });
  }
});

module.exports = router;
