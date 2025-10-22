const express = require('express');
const router = express.Router();
const favoriteController = require('../controllers/favoriteController');

router.get('/', favoriteController.getAllFavorites);
router.post('/', favoriteController.addFavorite);
router.delete('/:id', favoriteController.deleteFavorite);

module.exports = router;