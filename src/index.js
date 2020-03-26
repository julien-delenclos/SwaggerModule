import swaggerUi from 'swagger-ui-express'
import swaggerJSDoc from 'swagger-jsdoc'
import path from 'path'

class SwaggerModule {
  config = {
    info: 'Title',
    basePath: '/',
    routesDirectory: '',
    visibility: [],
    access: []
  }

  options = {}

  constructor(config) {
    Object.assign(this.config, config)
    this.options = {
      swaggerDefinition: {
        info: this.config.info,
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
    let swaggerSpecAdmin = this.filterAccess(swaggerJSDoc(this.options))
    app.use('/_', swaggerUi.serve, swaggerUi.setup(swaggerSpecAdmin))

    let swaggerSpec = this.filterVisibility(swaggerJSDoc(this.options))
    app.use('/', swaggerUi.serve, swaggerUi.setup(swaggerSpec))
  }
}

module.exports = SwaggerModule