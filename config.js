// Copyright (C) 2016 Goom Inc. All rights reserved.

const defaultConfig = {
  api: {
    url: '',
  },
  build: {
    output: 'dist/duo',
  },
};

const environmentConfig = {
  development: {
    api: {
      url: 'http://localhost:8080',
    },
  },
}[process.env.NODE_ENV || 'development'];

module.exports = Object.assign(defaultConfig, environmentConfig);
