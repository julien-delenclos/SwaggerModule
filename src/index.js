import swaggerUi from 'swagger-ui-express'
import swaggerJSDoc from 'swagger-jsdoc'
import path from 'path'

class SwaggerModule {

  config = {
    title: 'Title',
    version: '1.0',
    basePath: '/',
    routesDirectory: '',
    visibility: [],
    access: []
  }

  options = {}

  /**
   * @param {Object} config
   * @param {string} config.title Title
   * @param {string} config.version Version
   * @param {string} config.basePath Base path
   * @param {string} config.routesDirectory Absolute path
   * @param {string[]} config.visibility Array of visibility tag allowed
   * @param {string[]} config.access Array of access tag allowed
   */
  constructor(config) {
    Object.assign(this.config, config)
    this.options = {
      swaggerDefinition: {
        info: {
          title: this.config.title,
          version: this.config.version
        },
        basePath: this.config.basePath
      },
      apis: [path.resolve(this.config.routesDirectory) + '/*.js', '../../*.js.LICENSE']
    }
  }

  filterVisibility(swaggerSpec) {
    return this.filterSpec(swaggerSpec, 'visibility')
  }

  filterAccess(swaggerSpec) {
    return this.filterSpec(swaggerSpec, 'access')
  }

  filterSpec(swaggerSpec, key) {
    let swaggerSpecDefinitions = []
    Object.keys(swaggerSpec.paths).forEach((element) => {
      if(swaggerSpec.paths[element][`x-${key}`] && !this.config[key].some(p => swaggerSpec.paths[element][`x-${key}`].includes(p))){
        delete swaggerSpec.paths[element]
      }
      else {
        let results = []
        this.searchProperty(swaggerSpec.paths[element], '$ref', results)
        results.forEach(r => swaggerSpecDefinitions.push(r))
      }
    })

    swaggerSpec.definitions = this.getElements(swaggerSpec.definitions, swaggerSpecDefinitions)

    return swaggerSpec
  }

  searchProperty(obj, search, results, depth = 0) {
    for(var p in obj){
      if (Object.prototype.hasOwnProperty.call(obj, p)){
        if(typeof obj[p] == 'function') continue
        if(p == search){
          results.push(obj[p])
          continue
        }
        if(typeof obj[p] == 'object' && depth < 7){
          this.searchProperty(obj[p], search, results, depth+1)
        }
      }
    }
  }

  getElements(spec, elements, results = {}) {
		elements.map(d => d.split('/')[d.split('/').length-1]).forEach(element => {
			results[element] = spec[element]
			let refs = []
			this.searchProperty(spec[element], '$ref', refs)
			if(refs.length > 0) this.getElements(spec, refs, results)
		})		
		return results
	}

  createSecurityRoute(app) {
    let swaggerSpec = swaggerJSDoc(this.options)

    app.all('*', (req,res,next) => {
      let products = swaggerSpec.paths[req.path] ? swaggerSpec.paths[req.path]['x-access'] : null
      if(products == undefined || this.config.access.some(p => products.includes(p))){
        next()
      }
      else {
        res.send('Bad serial')
      }
    })
  }

  createSwaggerRoute(app) {
    let swaggerSpec = this.filterVisibility(swaggerJSDoc(this.options))
    let swaggerSpecAdmin = this.filterAccess(swaggerJSDoc(this.options))

    app.get("/swagger.json", (req, res) => {
      res.setHeader("Content-Type", "application/json");
      res.send(swaggerSpec);
    });
    
    app.get("/_swagger.json", (req, res) => {
      res.setHeader("Content-Type", "application/json");
      res.send(swaggerSpecAdmin);
    });

    app.use('/', swaggerUi.serve, swaggerUi.setup(null, {
      explorer: true,
      swaggerOptions: {
        url: '/swagger.json',
      }
    }))
  }
}

module.exports = SwaggerModule