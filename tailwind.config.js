module.exports = {
  purge: {
    mode: 'layers',
    layers: ['components', 'utilities'],
    content: [
      './public/index.html'
    ]
  }
};
