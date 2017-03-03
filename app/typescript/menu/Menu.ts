/// <reference path="../../definitions/jquery/jquery.d.ts" />
import $ = require('jquery');


interface $Elements{
	container:JQuery;
	items : JQuery;
	slider: JQuery;
}

export class Menu {

	
	private $$ = <$Elements>{};
	constructor(){
		this
		.cacheElements()
		.init();
	}

	cacheElements():this{
		const {$$}= this;
		$$.slider= $(".menu_slider");
		$$.items = $(".menu_item",$$.slider);
		return this;
	}

	init():this{
	const {$$}=this;
		console.log("menu_item");
		console.log($$.items);
		$($$.items[0]).addClass('prev');
		$($$.items[1]).addClass('selected');
		$($$.items[2]).addClass('next');
		return this;

	}
}
