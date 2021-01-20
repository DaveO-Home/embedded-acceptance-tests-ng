const Koa = require("koa");
const serve = require("koa-static");
const path = require("path");
const http = require("http");
const logger = require("koa-logger");
const app = new Koa();

app.use(async (ctx, next) => {
    const start = Date.now();
    await next();
    const ms = Date.now() - start;
    ctx.set("X-Response-Time", `${ms}ms`);
});

app.use(serve(path.join(__dirname, "./allure-report")));
app.use(serve(path.join(__dirname, "public")));
app.use(logger());

const server = http.createServer(app.callback());

const port = process.env.PORT || 3080;

app.listen(port, function listening() {
    console.info(`Listening on ${port}`);
});
