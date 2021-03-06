import { GamesApiService } from './api/gamesApi.service';
import { PlayersApiService } from './api/playersApi.service';
import { SoundsService } from './sounds/sounds.service';
import { UtilsService } from './utils/utils.service';
import { WebSocketService } from './websocket/websocket.service';

export default angular
	.module('shared', [])
	.service('gamesApi', GamesApiService)
	.service('playersApi', PlayersApiService)
	.service('sounds', SoundsService)
	.service('utils', UtilsService)
	.service('websocket', WebSocketService)
;
