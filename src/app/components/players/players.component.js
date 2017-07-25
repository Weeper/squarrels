import controller from './players.controller.js';

export const PlayersComponent = {
	bindings: {
		// pc: '='
	},
	controller,
	controllerAs: 'playersCtrl',
	templateUrl: 'components/players/players.tpl.html'
};
