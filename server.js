
// Only for test backoffice behaviours
// Do not use in production
const express = require('express');
const app = express();

app.use('/bower_components', express.static('bower_components'));
app.use(express.static('dist'));


app.listen(8282, () => {
});
