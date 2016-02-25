// Copyright (C) 2016 Goom Inc. All rights reserved.

// Only for test backoffice behaviours. Please do not use this in production.
const express = require('express');
const app = express();
const port = 8282;

app.use('/bower_components', express.static('bower_components'));
app.use(express.static('dist'));

app.listen(port, () => {});
console.log('Server is listening on', port);
