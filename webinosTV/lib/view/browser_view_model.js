var _ = require('underscore');

var Bacon = require('baconjs');
var bjq = require('bacon.jquery');

function BrowserViewModel(manager) {
  var peer = bjq.Model(null);
  peer.addSource(manager.filter(function (event) {
    return event.device().isLocal() && event.device().peers().length;
  }).map(function (event) {
    return event.device().peers()[0];
  }));
  this.peer = function () {
    return peer;
  };

  var sources = bjq.Model({});
  sources.addSource(manager.toProperty().map(function (devices) {
    return _.filter(devices, function (device) {
      return device.isSource();
    });
  }));

  this.sources = function () {
    return sources;
  };

  var selectedSources = bjq.Model([]);
  this.selectedSources = function () {
    return selectedSources;
  };

  var categories = bjq.Model([
    {id: 'movies', type: 'Video', title: 'Movies', image: 'images/movie.svg'},
    {id: 'music', type: 'Audio', title: 'Music', image: 'images/music.svg'},
    {id: 'images', type: 'Image', title: 'Images', image: 'images/image.svg'},
    {id: 'images2', type: 'Image', title: 'Images2', image: 'images/image.svg'},
    {id: 'images3', type: 'Image', title: 'Images3', image: 'images/image.svg'},
    {id: 'images4', type: 'Image', title: 'Images4', image: 'images/image.svg'},
    {id: 'images5', type: 'Image', title: 'Images5', image: 'images/image.svg'},
    {id: 'images6', type: 'Image', title: 'Images6', image: 'images/image.svg'},
    // {id: 'channels', type: undefined, title: 'Channels', image: 'images/tv_channels.svg'}
  ]);
  this.categories = function () {
    return categories;
  };

  var selectedCategories = bjq.Model([]);
  this.selectedCategories = function () {
    return selectedCategories;
  };

  var content = bjq.Model([]);
  content.addSource(Bacon.combineTemplate({
    sources: sources, selectedSources: selectedSources,
    categories: categories, selectedCategories: selectedCategories
  }).map(function (state) {
    var types = _.map(state.selectedCategories, function (id) {
      return id ? _.findWhere(state.categories, {id: id}).type : id;
    });
    return _.chain(state.sources).filter(function (source) {
      return !state.selectedSources.length || _.contains(state.selectedSources, source.address());
    }).map(function (source) {
      return _.chain(source.content()['media']).filter(function (item) {
        return !types.length || _.contains(types, item.type);
      }).map(function (item) {
        return {source: source, item: item};
      }).value();
    }).flatten().value();
  }));

  this.content = function () {
    return content;
  };

  var selectedContent = bjq.Model([]);
  this.selectedContent = function () {
    return selectedContent;
  };

  var targets = bjq.Model({});
  targets.addSource(manager.toProperty().map(function (devices) {
    return _.filter(devices, function (device) {
      return device.isTarget();
    });
  }));

  this.targets = function () {
    return targets;
  };

  var selectedTargets = bjq.Model([]);
  this.selectedTargets = function () {
    return selectedTargets;
  };

  var selectedPeer = bjq.Model(null);
  selectedPeer.addSource(Bacon.combineTemplate({
    devices: manager.toProperty(),
    selectedTargets: selectedTargets
  }).map(function (state) {
    if (!state.selectedTargets.length || state.selectedTargets.length > 1) return null;
    return state.devices[state.selectedTargets[0]].peers()[0];
  }));
  this.selectedPeer = function () {
    return selectedPeer;
  };

  var prepend = new Bacon.Bus();
  this.prepend = function () {
    return prepend;
  };

  var append = new Bacon.Bus();
  this.append = function () {
    return append;
  };
}

module.exports = BrowserViewModel;
