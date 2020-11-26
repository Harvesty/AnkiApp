module.exports = {
  publicPath: process.env.NODE_ENV === 'production'
    ? '/AnkiApp/'
    : '/',
  "transpileDependencies": [
    "vuetify"
  ]
}