/// <amd-dependency path="jquery.hammer">
/// <reference path="../../../definitions/jquery/jquery.d.ts" />
/// <reference path="../../../definitions/hammerjs/hammerjs.d.ts" />
/// <reference path="../../../definitions/lodash/lodash.d.ts" />
/// <reference path="../../../definitions/js-signals/js-signals.d.ts" />

import $ = require('jquery');
import _assignIn = require('lodash/assignIn');
import signals = require('signals');
import { CarouselState, CarouselStateItem, Index } from './CarouselState'

type CarouselHandler = (val: CarouselInput, ...args: any[]) => any;
type CarouselAction = 'back' | 'next';

export interface CarouselOpts {
    $slides: JQuery;
    infinite?: boolean;
    swipe?: boolean;
    cssClasses?: {
        slideActive?: string;
        slideBack?: string;
        slideNext?: string;
        bulletActive?: string;
    },
    controls?: {
        $controlBack?: JQuery;
        $controlNext?: JQuery;
        $bullets?: JQuery;
    }
}

export interface CarouselItem extends CarouselStateItem {
    $slide: JQuery;
    $bullet: JQuery;
}

export interface CarouselSet {
    $slideActive: JQuery;
    $slideBack: JQuery;
    $slideNext: JQuery;
}

export interface CarouselInput {
    previousSet: CarouselSet;
    currentSet: CarouselSet;
}

export class Carousel {

    private ignited: boolean;
    private opts: CarouselOpts;
    private itemArr: CarouselItem[];
    private state: CarouselState;
    private previousSet: CarouselSet;
    private input: CarouselInput;
    private handlerObj: { [key: string]: Signal };

    constructor(opts: CarouselOpts) {

        this.ignited = opts.$slides && opts.$slides.length > 0;

        if (this.ignited) {
            this.handlerObj = {
                back: new signals.Signal(),
                next: new signals.Signal()
            };

            this
                .setOptions(opts)
                .setItemArr()
                .setState()
                .setInput()
                .bindEvents();
        }
    }

    back(): this {

        if (this.ignited) {
            this.goto('-1');
        }

        return this;
    }

    next(): this {

        if (this.ignited) {
            this.goto('+1');
        }

        return this;

    }

    getSlidesBehind(n: number) {

        if (this.ignited && n > 0) {
            return this.getSlidesArr(-n);
        }
    }

    getSlidesForward(n: number) {

        if (this.ignited && n > 0) {
            return this.getSlidesArr(n);
        }
    }

    goto(index: Index): this {

        if (!this.ignited) { return this; }

        const { state } = this;
        const itemTarget = state.getItem(index);
        const itemActive = state.getItemActive();

        // Abort if already active
        if (itemTarget !== itemActive) {

            const { $slides, cssClasses, controls } = this.opts;
            const isMovingForward = itemTarget.index > itemActive.index;

            // Save previous set before..
            this.previousSet = this.getSet();
            // ..update state
            state.setItemActive(index);

            // Remove state classes from slides and bullets
            Carousel
                .removeCssClasses($slides, [
                    cssClasses.slideActive,
                    cssClasses.slideBack,
                    cssClasses.slideNext
                ])
                .removeCssClasses(controls.$bullets, [
                    cssClasses.bulletActive
                ]);

            // Update slides
            this
                .setInput()
                .triggerHandler(index, isMovingForward);
        }

        return this;
    }

    on(action: CarouselAction, handler: CarouselHandler): this {

        if (this.ignited) {
            const { handlerObj } = this;

            // Add handler
            handlerObj[action].add(handler);
        }

        return this;
    }

    once(action: CarouselAction, handler: CarouselHandler): this {

        if (this.ignited) {
            const { handlerObj } = this;

            // Add handler once
            handlerObj[action].addOnce(handler);
        }

        return this;
    }

    off(action: CarouselAction, handler?: CarouselHandler): this {

        if (this.ignited) {
            const { handlerObj } = this;

            if (typeof handler === 'function') {
                // Remove handler passed
                handlerObj[action].remove(handler);
            }
            else {
                // Remove **all** handlers
                handlerObj[action].removeAll();
            }
        }

        return this;
    }

    trigger(action: CarouselAction): this {

        if (this.ignited) {
            const { handlerObj, input } = this;

            // Trigger action
            handlerObj[action].dispatch(input);
        }

        return this;
    }

    destroy(): void {

        this
            .off('back')
            .off('next')
            .unbindEvents();

        this.opts = null;
        this.itemArr = null;
        this.state = null;
        this.input = null;
        this.handlerObj = null;
    }

