const fs = require('fs-extra')
const lodash = require('lodash')

const config = require('../postinstall.json').copy_files

lodash.forEach(config, (target, source) => {
    fs.copySync(
        lodash.template(source)(process.env),
        lodash.template(target)(process.env)
    )
})

