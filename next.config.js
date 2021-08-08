const { MONGO_USR, MONGO_SECRET } = process.env;

module.exports = {
    env: {
      MONGO_URL: 'mongodb+srv://'+MONGO_USR+':'+MONGO_SECRET+'@cluster0.jakm5.mongodb.net/myFirstDatabase?retryWrites=true&w=majority',
      productionBrowserSourceMaps: true,
      reactStrictMode: true,
    },
  }