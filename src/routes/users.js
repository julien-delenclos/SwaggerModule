

module.exports = app => {
  
	/**
	 * @swagger
	 * /api:
	 *   x-access:
	 *     - order
	 *   x-visibility:
	 *     - order
	 *   get:
	 *     tags:
	 *       - Tour
	 *     description: Vérification de l'ajout des ordres
	 *     produces:
	 *       - application/json
	 *     responses:
	 *       200:
	 *         description: Réponse en JSON
	 */
  app.get('/api', (req, res, next) => {
    res.send('respond with a resource');
	})
	
	/**
	 * @swagger
	 * /private:
	 *   x-access:
	 *     - order
	 *   x-visibility:
	 *     - ptv
	 *   get:
	 *     tags:
	 *       - Tour
	 *     description: Vérification de l'ajout des ordres
	 *     produces:
	 *       - application/json
	 *     responses:
	 *       200:
	 *         description: Réponse en JSON
	 */
  app.get('/private', (req, res, next) => {
    res.send('private');
  })
	
	/**
	 * @swagger
	 * /internal:
	 *   x-access:
	 *     - ptv
	 *   x-visibility:
	 *     - ptv
	 *   get:
	 *     tags:
	 *       - Tour
	 *     description: Vérification de l'ajout des ordres
	 *     produces:
	 *       - application/json
	 *     responses:
	 *       200:
	 *         description: Réponse en JSON
	 */
  app.get('/internal', (req, res, next) => {
    res.send('internal');
  })
}