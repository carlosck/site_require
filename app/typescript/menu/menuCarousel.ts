/// <reference path="../../definitions/jquery/jquery.d.ts" />
/// <reference path="../../definitions/greensock/greensock.d.ts" />
/// <reference path="../../definitions/hammerjs/hammerjs.d.ts" />
/// <reference path="../components/carousel/Carousel.ts" />
/// <amd-dependency path="TweenMax">
/// <amd-dependency path="jquery.hammer">

import { Carousel, CarouselInput, CarouselSet } from '../components/carousel/Carousel';


export class MenuCarousel {

	private carousel:  Carousel;
	private $slides: JQuery;	
	private nameContext: string;

	constructor ( nameContext: string ) {

		this.nameContext = nameContext;
		this.$slides = $( nameContext + ' .js-history__slide' );		

		this.bindCarousel();
	}

	private bindCarousel() {

		if( this.$slides.length <= 1 ) { return; }

		this.carousel = new Carousel( {
			$slides: this.$slides,
		});

		this.carousel
			.on('back', input => this.transitionHandler( input, false ) )
			.on('next', input => this.transitionHandler( input, true ) );


		$( document )
            .on( 'click touched', this.nameContext + ' .o-carousel__slide--back', ( e ) => { this.carousel.back() } )
            .on( 'click touched', this.nameContext + ' .o-carousel__slide--next', ( e ) => { this.carousel.next() } )
            .on( 'click touched', this.nameContext + ' .o-carousel__slide--active', ( e ) => { this.carousel.next() } );
	}

	private transitionHandler( input: CarouselInput, movingForward: boolean ) {


		const easeIn = Cubic.easeInOut;
        const time = 0.75;

        // slides
        const sXActiveFrom = movingForward ? '80%' : '-80%';
        const sXBackFrom = movingForward ? '0%' : '-200%';
        const sXNextFrom = movingForward ? '200%' : '0%';

        // slide comodin
        const sComodin = movingForward ? this.carousel.getSlidesBehind(2)[1] : this.carousel.getSlidesForward(2)[1];
        const sXComodinFrom = movingForward ? '-80%' : '80%';
        const sXComodinTo = movingForward ? '-200%' : '200%';

        // slides
        TweenMax.fromTo(input.currentSet.$slideActive, time, { left: sXActiveFrom, ease: easeIn }, { left: '0%', ease: easeIn });
        TweenMax.fromTo(input.currentSet.$slideBack, time, { left: sXBackFrom, ease: easeIn }, { left: '-80%', ease: easeIn });
        TweenMax.fromTo(input.currentSet.$slideNext, time, { left: sXNextFrom, ease: easeIn }, { left: '80%', ease: easeIn });
        // slide comodin
        TweenMax.fromTo(sComodin, time, { left: sXComodinFrom, ease: easeIn }, { left: sXComodinTo, ease: easeIn });


        //this.$yearColor.css({'color': input.currentSet.$slideActive.data('color') });
		
		//setTimeout(() => {this.$year.text(input.currentSet.$slideActive.data('year'));}, time*500);
	}
}

