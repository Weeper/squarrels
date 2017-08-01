export
default class PlayersController {
	constructor($rootScope, $scope, $localStorage, $log, utils, websocket, playersStore, playerModel) {
		'ngInject';

		var self = this;

		this.$rootScope = $rootScope;
		this.$scope = $scope;
		this.$localStorage = $localStorage;
		this.$log = $log;

		this.utils = utils;
		this.playerModel = playerModel;
		this.playersStore = playersStore;
		this.ws = websocket;

		this.$log.info('constructor()', this);
	}

	$onInit() {
		var self = this,
			onSuccess = function(res) {
				var activePlayer = self.$localStorage.player;

				self.$log.info('onSuccess()', res, self);

				if (res.status === 200) {
					self.playersStore.model.players = res.data;

					self.$log.info('players', self.playersStore.model.players);
				}

				self.$log.info('player', activePlayer);

				if (activePlayer && self.playersStore.get(activePlayer._id)) {
					self.playerModel.setPlayer(activePlayer);
				}
			},
			onError = function(res) {
				self.$log.error(res);
			};

		this.$scope.playerData = this.playerModel.model;
		this.$scope.model = this.playersStore.model;

		this.$rootScope.$on('websocket', function(event, data) {
			self.$log.info('$on -> websocket', data);
		});

		this.$rootScope.$on('websocket:player:create', function(event, data) {
			self.$log.info('$on -> websocket:player:create', data);
			self.playersStore.update('add', data);
		});

		this.playersStore.loadAll().then(onSuccess, onError);

		this.$log.info('$onInit()', this);
	}

	$onDestroy() {
		return () => {
			this.$log.info('destroy', this);
		};
	}

	create() {
		var self = this,
			data = {
				name: this.utils.getRandomStr(8),
				// img will be set to default on server
			},
			canvas = angular.element('<canvas/>')[0],
			ctx = canvas.getContext('2d'),
			video = this.$scope.webcam.video,
			onSuccess = function(res) {
				self.$log.info(res);

				if (res.status === 201) {
					self.playersStore.update('create', res.data);
				}
			},
			onError = function(res) {
				self.$log.error(res);
			};

		canvas.width = 120;
		canvas.height = 120;

		if (video) {
			ctx.drawImage(video, 0, 0, 120, 120);
			data.img = canvas.toDataURL();
		}

		this.playersStore
			.insert(data)
			.then(onSuccess, onError);
	}
};