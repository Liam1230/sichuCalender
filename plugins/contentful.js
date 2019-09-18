const contentful = require('contentful')

const defaultConfig = {
  space: 'ejz5bareyuf4',
  accessToken: 'njQxSZ6m-7mM7bNMNGkPNlitQGT6-kz6hSzC2cCPkpk'
}

const client = contentful.createClient(defaultConfig);

export default function(app,inject){
  inject('contentful',client)
}