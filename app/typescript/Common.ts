import {Este} from './menu/Test';

class Common {
	private test: Este ;

	constructor() {
		console.log("constr");
		this.test = new Este();
		this.init();
	}
	private init():this {
		console.log("init");
		return this;
	}
}