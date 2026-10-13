const express = require('express');
const {
  parseId,
  validateCreateInput,
  validateUpdateInput,
  validateListQuery,
  validateReorderInput,
} = require('../validation/item-validation');

function createItemsRouter(itemsService) {
  const router = express.Router();

  router.get('/', (req, res) => {
    res.json(itemsService.list(validateListQuery(req.query)));
  });

  router.post('/', (req, res) => {
    res.status(201).json(itemsService.create(validateCreateInput(req.body)));
  });

  router.post('/reorder', (req, res) => {
    itemsService.reorder(validateReorderInput(req.body));
    res.json({ message: 'Items reordered' });
  });

  router.delete('/completed', (req, res) => {
    const count = itemsService.removeCompleted();
    res.json({ message: 'Completed items deleted successfully', count });
  });

  router.get('/:id', (req, res) => {
    res.json(itemsService.get(parseId(req.params.id)));
  });

  router.patch('/:id', (req, res) => {
    const id = parseId(req.params.id);
    res.json(itemsService.update(id, validateUpdateInput(req.body)));
  });

  router.post('/:id/duplicate', (req, res) => {
    res.status(201).json(itemsService.duplicate(parseId(req.params.id)));
  });

  router.delete('/:id', (req, res) => {
    const id = parseId(req.params.id);
    itemsService.remove(id);
    res.json({ message: 'Item deleted successfully', id });
  });

  return router;
}

module.exports = { createItemsRouter };
