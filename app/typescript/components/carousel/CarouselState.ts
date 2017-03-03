/// <reference path="../../../definitions/lodash/lodash.d.ts" />

import _extend = require('lodash/extend');
import _filter = require('lodash/filter');
import _indexOf = require('lodash/indexOf');

export type Index = number | '+1' | '-1';

export interface CarouselStateOpts {
    itemArr: CarouselStateItem[];
    infinite?: boolean;
}

export interface CarouselStateItem {
    index: number;
    isActive: boolean;
}

/**
 * State logic of a Carousel
 */
export class CarouselState {

    /** Default Options */
    private defs = {
        itemArr: [],
        infinite: true
    };

    private opts: CarouselStateOpts;
    private itemArr: CarouselStateItem[];
    private itemActive: CarouselStateItem;

    constructor(opts: CarouselStateOpts) {

        // Validate itemArr
        if (opts.itemArr.length === 0) return;

        // Merge defaults with user options
        this.opts = _extend({}, this.defs, opts);
        this.itemArr = opts.itemArr;

        // Look for user defined item active, or activate first
        this.itemActive = _filter(opts.itemArr, x => x.isActive)[0];
        if (!this.itemActive) {
            this.setItemActive(0);
        }
    }

    setItemActive(index: Index) {

        const { itemActive } = this;
        const itemTarget = this.getItem(index);

        // Abort if already active
        if (itemTarget !== itemActive) {

            // Deactivate current active
            if (itemActive) { itemActive.isActive = false; }
            // Activate target
            itemTarget.isActive = true;
            this.itemActive = itemTarget;
        }
    }

    getItem(index: Index): CarouselStateItem {

        const i = this.getIndex(index);
        return this.itemArr[i];
    }

    getItemActive(): CarouselStateItem {

        return this.itemActive;
    }

    getItemBack(): CarouselStateItem {

        return this.getItem('-1');
    }

    getItemNext(): CarouselStateItem {

        return this.getItem('+1');
    }

    private getIndex(index: Index) {

        const { opts, itemArr } = this;
        const l = itemArr.length;
        let i = this.normalizeIndex(index);

        // Infinite
        if (opts.infinite) {
            if (i >= 0) { return i % l; }
            return l - (-i % l || l);
        }
        // Non-infinite
        else {
            if (i < 0) { return 0; }
            if (i >= l - 1) { return l - 1; }
            return i;
        }
    }

    private normalizeIndex(index: Index) {

        const { itemActive, itemArr } = this;
        const activeIndex = _indexOf(itemArr, itemActive);
        let i: number;

        if (typeof index === 'number') {
            i = index;
        }
        else if (index === '-1') {
            i = activeIndex - 1;
        }
        else if (index === '+1') {
            i = activeIndex + 1;
        }

        return i;
    }
}