    private setOptions(opts: CarouselOpts): this {

        const defaults = {
            infinite: true,
            swipe: true,
            cssClasses: {
                slideActive: 'o-carousel__slide--active',
                slideBack: 'o-carousel__slide--back',
                slideNext: 'o-carousel__slide--next',
                bulletActive: 'o-carousel__bullet--active'
            },
            controls: {
                controlBack: null,
                controlNext: null,
                bullets: null
            }
        };

        // Override defaults with user opts
        this.opts = _assignIn({}, defaults, opts);

        return this;
    }

    private setItemArr(): this {

        this.itemArr = [];
        const { $slides, cssClasses, controls } = this.opts;
        const { $bullets } = controls;

        $slides.each((i, elem) => {

            const $slide = $(elem);
            const $bullet = $bullets ? $bullets.filter(`[data-goto="${i}"]`) : null;
            const isActive = $slide.is(`.${cssClasses.slideActive}`);

            const item = {
                index: i,
                isActive: isActive,
                $slide: $slide,
                $bullet: $bullet
            };

            $slide.attr('data-index', i);
            this.itemArr.push(item);
        });

        return this;
    }

    private setState(): this {

        const { itemArr, opts } = this;

        this.state = new CarouselState({
            itemArr: itemArr,
            infinite: opts.infinite
        });

        return this;
    }

    private setInput(): this {

        const { state } = this;
        const { cssClasses } = this.opts;

        // Get items from CarouselState
        const itemActive = <CarouselItem>state.getItemActive();
        const currentSet = this.getSet();

        // Add state classes to slides
        currentSet.$slideActive.addClass(cssClasses.slideActive);
        currentSet.$slideBack.addClass(cssClasses.slideBack);
        currentSet.$slideNext.addClass(cssClasses.slideNext);

        // Add state classes to bullet
        if (itemActive.$bullet) {
            itemActive.$bullet.addClass(cssClasses.bulletActive);
        }

        this.input = {
            previousSet: this.previousSet,
            currentSet: currentSet
        };

        return this;
    }

    private getSet() {

        const { state } = this;
        const itemActive = <CarouselItem>state.getItemActive();
        const itemBack = <CarouselItem>state.getItemBack();
        const itemNext = <CarouselItem>state.getItemNext();

        return {
            $slideActive: itemActive.$slide,
            $slideBack: itemBack.$slide,
            $slideNext: itemNext.$slide
        }
    }

    private bindEvents(): this {

        const { opts } = this;
        const { $slides, controls, swipe } = opts;
        const { $controlBack, $controlNext, $bullets } = controls;

        if ($controlBack) {
            $controlBack.on('click.Carousel', () => this.back());
        }

        if ($controlNext) {
            $controlNext.on('click.Carousel', () => this.next());
        }

        if ($bullets) {
            $bullets.on('click.Carousel', e => {
                const index = $(e.currentTarget).attr('data-goto');
                this.goto(parseInt(index));
            });
        }

        if (swipe) {
            $slides
                .hammer()
                .on('swipeleft.Carousel', () => this.next())
                .on('swiperight.Carousel', () => this.back());
        }

        return this;
    }

    private unbindEvents(): this {

        const { opts } = this;
        const { $slides, controls, swipe } = opts;
        const { $controlBack, $controlNext, $bullets } = controls;

        if ($controlBack) {
            $controlBack.off('click.Carousel');
        }

        if ($controlNext) {
            $controlNext.off('click.Carousel');
        }

        if ($bullets) {
            $bullets.off('click.Carousel');
        }

        if (swipe) {
            $slides
                .hammer()
                .off('swipeleft.Carousel')
                .off('swiperight.Carousel');
        }

        return this;
    }

    private triggerHandler(index: Index, isMovingForward: boolean): this {

        const indexIsInt = typeof index === 'number';

        if (index === '+1' || (indexIsInt && isMovingForward)) {
            this.trigger('next');
        }
        else if (index === '-1' || (indexIsInt && !isMovingForward)) {
            this.trigger('back');
        }

        return this;
    }

    private getSlidesArr(n?: number) {

        const { state } = this;
        const itemActive = state.getItemActive();
        const $slidesArr = <JQuery[]>[];

        for (let i = 0; i < Math.abs(n); i++) {
            const targetIndex = itemActive.index + (n > 0 ? i + 1 : -i - 1);
            const itemTarget = <CarouselItem>state.getItem(targetIndex);
            $slidesArr.push(itemTarget.$slide);
        }

        return $slidesArr;
    }

    private static removeCssClasses($collection: JQuery, cssClasses: string[]) {

        if ($collection && $collection.length > 0) {

            const _cssClasses = cssClasses.map(x => `${x}`).join(' ');
            $collection.removeClass(_cssClasses);
        }

        return this;
    }
}
