const { Router } = require('express');
const { body, validationResult } = require('express-validator');
const { createMovie, updateMovie, deleteMovieById, likeMovie, getAllMyAdditions } = require('../services/movie');
const { parseError } = require('../util');
const { isUser } = require('../middlewares/guards');
const { decodeToken } = require('../services/jwt');

const movieRouter = Router();


movieRouter.post('/create', isUser(),
    body('name').trim().isLength({ min: 4 }).withMessage('Name should be at least 4 characters long!'),
    body('image').trim().isURL({ require_tld: false, require_protocol: true }).withMessage('Image should be start with http:// or https://!'),
    body('rating').trim().isLength({ min: 1, max: 5 }).withMessage('Rating should be a non-negative number between 1 and 5!'),
    body('description').trim().isLength({ min: 10 }).withMessage('Description should be at least 10 characters long!'),
    body('review').trim().isLength({ min: 10 }).withMessage('Review should be at least 10 characters long!'),
    body('category').trim(),
    async (req, res) => {
        const userData = decodeToken(req);
        const userId = userData?._id.toString();

        try {
            const validation = validationResult(req);
            if (validation.errors.length) {
                throw validation.errors;
            }
            const result = await createMovie(req.body, userId);
            res.json(result);
        } catch (error) {
            const parsed = parseError(error).errors;
            res.status(400).json({ code: 400, message: parsed.message });
        }
    });

movieRouter.put('/edit/:id', isUser(),
    body('name').trim().isLength({ min: 4 }).withMessage('Name should be at least 4 characters long!'),
    body('image').trim().isURL({ require_tld: false, require_protocol: true }).withMessage('Image should be start with http:// or https://!'),
    body('rating').trim().isLength({ min: 1, max: 5 }).withMessage('Rating should be a non-negative number between 1 and 5!'),
    body('description').trim().isLength({ min: 10 }).withMessage('Description should be at least 10 characters long!'),
    body('review').trim().isLength({ min: 10 }).withMessage('Review should be at least 10 characters long!'),
    body('category').trim(),
    async (req, res) => {
        const userData = decodeToken(req);
        const userId = userData._id.toString();
        try {
            const validation = validationResult(req);

            if (validation.errors.length) {
                throw validation.errors;
            }

            const result = await updateMovie(req.params.id, req.body, userId);
            res.json(result);

        } catch (error) {
            const parsed = parseError(error).errors;
            res.status(400).json({ code: 400, message: parsed.message });
        }
    });

movieRouter.delete('/delete/:id', isUser(), async (req, res) => {
    const movieId = req.params.id;
    const userData = decodeToken(req);
    const userId = userData._id.toString();
    try {
        await deleteMovieById(movieId, userId);
        res.status(204).end();
    } catch (error) {
        if (error.message == 'Access denied!') {
            res.status(403).json({ code: 403, message: 'Access denied!' });
        } else if (error instanceof ReferenceError) {
            res.status(404).json({ code: 404, message: 'Item not found!' });
        } else {
            res.status(400).json({ code: 400, message: parseError(error).message });
        }
    }
});

movieRouter.post('/like/:id', async (req, res) => {
    const movieId = req.params.id;
    const userId = req.body.userId
    try {

        const result = await likeMovie(movieId, userId);
        res.json(result);
    } catch (error) {
        res.json({ errors: parseError(error).errors });
    }
});

movieRouter.get('/profile', isUser(), async (req, res) => {
    const userData = decodeToken(req);
    const userId = userData._id.toString();
    const movies = await getAllMyAdditions(userId);
    const email = userData.email.toString();
    res.json({ movies, email });
});

module.exports = { movieRouter };