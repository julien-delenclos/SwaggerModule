const ExpressApp = require('expressstarter')
const SwaggerModule = require('../index')

let swagger = new SwaggerModule({
  routesDirectory: __dirname + '/routes',
  visibility: ['order'],
  access: ['order']
})

let expressApp = new ExpressApp({
  routes: app => {
    swagger.createSecurityRoute(app)
    require('./routes')(app)
    swagger.createSwaggerRoute(app)
  },
})

expressApp.start()